import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Crown, Sparkles, Coins, Flame } from 'lucide-react';
import { sounds } from '../utils/sound.ts';
import type { Player } from '../types.ts';

interface WinnerCelebrationProps {
  winner: Player | undefined;
  pot: number;
  isMe: boolean;
  onDismiss: () => void;
  onSendReaction: (emoji: string) => void;
}

export const WinnerCelebration: React.FC<WinnerCelebrationProps> = ({
  winner,
  pot,
  isMe,
  onDismiss,
  onSendReaction,
}) => {
  useEffect(() => {
    sounds.playWinFanfare();
    setTimeout(() => {
      sounds.playCoinDrop();
    }, 600);

    // Fire fireworks confetti
    const duration = 3.5 * 1000;
    const animationEnd = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#e11d48', '#fbbf24', '#ffffff', '#ef4444'],
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#e11d48', '#fbbf24', '#ffffff', '#ef4444'],
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  if (!winner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      {/* Background radial rays */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(225,29,72,0.35)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative w-full max-w-md bg-gradient-to-b from-[#2a0e18] via-[#16080e] to-[#0d0407] rounded-3xl border-2 border-amber-400/80 shadow-[0_0_60px_rgba(225,29,72,0.8)] p-6 sm:p-8 text-center flex flex-col items-center overflow-hidden">
        {/* Top Floating Badge */}
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 font-bold text-xs uppercase tracking-wider mb-2 animate-bounce">
          <Trophy className="w-4 h-4 text-amber-400 fill-amber-400" />
          LUCKY DROP CHAMPION
          <Sparkles className="w-4 h-4 text-amber-300" />
        </div>

        {/* Winner Avatar with Crown & Pulsing Rings */}
        <div className="relative my-4">
          <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-amber-400 to-rose-600 blur-md opacity-75 animate-pulse" />
          <div className="relative w-24 h-24 rounded-full bg-[#180910] border-4 border-amber-400 flex items-center justify-center text-5xl shadow-2xl">
            {winner.avatar}
            <div className="absolute -top-3.5 bg-gradient-to-tr from-amber-300 to-yellow-500 p-2 rounded-full border border-yellow-200 shadow-lg animate-bounce">
              <Crown className="w-6 h-6 text-black fill-black" />
            </div>
          </div>
        </div>

        {/* Winner Name */}
        <h2 className="text-2xl sm:text-3xl font-heading font-black text-white text-glow-gold tracking-wide">
          {winner.name}
        </h2>
        {isMe && (
          <span className="mt-1 px-3 py-0.5 rounded-full bg-rose-600 text-white font-extrabold text-xs tracking-widest uppercase shadow">
            🎉 YOU WON THE POT! 🎉
          </span>
        )}

        {/* Pot Won Counter */}
        <div className="my-5 w-full bg-black/50 border border-amber-400/40 rounded-2xl p-4 flex flex-col items-center">
          <span className="text-xs text-amber-300/80 uppercase tracking-widest font-semibold flex items-center gap-1">
            <Coins className="w-3.5 h-3.5 text-amber-400" /> TOTAL JACKPOT WON
          </span>
          <div className="text-3xl sm:text-4xl font-mono font-black text-amber-300 drop-shadow-[0_2px_10px_rgba(251,191,36,0.6)] mt-1">
            +{pot.toLocaleString()} <span className="text-sm font-sans font-normal text-amber-200">COINS</span>
          </div>
        </div>

        {/* Quick Reactions to congratulate */}
        <div className="w-full mb-5">
          <span className="text-xs text-gray-400 mb-2 block">Quick Reactions:</span>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {['🎉', '👑', '🔥', '💰', '🍀', '💀', '👏'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => onSendReaction(emoji)}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-xl flex items-center justify-center transition-transform hover:scale-125 active:scale-95 cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Dismiss / Continue button */}
        <button
          onClick={onDismiss}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 text-white font-heading font-bold text-sm tracking-wider uppercase hover:brightness-110 active:scale-98 shadow-lg cursor-pointer"
        >
          CONTINUE TO NEXT ROUND
        </button>
      </div>
    </div>
  );
};
