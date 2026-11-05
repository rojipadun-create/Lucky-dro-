import React from 'react';
import type { Player } from '../types.ts';
import { Crown, Trophy, Coins, CheckCircle2, Clock } from 'lucide-react';

interface LivePlayerListProps {
  players: Player[];
  myPlayerId: string;
  pot: number;
}

export const LivePlayerList: React.FC<LivePlayerListProps> = ({ players, myPlayerId, pot }) => {
  const totalBetWeight = players.reduce((sum, p) => sum + Math.max(p.betAmount, 10), 0);

  return (
    <div className="bg-[#12080d]/80 backdrop-blur-md rounded-2xl border border-rose-950/60 p-4 shadow-xl flex flex-col">
      <div className="flex items-center justify-between pb-3 border-b border-red-950/40 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <h3 className="font-heading font-bold text-sm tracking-wide text-rose-200">
            LIVE PLAYERS
          </h3>
        </div>
        <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-red-950/70 border border-red-800/50 text-red-300">
          {players.length} / 8 PLAYERS
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5 overflow-y-auto max-h-[380px] pr-1">
        {players.map((player) => {
          const isMe = player.id === myPlayerId;
          const playerWeight = Math.max(player.betAmount, 10);
          const winChance = totalBetWeight > 0 ? Math.round((playerWeight / totalBetWeight) * 100) : 0;

          return (
            <div
              key={player.id}
              className={`relative flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                isMe
                  ? 'bg-gradient-to-r from-red-950/60 to-rose-950/40 border-rose-600/60 shadow-[0_0_15px_rgba(225,29,72,0.25)]'
                  : 'bg-black/40 border-red-950/40 hover:border-red-900/40'
              }`}
            >
              {/* Color Bar indicator corresponding to wheel slice */}
              <div
                className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full shadow-sm"
                style={{ backgroundColor: player.color }}
              />

              <div className="flex items-center gap-3 pl-2 min-w-0">
                {/* Avatar with color halo */}
                <div
                  className="relative w-10 h-10 rounded-full flex items-center justify-center text-xl bg-[#1c0e15] border-2 shadow-md shrink-0"
                  style={{ borderColor: player.color }}
                >
                  {player.avatar}
                  {player.isHost && (
                    <div className="absolute -top-1.5 -right-1 bg-amber-500 text-black p-0.5 rounded-full shadow">
                      <Crown className="w-3 h-3 fill-black" />
                    </div>
                  )}
                </div>

                {/* Name & Stats */}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-gray-100 truncate">
                      {player.name}
                    </span>
                    {isMe && (
                      <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-rose-600 text-white shadow-xs">
                        YOU
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5 text-xs text-gray-400 mt-0.5">
                    <span className="flex items-center gap-1 text-amber-300 font-mono font-medium">
                      <Coins className="w-3 h-3 text-amber-400" />
                      {player.coins.toLocaleString()}
                    </span>
                    {player.totalWins > 0 && (
                      <span className="flex items-center gap-0.5 text-yellow-400 text-[11px] font-mono">
                        <Trophy className="w-2.5 h-2.5" />
                        {player.totalWins}w
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bet & Chance Pill */}
              <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono font-bold text-rose-300">
                    🎲 {player.betAmount > 0 ? player.betAmount.toLocaleString() : '0'}
                  </span>
                  <span
                    className="text-[11px] font-extrabold px-1.5 py-0.5 rounded font-mono shadow-xs"
                    style={{
                      backgroundColor: `${player.color}25`,
                      color: player.color,
                      border: `1px solid ${player.color}60`,
                    }}
                  >
                    {winChance}%
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[11px]">
                  {player.isReady ? (
                    <span className="flex items-center gap-1 text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3 h-3" /> Ready
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-gray-500 font-medium">
                      <Clock className="w-3 h-3" /> Waiting
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Room Summary Footnote */}
      <div className="mt-3 pt-2.5 border-t border-red-950/40 flex items-center justify-between text-xs text-gray-400">
        <span>Total Round Stakes:</span>
        <span className="text-amber-300 font-mono font-bold">
          🪙 {pot.toLocaleString()} Coins
        </span>
      </div>
    </div>
  );
};
