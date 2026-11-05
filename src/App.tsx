/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Room, Player, ClientAction, ServerMessage } from './types.ts';
import { LuckyWheel } from './components/LuckyWheel.tsx';
import { LivePlayerList } from './components/LivePlayerList.tsx';
import { BettingControls } from './components/BettingControls.tsx';
import { WinnerCelebration } from './components/WinnerCelebration.tsx';
import { RoomLobby } from './components/RoomLobby.tsx';
import { InviteModal } from './components/InviteModal.tsx';
import { FreeRewardsModal } from './components/FreeRewardsModal.tsx';
import { InRoomChat } from './components/InRoomChat.tsx';
import { InstallAPKModal } from './components/InstallAPKModal.tsx';
import { sounds } from './utils/sound.ts';
import {
  Volume2,
  VolumeX,
  Share2,
  ArrowLeft,
  Sparkles,
  Flame,
  Coins,
  Trophy,
  History,
  Smartphone,
} from 'lucide-react';

export default function App() {
  // Local Player identity (persisted in localStorage)
  const [playerName, setPlayerName] = useState<string>(() => {
    return localStorage.getItem('ld_player_name') || 'LuckyPlayer_' + Math.floor(100 + Math.random() * 900);
  });
  const [playerAvatar, setPlayerAvatar] = useState<string>(() => {
    return localStorage.getItem('ld_player_avatar') || '👑';
  });
  const [myCoins, setMyCoins] = useState<number>(() => {
    const saved = localStorage.getItem('ld_coins');
    return saved !== null ? parseInt(saved, 10) : 1000;
  });

  // Sound mute state
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // WebSocket connection & Room state
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [myPlayerId, setMyPlayerId] = useState<string>('');
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [roomList, setRoomList] = useState<Array<{
    code: string;
    name: string;
    playersCount: number;
    maxPlayers: number;
    entryFee: number;
    status: 'waiting' | 'betting' | 'spinning' | 'celebrating';
  }>>([]);

  // Modals state
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [showRewardsModal, setShowRewardsModal] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);
  const [dismissedCelebration, setDismissedCelebration] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);

  // Sync coins & profile to localStorage
  useEffect(() => {
    localStorage.setItem('ld_coins', myCoins.toString());
  }, [myCoins]);

  useEffect(() => {
    localStorage.setItem('ld_player_name', playerName);
    localStorage.setItem('ld_player_avatar', playerAvatar);
  }, [playerName, playerAvatar]);

  // Connect to WebSocket server
  const connectWs = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    const socket = new WebSocket(wsUrl);
    wsRef.current = socket;

    socket.onopen = () => {
      setConnected(true);
      setWs(socket);

      // Check URL query param for room code invite (e.g. ?room=LUCKY7)
      const params = new URLSearchParams(window.location.search);
      const inviteCode = params.get('room');
      if (inviteCode) {
        const joinAction: ClientAction = {
          type: 'join_room',
          roomCode: inviteCode,
          player: {
            name: playerName,
            avatar: playerAvatar,
            coins: myCoins,
          },
        };
        socket.send(JSON.stringify(joinAction));
      } else {
        // Request open room list
        socket.send(JSON.stringify({ type: 'get_rooms' }));
      }
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as ServerMessage;
        switch (data.type) {
          case 'sync_room':
            setCurrentRoom(data.room);
            setMyPlayerId(data.myPlayerId);
            // Sync local player coins if updated in room
            const meInRoom = data.room.players.find((p) => p.id === data.myPlayerId);
            if (meInRoom) {
              setMyCoins(meInRoom.coins);
            }
            if (data.room.status !== 'celebrating') {
              setDismissedCelebration(false);
            }
            break;

          case 'room_list':
            setRoomList(data.rooms);
            break;

          case 'spin_started':
            setDismissedCelebration(false);
            break;

          case 'error':
            setErrorMessage(data.message);
            setTimeout(() => setErrorMessage(null), 4000);
            break;
        }
      } catch (err) {
        console.error('Error parsing WS message:', err);
      }
    };

    socket.onclose = () => {
      setConnected(false);
      setWs(null);
      // Auto-reconnect after 2 seconds
      setTimeout(connectWs, 2000);
    };

    socket.onerror = (err) => {
      console.warn('WebSocket error, waiting for reconnect:', err);
    };
  }, [playerName, playerAvatar, myCoins]);

  useEffect(() => {
    connectWs();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connectWs]);

  // Audio mute toggle
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.enabled = next;
  };

  // Profile update
  const handleUpdateProfile = (name: string, avatar: string) => {
    setPlayerName(name);
    setPlayerAvatar(avatar);
  };

  // Room actions
  const handleCreateRoom = (name: string, maxPlayers: number, entryFee: number) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    const action: ClientAction = {
      type: 'create_room',
      roomName: name,
      maxPlayers,
      entryFee,
      player: {
        name: playerName,
        avatar: playerAvatar,
        coins: myCoins,
      },
    };
    ws.send(JSON.stringify(action));
  };

  const handleJoinRoom = (code: string) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    const action: ClientAction = {
      type: 'join_room',
      roomCode: code,
      player: {
        name: playerName,
        avatar: playerAvatar,
        coins: myCoins,
      },
    };
    ws.send(JSON.stringify(action));
  };

  const handleLeaveRoom = () => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type: 'leave_room' }));
    setCurrentRoom(null);
    // Clear URL param if present
    if (window.history.replaceState) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  const handleBetChange = (amount: number) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type: 'place_bet', amount }));
  };

  const handleToggleReady = () => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type: 'toggle_ready' }));
  };

  const handleStartGame = () => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type: 'start_game' }));
  };

  const handleSendChat = (text: string) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type: 'send_chat', text }));
  };

  const handleSendReaction = (emoji: string) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type: 'send_chat', emoji }));
  };

  const handleClaimFreeCoins = (amount: number) => {
    setMyCoins((prev) => prev + amount);
    if (ws && ws.readyState === WebSocket.OPEN && currentRoom) {
      ws.send(JSON.stringify({ type: 'claim_faucet', amount }));
    }
  };

  // Find current player in room
  const localPlayer = currentRoom?.players.find((p) => p.id === myPlayerId);
  const isHost = localPlayer?.isHost ?? false;
  const canStart = Boolean(currentRoom && currentRoom.players.length >= 2 && currentRoom.status === 'waiting');
  const winnerPlayer = currentRoom?.players.find((p) => p.id === currentRoom.winnerId);

  return (
    <div className="min-h-screen bg-casino-pattern flex flex-col text-gray-100">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#0d0609]/90 backdrop-blur-md border-b border-red-950/80 px-4 py-2.5 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          {currentRoom && (
            <button
              onClick={handleLeaveRoom}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all cursor-pointer flex items-center gap-1 text-xs"
              title="Leave Room"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Lobby</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center shadow-[0_0_12px_rgba(225,29,72,0.6)]">
              <Flame className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <span className="font-heading font-black text-lg tracking-wider text-white text-glow-red">
                LUCKY DROP
              </span>
              <span className="hidden md:inline-block ml-2 text-[10px] text-amber-300 font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-950/70 border border-red-900/50">
                2-8 MULTIPLAYER WHEEL
              </span>
            </div>
          </div>
        </div>

        {/* Right Header Status (Install App + Wallet + Rewards + Sound) */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Install on Android Button */}
          <button
            onClick={() => setShowInstallModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:brightness-110 text-white text-xs font-bold shadow-md cursor-pointer transition-all active:scale-95"
            title="Install on Android Phone / Get APK"
          >
            <Smartphone className="w-4 h-4 text-emerald-200" />
            <span className="hidden sm:inline">Install App</span>
            <span className="text-[10px] bg-emerald-400/25 px-1 py-0.2 rounded font-mono font-bold">
              APK
            </span>
          </button>

          {/* Quick Wallet Chip */}
          <button
            onClick={() => setShowRewardsModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 border border-amber-500/40 hover:border-amber-400 text-amber-300 text-xs font-mono font-bold shadow transition-all cursor-pointer group"
          >
            <Coins className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <span>{myCoins.toLocaleString()}</span>
            <span className="text-[10px] text-amber-400 bg-amber-400/20 px-1 rounded ml-0.5">
              +FREE
            </span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all cursor-pointer"
            title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-300" /> : <VolumeX className="w-4 h-4 text-gray-500" />}
          </button>
        </div>
      </header>

      {/* Error Toast */}
      {errorMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-rose-900 border-2 border-rose-500 text-white text-xs font-bold px-4 py-2 rounded-2xl shadow-2xl animate-in slide-in-from-top">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-start py-4 px-2 sm:px-4">
        {!currentRoom ? (
          /* LOBBY VIEW */
          <RoomLobby
            rooms={roomList}
            playerName={playerName}
            playerAvatar={playerAvatar}
            coins={myCoins}
            onUpdateProfile={handleUpdateProfile}
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            onOpenRewards={() => setShowRewardsModal(true)}
            onOpenInstall={() => setShowInstallModal(true)}
          />
        ) : (
          /* IN-ROOM MULTIPLAYER ARENA */
          <div className="w-full max-w-6xl flex flex-col gap-4">
            {/* Room Header Strip */}
            <div className="bg-[#12080d]/80 backdrop-blur-md rounded-2xl border border-red-950/70 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-xl">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-heading font-black text-lg sm:text-xl text-white">
                    {currentRoom.name}
                  </h2>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-black/60 border border-red-900 text-amber-300">
                    #{currentRoom.code}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                  <span>Round #{currentRoom.roundNumber}</span>
                  <span>•</span>
                  <span>Stake: 🪙 {currentRoom.entryFee > 0 ? `${currentRoom.entryFee} Coins` : 'Free Entry'}</span>
                </div>
              </div>

              {/* Action Buttons: Invite & Round History */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowHistoryModal(true)}
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <History className="w-4 h-4 text-rose-400" />
                  <span className="hidden sm:inline">History</span>
                </button>

                <button
                  onClick={() => setShowInviteModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:brightness-110 text-white font-heading font-bold text-xs uppercase tracking-wide flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  INVITE FRIENDS
                </button>
              </div>
            </div>

            {/* Main Game Grid: Left/Center Wheel & Controls, Right Live Players & Chat */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              {/* Wheel & Betting Controls Area (8 cols on lg) */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                {/* Lucky Draw Wheel */}
                <div className="bg-[#12080d]/80 backdrop-blur-md rounded-3xl border border-red-950/70 p-4 shadow-2xl flex flex-col items-center">
                  <LuckyWheel
                    players={currentRoom.players}
                    status={currentRoom.status}
                    winnerAngle={currentRoom.winnerAngle}
                    winnerId={currentRoom.winnerId}
                    pot={currentRoom.pot}
                  />
                </div>

                {/* Betting Controls */}
                <BettingControls
                  player={localPlayer}
                  status={currentRoom.status}
                  isHost={isHost}
                  canStart={canStart}
                  onBetChange={handleBetChange}
                  onToggleReady={handleToggleReady}
                  onStartGame={handleStartGame}
                  onOpenFaucet={() => setShowRewardsModal(true)}
                />
              </div>

              {/* Right Sidebar: Live Player List & In-Room Chat (5 cols on lg) */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <LivePlayerList
                  players={currentRoom.players}
                  myPlayerId={myPlayerId}
                  pot={currentRoom.pot}
                />

                <InRoomChat
                  messages={currentRoom.chatMessages}
                  onSendMessage={handleSendChat}
                  onSendReaction={handleSendReaction}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Winner Celebration Modal */}
      {currentRoom?.status === 'celebrating' && !dismissedCelebration && (
        <WinnerCelebration
          winner={winnerPlayer}
          pot={currentRoom.pot}
          isMe={winnerPlayer?.id === myPlayerId}
          onDismiss={() => setDismissedCelebration(true)}
          onSendReaction={handleSendReaction}
        />
      )}

      {/* Invite Friends Modal */}
      {showInviteModal && currentRoom && (
        <InviteModal
          roomCode={currentRoom.code}
          roomName={currentRoom.name}
          onClose={() => setShowInviteModal(false)}
        />
      )}

      {/* Free Rewards & Coin Faucet Modal */}
      {showRewardsModal && (
        <FreeRewardsModal
          currentCoins={myCoins}
          onClaimCoins={handleClaimFreeCoins}
          onClose={() => setShowRewardsModal(false)}
        />
      )}

      {/* Install on Android / APK Modal */}
      {showInstallModal && (
        <InstallAPKModal
          onClose={() => setShowInstallModal(false)}
        />
      )}

      {/* Round History Modal */}
      {showHistoryModal && currentRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#160a10] border-2 border-red-900 rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-red-950 mb-3">
              <h3 className="font-heading font-black text-lg text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                ROUND HISTORY
              </h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-gray-400 hover:text-white text-xs font-bold"
              >
                CLOSE
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {currentRoom.history.map((h, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-black/50 border border-red-950/60 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{h.winnerAvatar}</span>
                    <div>
                      <span className="font-bold text-gray-200">{h.winnerName}</span>
                      <span className="text-[10px] text-gray-500 block">Round #{h.round}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-amber-300">
                      🪙 +{h.pot.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}

              {currentRoom.history.length === 0 && (
                <div className="py-8 text-center text-gray-500 text-xs">
                  No rounds recorded yet in this session. Spin the wheel to create history!
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
