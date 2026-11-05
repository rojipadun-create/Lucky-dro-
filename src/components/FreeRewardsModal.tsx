import React, { useState } from 'react';
import { Gift, Coins, Sparkles, X, Check, Flame } from 'lucide-react';
import { sounds } from '../utils/sound.ts';

interface FreeRewardsModalProps {
  currentCoins: number;
  onClaimCoins: (amount: number) => void;
  onClose: () => void;
}

export const FreeRewardsModal: React.FC<FreeRewardsModalProps> = ({
  onClaimCoins,
  onClose,
}) => {
  const [scratched, setScratched] = useState(false);
  const [scratchReward, setScratchReward] = useState<number | null>(null);
  const [faucetClaimed, setFaucetClaimed] = useState(false);

  const handleClaimFaucet = () => {
    sounds.playCoinDrop();
    onClaimCoins(500);
    setFaucetClaimed(true);
  };

  const handleScratch = () => {
    if (scratched) return;
    const rewards = [300, 500, 750, 1000, 1500];
    const prize = rewards[Math.floor(Math.random() * rewards.length)];
    setScratchReward(prize);
    setScratched(true);
    sounds.playWinFanfare();
    onClaimCoins(prize);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-[#220d16] via-[#14080e] to-[#0a0407] border-2 border-amber-500/60 rounded-3xl p-6 shadow-2xl text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-full bg-white/5 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 mx-auto flex items-center justify-center text-white mb-3 shadow-[0_0_20px_rgba(251,191,36,0.4)]">
          <Gift className="w-7 h-7" />
        </div>

        <h3 className="font-heading font-black text-xl text-white mb-1">
          FREE COINS & REWARDS
        </h3>
        <p className="text-xs text-gray-400 mb-5">
          Claim free chips to keep the lucky streak rolling in every room!
        </p>

        <div className="space-y-4">
          {/* Daily Faucet Box */}
          <div className="bg-black/50 border border-red-950/60 rounded-2xl p-4 flex items-center justify-between">
            <div className="text-left">
              <span className="text-xs font-bold text-white flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> Hourly VIP Reload
              </span>
              <span className="text-sm font-mono font-black text-amber-300">
                +500 FREE COINS
              </span>
            </div>

            <button
              disabled={faucetClaimed}
              onClick={handleClaimFaucet}
              className={`px-3 py-2 rounded-xl font-heading font-bold text-xs uppercase transition-all cursor-pointer ${
                faucetClaimed
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:brightness-110 active:scale-95 shadow-md'
              }`}
            >
              {faucetClaimed ? (
                <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5" /> CLAIMED</span>
              ) : (
                'CLAIM NOW'
              )}
            </button>
          </div>

          {/* Lucky Mystery Scratch Box */}
          <div className="bg-gradient-to-tr from-[#1f0b13] to-[#2c0f1d] border-2 border-dashed border-amber-500/50 rounded-2xl p-4 text-center">
            <span className="text-xs font-bold text-amber-300 flex items-center justify-center gap-1 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              LUCKY MYSTERY SCRATCHCARD
            </span>

            {!scratched ? (
              <button
                onClick={handleScratch}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-rose-700 via-red-600 to-rose-700 hover:from-rose-600 hover:to-red-500 text-white font-heading font-black text-sm tracking-wider uppercase shadow-lg transition-transform active:scale-95 cursor-pointer glow-red"
              >
                🎰 TAP TO SCRATCH & REVEAL PRIZE
              </button>
            ) : (
              <div className="py-3 bg-black/60 rounded-xl border border-amber-400 animate-in zoom-in-95 duration-200">
                <span className="text-xs text-amber-300 uppercase font-semibold">MYSTERY PRIZE REVEALED!</span>
                <div className="text-2xl font-mono font-black text-yellow-300 flex items-center justify-center gap-1.5 mt-1">
                  <Coins className="w-6 h-6 text-amber-400" />
                  +{scratchReward?.toLocaleString()} COINS
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-gray-300 text-xs font-bold uppercase transition-all cursor-pointer"
        >
          RETURN TO GAME
        </button>
      </div>
    </div>
  );
};
