import React, { useState } from 'react';
import type { GameStatus } from '../types.ts';
import { PlusCircle, LogIn, Users, Flame, Coins, Sparkles, Trophy, Shuffle } from 'lucide-react';

interface RoomLobbyProps {
  rooms: Array<{
    code: string;
    name: string;
    playersCount: number;
    maxPlayers: number;
    entryFee: number;
    status: GameStatus;
  }>;
  playerName: string;
  playerAvatar: string;
  coins: number;
  onUpdateProfile: (name: string, avatar: string) => void;
  onCreateRoom: (name: string, maxPlayers: number, entryFee: number) => void;
  onJoinRoom: (code: string) => void;
  onOpenRewards: () => void;
}

const AVATAR_OPTIONS = ['👑', '🎰', '💎', '🎲', '👠', '🎩', '🤠', '🦁', '🐯', '🚀', '🍀', '⚡'];

export const RoomLobby: React.FC<RoomLobbyProps> = ({
  rooms,
  playerName,
  playerAvatar,
  coins,
  onUpdateProfile,
  onCreateRoom,
  onJoinRoom,
  onOpenRewards,
}) => {
  const [activeTab, setActiveTab] = useState<'browse' | 'create' | 'join'>('browse');
  const [roomNameInput, setRoomNameInput] = useState('');
  const [maxPlayersInput, setMaxPlayersInput] = useState(8);
  const [entryFeeInput, setEntryFeeInput] = useState(50);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [nameDraft, setNameDraft] = useState(playerName);
  const [avatarDraft, setAvatarDraft] = useState(playerAvatar);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateRoom(roomNameInput.trim() || 'Lucky Lounge', maxPlayersInput, entryFeeInput);
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;
    onJoinRoom(joinCodeInput.trim().toUpperCase());
  };

  const handleSaveProfile = () => {
    onUpdateProfile(nameDraft.trim() || playerName, avatarDraft);
    setIsEditingProfile(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 p-4">
      {/* Top Banner / Hero */}
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 bg-gradient-to-r from-[#200810] via-[#15060c] to-[#250914] border-2 border-red-900/60 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(225,29,72,0.25)_0%,transparent_70%)] pointer-events-none" />

        <div className="z-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-800/60 text-rose-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            REAL-TIME ONLINE MULTIPLAYER
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-black text-white text-glow-red tracking-wider">
            LUCKY DROP
          </h1>
          <p className="text-sm text-gray-300 mt-1 max-w-md">
            Spin the high-stakes wheel, outlast up to 8 players, and claim the winner-takes-all jackpot pot!
          </p>
        </div>

        {/* Profile Card & Free Rewards Trigger */}
        <div className="z-10 bg-black/60 backdrop-blur-md rounded-2xl border border-red-900/60 p-4 flex flex-col items-center gap-3 w-full sm:w-auto min-w-[240px]">
          <div className="flex items-center gap-3 w-full justify-between">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsEditingProfile(true)}
                className="w-11 h-11 rounded-full bg-[#200c15] border-2 border-amber-400 text-2xl flex items-center justify-center hover:scale-105 transition-transform cursor-pointer shadow-md"
                title="Change Avatar"
              >
                {playerAvatar}
              </button>
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-sm text-gray-100">{playerName}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-amber-300 font-mono font-bold">
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  {coins.toLocaleString()}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsEditingProfile(true)}
              className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold underline cursor-pointer"
            >
              Edit
            </button>
          </div>

          <button
            onClick={onOpenRewards}
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-black font-heading font-bold text-xs uppercase flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            CLAIM FREE COINS
          </button>
        </div>
      </div>

      {/* Profile Edit Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#180a11] border-2 border-red-900 rounded-3xl p-6 w-full max-w-sm text-center">
            <h3 className="font-heading font-black text-lg text-white mb-4">CUSTOMIZE PLAYER PROFILE</h3>

            <div className="text-left mb-4">
              <label className="text-xs text-gray-400 block mb-1">Player Nickname</label>
              <input
                type="text"
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                maxLength={14}
                className="w-full bg-black/60 border border-red-950 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="text-left mb-6">
              <label className="text-xs text-gray-400 block mb-2">Choose Avatar Emblem</label>
              <div className="grid grid-cols-6 gap-2">
                {AVATAR_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setAvatarDraft(emoji)}
                    className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all cursor-pointer ${
                      avatarDraft === emoji
                        ? 'bg-rose-600 border-2 border-amber-300 scale-110 shadow-lg'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsEditingProfile(false)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold cursor-pointer"
              >
                CANCEL
              </button>
              <button
                onClick={handleSaveProfile}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer shadow-md"
              >
                SAVE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Row */}
      <div className="flex items-center gap-2 p-1 bg-black/50 rounded-2xl border border-red-950/60 max-w-md mx-auto w-full">
        <button
          onClick={() => setActiveTab('browse')}
          className={`flex-1 py-2.5 rounded-xl font-heading font-bold text-xs tracking-wider uppercase transition-all cursor-pointer ${
            activeTab === 'browse'
              ? 'bg-gradient-to-r from-red-700 to-rose-700 text-white shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          OPEN ROOMS
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`flex-1 py-2.5 rounded-xl font-heading font-bold text-xs tracking-wider uppercase transition-all cursor-pointer ${
            activeTab === 'create'
              ? 'bg-gradient-to-r from-red-700 to-rose-700 text-white shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          CREATE ROOM
        </button>
        <button
          onClick={() => setActiveTab('join')}
          className={`flex-1 py-2.5 rounded-xl font-heading font-bold text-xs tracking-wider uppercase transition-all cursor-pointer ${
            activeTab === 'join'
              ? 'bg-gradient-to-r from-red-700 to-rose-700 text-white shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          ENTER CODE
        </button>
      </div>

      {/* Tab 1: Browse Open Rooms */}
      {activeTab === 'browse' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-400 px-1">
            <span>AVAILABLE LOBBIES ({rooms.length})</span>
            <span>2 to 8 Players per room</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {rooms.map((room) => {
              const isFull = room.playersCount >= room.maxPlayers;
              const isSpinning = room.status === 'spinning';

              return (
                <div
                  key={room.code}
                  className="bg-[#14080e]/90 border border-red-950/70 hover:border-red-900/90 rounded-2xl p-4 shadow-lg flex flex-col justify-between transition-all group"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-heading font-bold text-base text-gray-100 group-hover:text-rose-300 transition-colors">
                          {room.name}
                        </h4>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-black/60 border border-red-950 text-gray-400">
                          #{room.code}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 flex items-center gap-1.5 mt-1">
                        <Users className="w-3.5 h-3.5 text-rose-400" />
                        {room.playersCount} / {room.maxPlayers} Players
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 block uppercase">STAKE</span>
                      <span className="text-xs font-mono font-bold text-amber-300">
                        🪙 {room.entryFee > 0 ? `${room.entryFee} Coins` : 'Free Entry'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-red-950/40">
                    <span className="text-[11px] font-medium">
                      {isSpinning ? (
                        <span className="text-amber-400 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" /> Spinning...
                        </span>
                      ) : isFull ? (
                        <span className="text-gray-500">Full</span>
                      ) : (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" /> Joinable
                        </span>
                      )}
                    </span>

                    <button
                      disabled={isFull}
                      onClick={() => onJoinRoom(room.code)}
                      className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:brightness-110 text-white font-heading font-bold text-xs uppercase shadow-md active:scale-95 transition-all disabled:opacity-40 cursor-pointer"
                    >
                      JOIN ROOM
                    </button>
                  </div>
                </div>
              );
            })}

            {rooms.length === 0 && (
              <div className="col-span-full py-12 text-center bg-black/30 rounded-2xl border border-dashed border-red-950">
                <p className="text-gray-400 text-sm mb-3">No active rooms found right now.</p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold uppercase shadow cursor-pointer"
                >
                  Create the First Room!
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Create Room */}
      {activeTab === 'create' && (
        <form
          onSubmit={handleCreateSubmit}
          className="bg-[#14080e]/90 border border-red-950/80 rounded-3xl p-6 shadow-2xl max-w-md mx-auto w-full space-y-4"
        >
          <div className="text-center mb-2">
            <h3 className="font-heading font-black text-xl text-white">CREATE MULTIPLAYER ROOM</h3>
            <p className="text-xs text-gray-400">Host your own Lucky Drop room and invite up to 8 players</p>
          </div>

          <div>
            <label className="text-xs text-gray-300 block mb-1 font-semibold">Room Name</label>
            <input
              type="text"
              value={roomNameInput}
              onChange={(e) => setRoomNameInput(e.target.value)}
              placeholder="e.g. VIP Ruby High Roller"
              maxLength={25}
              className="w-full bg-black/60 border border-red-950 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500 placeholder-gray-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-gray-300 mb-1 font-semibold">
              <span>Max Players (2 to 8)</span>
              <span className="text-amber-300 font-mono font-bold">{maxPlayersInput} Players</span>
            </div>
            <input
              type="range"
              min="2"
              max="8"
              value={maxPlayersInput}
              onChange={(e) => setMaxPlayersInput(Number(e.target.value))}
              className="w-full accent-rose-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-500 mt-0.5">
              <span>2 Players (Duel)</span>
              <span>4 Players</span>
              <span>6 Players</span>
              <span>8 Players (Max)</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-gray-300 mb-1 font-semibold">
              <span>Entry Fee</span>
              <span className="text-amber-300 font-mono font-bold">🪙 {entryFeeInput} Coins</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[0, 25, 50, 100].map((fee) => (
                <button
                  type="button"
                  key={fee}
                  onClick={() => setEntryFeeInput(fee)}
                  className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                    entryFeeInput === fee
                      ? 'bg-rose-600 border-amber-400 text-white shadow-md'
                      : 'bg-black/40 border-red-950 text-gray-400 hover:text-white'
                  }`}
                >
                  {fee === 0 ? 'FREE' : `${fee}`}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:brightness-110 text-white font-heading font-black text-sm tracking-wider uppercase shadow-xl active:scale-98 transition-all cursor-pointer glow-red"
          >
            CREATE & ENTER ROOM
          </button>
        </form>
      )}

      {/* Tab 3: Join via Code */}
      {activeTab === 'join' && (
        <form
          onSubmit={handleJoinSubmit}
          className="bg-[#14080e]/90 border border-red-950/80 rounded-3xl p-6 shadow-2xl max-w-md mx-auto w-full space-y-4 text-center"
        >
          <div>
            <h3 className="font-heading font-black text-xl text-white">JOIN WITH ROOM CODE</h3>
            <p className="text-xs text-gray-400 mt-1">
              Enter the 5 or 6-character room code shared by your friend
            </p>
          </div>

          <div className="py-2">
            <input
              type="text"
              value={joinCodeInput}
              onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
              placeholder="e.g. LUCKY7"
              maxLength={8}
              className="w-full bg-black/70 border-2 border-red-900 focus:border-amber-400 rounded-2xl px-4 py-3 text-center text-2xl font-mono font-black text-amber-300 tracking-widest placeholder-gray-700 uppercase focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={!joinCodeInput.trim()}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:brightness-110 disabled:opacity-40 text-white font-heading font-bold text-sm tracking-wider uppercase shadow-lg active:scale-98 transition-all cursor-pointer"
          >
            JOIN ROOM NOW
          </button>
        </form>
      )}
    </div>
  );
};
