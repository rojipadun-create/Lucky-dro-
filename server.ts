import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import type { Room, Player, ClientAction, ServerMessage, GameStatus, RoundHistoryItem, ChatMessage } from './src/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

const PORT = 3000;
const isProd = process.env.NODE_ENV === 'production';

// Player colors for wheel slices
const PLAYER_COLORS = [
  '#E11D48', // Crimson Red
  '#F59E0B', // Amber Gold
  '#06B6D4', // Cyan
  '#8B5CF6', // Purple
  '#10B981', // Emerald
  '#F43F5E', // Rose
  '#3B82F6', // Blue
  '#EC4899', // Pink
];

interface ConnectedClient {
  ws: WebSocket;
  playerId: string;
  roomCode: string | null;
  playerData: {
    name: string;
    avatar: string;
    coins: number;
  };
}

const clients = new Map<WebSocket, ConnectedClient>();
const rooms = new Map<string, Room>();
const roomTimers = new Map<string, NodeJS.Timeout>();

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function getPublicRoomList() {
  const list: Array<{
    code: string;
    name: string;
    playersCount: number;
    maxPlayers: number;
    entryFee: number;
    status: GameStatus;
  }> = [];

  rooms.forEach((room) => {
    list.push({
      code: room.code,
      name: room.name,
      playersCount: room.players.length,
      maxPlayers: room.maxPlayers,
      entryFee: room.entryFee,
      status: room.status,
    });
  });

  return list;
}

function broadcastRoomList() {
  const listMsg: ServerMessage = {
    type: 'room_list',
    rooms: getPublicRoomList(),
  };
  const json = JSON.stringify(listMsg);
  clients.forEach((client) => {
    if (client.ws.readyState === WebSocket.OPEN && !client.roomCode) {
      client.ws.send(json);
    }
  });
}

function broadcastToRoom(roomCode: string, msg: ServerMessage) {
  const json = JSON.stringify(msg);
  clients.forEach((client) => {
    if (client.roomCode === roomCode && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(json);
    }
  });
}

function syncRoomToAll(roomCode: string) {
  const room = rooms.get(roomCode);
  if (!room) return;

  clients.forEach((client) => {
    if (client.roomCode === roomCode && client.ws.readyState === WebSocket.OPEN) {
      const msg: ServerMessage = {
        type: 'sync_room',
        room,
        myPlayerId: client.playerId,
      };
      client.ws.send(JSON.stringify(msg));
    }
  });
}

function startSpin(roomCode: string) {
  const room = rooms.get(roomCode);
  if (!room || room.players.length < 2 || room.status === 'spinning') return;

  // Filter players who placed bets or active players
  const activePlayers = room.players.filter((p) => p.betAmount > 0);
  const eligiblePlayers = activePlayers.length >= 2 ? activePlayers : room.players;

  const totalPot = eligiblePlayers.reduce((sum, p) => sum + Math.max(p.betAmount, room.entryFee || 10), 0);
  room.pot = totalPot;

  // Select winner randomly based on bet weights
  const totalWeight = eligiblePlayers.reduce((sum, p) => sum + Math.max(p.betAmount, 10), 0);
  let randomVal = Math.random() * totalWeight;
  let winner = eligiblePlayers[0];

  for (const p of eligiblePlayers) {
    const weight = Math.max(p.betAmount, 10);
    if (randomVal <= weight) {
      winner = p;
      break;
    }
    randomVal -= weight;
  }

  // Calculate winner slice angle
  // Let's calculate angle range for winner
  let currentAngle = 0;
  let winnerStartAngle = 0;
  let winnerEndAngle = 360;

  for (const p of eligiblePlayers) {
    const sliceAngle = (Math.max(p.betAmount, 10) / totalWeight) * 360;
    if (p.id === winner.id) {
      winnerStartAngle = currentAngle;
      winnerEndAngle = currentAngle + sliceAngle;
      break;
    }
    currentAngle += sliceAngle;
  }

  // Pick an angle inside the winner slice (with margin so pointer lands clearly inside)
  const sliceMid = winnerStartAngle + (winnerEndAngle - winnerStartAngle) * 0.5;
  // Pointer is at TOP (270 deg or 90 deg depending on orientation). Let pointer be at TOP (0 degrees / 12 o'clock).
  // When wheel rotates by R degrees clockwise, slice at original angle theta ends up at (theta + R) % 360 = 0
  // So R = 360 - sliceMid. Plus multiple full revolutions (e.g. 5-7 spins).
  const spins = 5 + Math.floor(Math.random() * 3);
  const targetAngle = spins * 360 + (360 - sliceMid);
  const durationMs = 6000;

  room.status = 'spinning';
  room.winnerId = winner.id;
  room.winnerAngle = targetAngle;

  broadcastToRoom(roomCode, {
    type: 'spin_started',
    targetAngle,
    durationMs,
    winnerId: winner.id,
    winnerName: winner.name,
    pot: totalPot,
  });
  syncRoomToAll(roomCode);

  // Set timeout for end of spin
  const timer = setTimeout(() => {
    concludeRound(roomCode, winner, totalPot);
  }, durationMs + 200);

  roomTimers.set(roomCode, timer);
}

function concludeRound(roomCode: string, winner: Player, totalPot: number) {
  const room = rooms.get(roomCode);
  if (!room) return;

  room.status = 'celebrating';
  winner.coins += totalPot;
  winner.totalWins += 1;

  // Record history
  const historyItem: RoundHistoryItem = {
    round: room.roundNumber,
    winnerId: winner.id,
    winnerName: winner.name,
    winnerAvatar: winner.avatar,
    pot: totalPot,
    timestamp: Date.now(),
  };
  room.history.unshift(historyItem);
  if (room.history.length > 20) room.history.pop();

  // Add system celebration message
  room.chatMessages.push({
    id: 'sys_' + Date.now(),
    playerId: 'system',
    playerName: 'LUCKY DROP',
    avatar: '👑',
    text: `🎉 ${winner.name} struck the LUCKY DROP and won ${totalPot.toLocaleString()} coins!`,
    timestamp: Date.now(),
    isSystem: true,
  });

  broadcastToRoom(roomCode, {
    type: 'round_ended',
    winnerId: winner.id,
    winnerName: winner.name,
    pot: totalPot,
  });
  syncRoomToAll(roomCode);

  // After celebration, reset bets and move to waiting
  const resetTimer = setTimeout(() => {
    room.status = 'waiting';
    room.roundNumber += 1;
    room.pot = 0;
    room.players.forEach((p) => {
      p.isReady = false;
      // Deduct entry fee for next round if they have enough, else minimum
      p.betAmount = Math.min(room.entryFee, p.coins);
      p.coins = Math.max(0, p.coins - p.betAmount);
    });
    room.pot = room.players.reduce((sum, p) => sum + p.betAmount, 0);
    syncRoomToAll(roomCode);
    broadcastRoomList();
  }, 4500);

  roomTimers.set(roomCode, resetTimer);
}

wss.on('connection', (ws: WebSocket) => {
  const playerId = 'p_' + Math.random().toString(36).substring(2, 9);
  const client: ConnectedClient = {
    ws,
    playerId,
    roomCode: null,
    playerData: {
      name: 'Player ' + playerId.substring(2, 6).toUpperCase(),
      avatar: '🎰',
      coins: 1000,
    },
  };

  clients.set(ws, client);

  // Send current room list on connect
  ws.send(JSON.stringify({
    type: 'room_list',
    rooms: getPublicRoomList(),
  }));

  ws.on('message', (data: string) => {
    try {
      const action = JSON.parse(data.toString()) as ClientAction;
      handleClientAction(client, action);
    } catch (err) {
      console.error('Error handling WS message:', err);
    }
  });

  ws.on('close', () => {
    handlePlayerDisconnect(client);
    clients.delete(ws);
  });
});

function handlePlayerDisconnect(client: ConnectedClient) {
  if (!client.roomCode) return;
  const room = rooms.get(client.roomCode);
  if (!room) return;

  const playerIdx = room.players.findIndex((p) => p.id === client.playerId);
  if (playerIdx !== -1) {
    const wasHost = room.players[playerIdx].isHost;
    room.players.splice(playerIdx, 1);

    if (room.players.length === 0) {
      // Room empty, delete
      if (roomTimers.has(room.code)) {
        clearTimeout(roomTimers.get(room.code));
        roomTimers.delete(room.code);
      }
      rooms.delete(room.code);
    } else {
      if (wasHost) {
        room.players[0].isHost = true;
      }
      // Re-index colors
      room.players.forEach((p, idx) => {
        p.color = PLAYER_COLORS[idx % PLAYER_COLORS.length];
      });
      syncRoomToAll(room.code);
    }
    broadcastRoomList();
  }
}

function handleClientAction(client: ConnectedClient, action: ClientAction) {
  switch (action.type) {
    case 'get_rooms': {
      client.ws.send(JSON.stringify({
        type: 'room_list',
        rooms: getPublicRoomList(),
      }));
      break;
    }

    case 'create_room': {
      let code = generateRoomCode();
      while (rooms.has(code)) {
        code = generateRoomCode();
      }

      client.playerData = action.player;
      const initialBet = Math.min(action.entryFee, action.player.coins);
      const remainingCoins = Math.max(0, action.player.coins - initialBet);

      const hostPlayer: Player = {
        id: client.playerId,
        name: action.player.name || 'HighRoller',
        avatar: action.player.avatar || '👑',
        coins: remainingCoins,
        isHost: true,
        isReady: true,
        betAmount: initialBet,
        totalWins: 0,
        color: PLAYER_COLORS[0],
      };

      const newRoom: Room = {
        code,
        name: action.roomName.trim() || `VIP Lounge #${code}`,
        maxPlayers: Math.min(8, Math.max(2, action.maxPlayers || 8)),
        entryFee: Math.max(0, action.entryFee || 50),
        status: 'waiting',
        players: [hostPlayer],
        pot: initialBet,
        roundNumber: 1,
        winnerId: null,
        winnerAngle: 0,
        countdown: 0,
        history: [],
        chatMessages: [
          {
            id: 'sys_' + Date.now(),
            playerId: 'system',
            playerName: 'LUCKY DROP',
            avatar: '🎰',
            text: `Welcome to ${action.roomName || 'LUCKY DROP'}! Invite friends using Room Code: ${code}`,
            timestamp: Date.now(),
            isSystem: true,
          },
        ],
      };

      rooms.set(code, newRoom);
      client.roomCode = code;

      syncRoomToAll(code);
      broadcastRoomList();
      break;
    }

    case 'join_room': {
      const code = action.roomCode.toUpperCase().trim();
      const room = rooms.get(code);

      if (!room) {
        client.ws.send(JSON.stringify({ type: 'error', message: 'Room not found. Check code and try again!' }));
        return;
      }

      if (room.players.length >= room.maxPlayers) {
        client.ws.send(JSON.stringify({ type: 'error', message: 'Room is already full (maximum reached)!' }));
        return;
      }

      // Check if already in room
      const existing = room.players.find((p) => p.id === client.playerId);
      if (!existing) {
        client.playerData = action.player;
        const initialBet = Math.min(room.entryFee, action.player.coins);
        const remainingCoins = Math.max(0, action.player.coins - initialBet);

        const newPlayer: Player = {
          id: client.playerId,
          name: action.player.name || `Player ${room.players.length + 1}`,
          avatar: action.player.avatar || '🎲',
          coins: remainingCoins,
          isHost: room.players.length === 0,
          isReady: false,
          betAmount: initialBet,
          totalWins: 0,
          color: PLAYER_COLORS[room.players.length % PLAYER_COLORS.length],
        };

        room.players.push(newPlayer);
        room.pot += initialBet;
        client.roomCode = code;

        room.chatMessages.push({
          id: 'sys_' + Date.now(),
          playerId: 'system',
          playerName: 'LUCKY DROP',
          avatar: '👋',
          text: `${newPlayer.name} entered the room!`,
          timestamp: Date.now(),
          isSystem: true,
        });

        syncRoomToAll(code);
        broadcastRoomList();
      }
      break;
    }

    case 'leave_room': {
      handlePlayerDisconnect(client);
      client.roomCode = null;
      client.ws.send(JSON.stringify({
        type: 'room_list',
        rooms: getPublicRoomList(),
      }));
      break;
    }

    case 'toggle_ready': {
      if (!client.roomCode) return;
      const room = rooms.get(client.roomCode);
      if (!room) return;

      const player = room.players.find((p) => p.id === client.playerId);
      if (player) {
        player.isReady = !player.isReady;
        syncRoomToAll(room.code);
      }
      break;
    }

    case 'place_bet': {
      if (!client.roomCode) return;
      const room = rooms.get(client.roomCode);
      if (!room || room.status === 'spinning') return;

      const player = room.players.find((p) => p.id === client.playerId);
      if (player) {
        const delta = action.amount;
        if (delta > 0 && player.coins >= delta) {
          player.coins -= delta;
          player.betAmount += delta;
          room.pot += delta;
        } else if (delta < 0 && player.betAmount + delta >= 0) {
          const returnAmount = Math.abs(delta);
          player.betAmount -= returnAmount;
          player.coins += returnAmount;
          room.pot -= returnAmount;
        }
        syncRoomToAll(room.code);
      }
      break;
    }

    case 'start_game': {
      if (!client.roomCode) return;
      const room = rooms.get(client.roomCode);
      if (!room) return;

      const player = room.players.find((p) => p.id === client.playerId);
      if (player && player.isHost && room.players.length >= 2 && room.status === 'waiting') {
        startSpin(room.code);
      }
      break;
    }

    case 'send_chat': {
      if (!client.roomCode) return;
      const room = rooms.get(client.roomCode);
      if (!room) return;

      const player = room.players.find((p) => p.id === client.playerId);
      if (player) {
        const msg: ChatMessage = {
          id: 'msg_' + Date.now() + Math.random().toString(36).substring(2, 5),
          playerId: player.id,
          playerName: player.name,
          avatar: player.avatar,
          text: action.text,
          emoji: action.emoji,
          timestamp: Date.now(),
        };

        room.chatMessages.push(msg);
        if (room.chatMessages.length > 50) room.chatMessages.shift();

        broadcastToRoom(room.code, {
          type: 'chat_broadcast',
          message: msg,
        });
      }
      break;
    }

    case 'claim_faucet': {
      const addedCoins = Math.max(0, action.amount || 250);
      if (client.roomCode) {
        const room = rooms.get(client.roomCode);
        if (room) {
          const player = room.players.find((p) => p.id === client.playerId);
          if (player) {
            player.coins += addedCoins;
            syncRoomToAll(room.code);
          }
        }
      }
      break;
    }
  }
}

// Pre-create 2 friendly open demo rooms so solitary players can immediately test or find other players
const demoRoom1: Room = {
  code: 'LUCKY7',
  name: 'Ruby High Roller',
  maxPlayers: 8,
  entryFee: 100,
  status: 'waiting',
  players: [
    {
      id: 'bot_ruby',
      name: 'Lady Scarlet',
      avatar: '👠',
      coins: 4800,
      isHost: true,
      isReady: true,
      betAmount: 100,
      totalWins: 5,
      color: PLAYER_COLORS[0],
    },
    {
      id: 'bot_ace',
      name: 'Ace Vegas',
      avatar: '🎩',
      coins: 2450,
      isHost: false,
      isReady: true,
      betAmount: 100,
      totalWins: 3,
      color: PLAYER_COLORS[1],
    },
  ],
  pot: 200,
  roundNumber: 4,
  winnerId: null,
  winnerAngle: 0,
  countdown: 0,
  history: [
    {
      round: 3,
      winnerId: 'bot_ruby',
      winnerName: 'Lady Scarlet',
      winnerAvatar: '👠',
      pot: 650,
      timestamp: Date.now() - 120000,
    },
    {
      round: 2,
      winnerId: 'bot_ace',
      winnerName: 'Ace Vegas',
      winnerAvatar: '🎩',
      pot: 400,
      timestamp: Date.now() - 240000,
    },
  ],
  chatMessages: [
    {
      id: 'm1',
      playerId: 'bot_ruby',
      playerName: 'Lady Scarlet',
      avatar: '👠',
      text: 'Who feels lucky tonight? Drop in!',
      timestamp: Date.now() - 100000,
    },
  ],
};

const demoRoom2: Room = {
  code: 'GOLD88',
  name: 'Midnight Fortune',
  maxPlayers: 6,
  entryFee: 50,
  status: 'waiting',
  players: [
    {
      id: 'bot_jack',
      name: 'Jackpot Jim',
      avatar: '🤠',
      coins: 1950,
      isHost: true,
      isReady: true,
      betAmount: 50,
      totalWins: 2,
      color: PLAYER_COLORS[2],
    },
  ],
  pot: 50,
  roundNumber: 2,
  winnerId: null,
  winnerAngle: 0,
  countdown: 0,
  history: [],
  chatMessages: [],
};

rooms.set('LUCKY7', demoRoom1);
rooms.set('GOLD88', demoRoom2);

// HTTP Endpoints & Dev middleware setup
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', name: 'LUCKY DROP', activeRooms: rooms.size, clients: clients.size });
});

async function setupServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🎰 LUCKY DROP server running on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
