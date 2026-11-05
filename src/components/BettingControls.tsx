import React from 'react';
import type { Player, GameStatus } from '../types.ts';
import { sounds } from '../utils/sound.ts';
import { Play, Check, RotateCcw, Zap, Sparkles } from 'lucide-react';

interface BettingControlsProps {
  player: Player | undefined;
  status: GameStatus;
  isHost: boolean;
  canStart: boolean;
  onBetChange: (delta: number) => void;
  onToggleReady: () => void;
  onStartGame: () => void;
  onOpenFaucet: () => void;
}

export const BettingControls: React.FC<BettingControlsProps> = ({
  player,
  status,
  isHost,
  canStart,
  onBetChange,
  onToggleReady,
  onStartGame,
  onOpenFaucet,
}) => {
  const currentBet = player?.betAmount || 0;
  const currentCoins = player?.coins || 0;
  const isSpinning = status === 'spinning' || status === 'celebrating';

  const CHIP_VALUES = [
    { value: 10, label: '+10', bg: 'from-zinc-800 to-zinc-950 border-zinc-600 text-zinc-200' },
    { value: 50, label: '+50', bg: 'from-red-800 to-red-950 border-red-500 text-red-100 shadow-[0_0_10px_rgba(225,29,72,0.3)]' },
    { value: 100, label: '+100', bg: 'from-rose-600 to-rose-900 border-rose-400 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]' },
    { value: 500, label: '+500', bg: 'from-amber-600 to-amber-900 border-amber-300 text-amber-100 shadow-[0_0_15px_rgba(251,191,36,0.4)]' },
  ];

  const handleChipClick = (amount: number) => {
    if (isSpinning) return;
    if (currentCoins >= amount) {
      sounds.playChip();
      onBetChange(amount);
    }
  };

  const handleAllIn = () => {
    if (isSpinning || currentCoins <= 0) return;
    sounds.playChip();
    onBetChange(currentCoins);
  };

  const handleResetBet = () => {
    if (isSpinning || currentBet <= 0) return;
    sounds.playChip();
    onBetChange(-currentBet);
  };

  return (
    <div className="bg-[#12080d]/90 backdrop-blur-md rounded-2xl border border-red-950/70 p-4 shadow-2xl flex flex-col gap-3.5">
      {/* Bet Summary Banner */}
      <div className="flex items-center justify-between px-3 py-2 bg-black/60 rounded-xl border border-red-900/30">
        <div>
          <span className="text-[11px] text-gray-400 uppercase font-semibold">YOUR CURRENT STAKE</span>
          <div className="text-xl sm:text-2xl font-mono font-extrabold text-rose-300 flex items-center gap-1.5">
            <span className="text-rose-500">🎲</span>
            {currentBet.toLocaleString()}{' '}
            <span className="text-xs text-rose-400/80 font-normal">Chips</span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[11px] text-gray-400 uppercase font-semibold">WALLET BALANCE</span>
          <div className="text-base sm:text-lg font-mono font-bold text-amber-300 flex items-center justify-end gap-1">
            <span>🪙</span>
            {currentCoins.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Chip Buttons Row */}
      <div className="flex items-center justify-between gap-1.5 sm:gap-2 flex-wrap">
        {CHIP_VALUES.map((chip) => {
          const disabled = isSpinning || currentCoins < chip.value;
          return (
            <button
              key={chip.value}
              disabled={disabled}
              onClick={() => handleChipClick(chip.value)}
              className={`flex-1 min-w-[55px] h-12 rounded-xl bg-gradient-to-b ${chip.bg} border-2 font-mono font-extrabold text-xs sm:text-sm flex flex-col items-center justify-center transition-all transform active:scale-95 disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer hover:-translate-y-0.5`}
            >
              <span>{chip.label}</span>
              <span className="text-[9px] opacity-75 font-sans font-normal">CHIP</span>
            </button>
          );
        })}

        {/* ALL IN Button */}
        <button
          disabled={isSpinning || currentCoins <= 0}
          onClick={handleAllIn}
          className="flex-1 min-w-[65px] h-12 rounded-xl bg-gradient-to-b from-purple-800 to-purple-950 border-2 border-purple-400 text-purple-100 font-bold text-xs flex flex-col items-center justify-center transition-all transform active:scale-95 disabled:opacity-35 cursor-pointer shadow-[0_0_12px_rgba(168,85,247,0.3)] hover:-translate-y-0.5"
        >
          <span className="flex items-center gap-0.5"><Zap className="w-3 h-3 text-yellow-300" /> MAX</span>
          <span className="text-[9px] opacity-75">ALL IN</span>
        </button>

        {/* Clear Bet */}
        <button
          disabled={isSpinning || currentBet <= 0}
          onClick={handleResetBet}
          title="Reset Stake"
          className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-all disabled:opacity-30 cursor-pointer active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Free Coins helper if player runs low */}
      {currentCoins < 50 && (
        <button
          onClick={onOpenFaucet}
          className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-950/80 to-yellow-950/80 border border-amber-500/60 text-amber-200 text-xs font-bold flex items-center justify-center gap-2 animate-bounce cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          Running low? Claim Free +500 Coins now!
        </button>
      )}

      {/* Main Action Call to Action */}
      <div className="pt-1">
        {isHost ? (
          <button
            disabled={!canStart || isSpinning}
            onClick={onStartGame}
            className={`w-full py-3.5 px-4 rounded-xl font-heading font-black text-base tracking-wider flex items-center justify-center gap-2 transition-all shadow-xl cursor-pointer ${
              canStart && !isSpinning
                ? 'bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 text-white hover:brightness-110 active:scale-98 glow-red-lg'
                : 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
            }`}
          >
            {isSpinning ? (
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-white animate-ping" />
                DROP IN PROGRESS...
              </span>
            ) : canStart ? (
              <>
                <Play className="w-5 h-5 fill-white" />
                SPIN LUCKY DROP
              </>
            ) : (
              'WAITING FOR 2+ PLAYERS...'
            )}
          </button>
        ) : (
          <button
            disabled={isSpinning}
            onClick={onToggleReady}
            className={`w-full py-3.5 px-4 rounded-xl font-heading font-bold text-sm tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer ${
              player?.isReady
                ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white glow-gold active:scale-98'
                : 'bg-gradient-to-r from-red-900 to-rose-900 text-rose-100 hover:brightness-110 active:scale-98'
            }`}
          >
            {player?.isReady ? (
              <>
                <Check className="w-5 h-5" />
                READY! WAITING FOR HOST TO SPIN
              </>
            ) : (
              <>
                <Check className="w-4 h-4 opacity-70" />
                CONFIRM READY TO DROP
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
