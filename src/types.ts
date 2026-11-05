export interface Player {
  id: string;
  name: string;
  avatar: string;
  coins: number;
  isHost: boolean;
  isReady: boolean;
  betAmount: number;
  totalWins: number;
  color: string;
}

export type GameStatus = 'waiting' | 'betting' | 'spinning' | 'celebrating';

export interface Room {
  code: string;
  name: string;
  maxPlayers: number;
  entryFee: number;
  status: GameStatus;
  players: Player[];
  pot: number;
  roundNumber: number;
  winnerId: string | null;
  winnerAngle: number; // Final wheel stop angle in degrees
  countdown: number; // Seconds remaining in current phase
  history: RoundHistoryItem[];
  chatMessages: ChatMessage[];
}

export interface RoundHistoryItem {
  round: number;
  winnerId: string;
  winnerName: string;
  winnerAvatar: string;
  pot: number;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  avatar: string;
  text?: string;
  emoji?: string;
  timestamp: number;
  isSystem?: boolean;
}

// Client-to-server WS actions
export type ClientAction =
  | { type: 'join_room'; roomCode: string; player: { name: string; avatar: string; coins: number } }
  | { type: 'create_room'; roomName: string; maxPlayers: number; entryFee: number; player: { name: string; avatar: string; coins: number } }
  | { type: 'leave_room' }
  | { type: 'toggle_ready' }
  | { type: 'place_bet'; amount: number }
  | { type: 'start_game' }
  | { type: 'send_chat'; text?: string; emoji?: string }
  | { type: 'claim_faucet'; amount: number }
  | { type: 'get_rooms' };

// Server-to-client WS actions
export type ServerMessage =
  | { type: 'sync_room'; room: Room; myPlayerId: string }
  | { type: 'room_list'; rooms: Array<{ code: string; name: string; playersCount: number; maxPlayers: number; entryFee: number; status: GameStatus }> }
  | { type: 'spin_started'; targetAngle: number; durationMs: number; winnerId: string; winnerName: string; pot: number }
  | { type: 'round_ended'; winnerId: string; winnerName: string; pot: number }
  | { type: 'chat_broadcast'; message: ChatMessage }
  | { type: 'error'; message: string };
