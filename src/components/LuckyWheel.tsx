import React, { useEffect, useRef, useState, useMemo } from 'react';
import type { Player, GameStatus } from '../types.ts';
import { sounds } from '../utils/sound.ts';
import { Flame, Sparkles } from 'lucide-react';

interface LuckyWheelProps {
  players: Player[];
  status: GameStatus;
  winnerAngle: number;
  winnerId: string | null;
  pot: number;
  onSpinComplete?: () => void;
}

export const LuckyWheel: React.FC<LuckyWheelProps> = ({
  players,
  status,
  winnerAngle,
  pot,
  onSpinComplete,
}) => {
  const [rotation, setRotation] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [flapperActive, setFlapperActive] = useState<boolean>(false);
  const tickIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Wheel slices calculation based on bets (or equal slices if pot is 0)
  const slices = useMemo(() => {
    const list = players.length > 0 ? players : [];
    if (list.length === 0) return [];

    const totalWeight = list.reduce((sum, p) => sum + Math.max(p.betAmount, 10), 0);
    let startAngle = 0;

    return list.map((player) => {
      const weight = Math.max(player.betAmount, 10);
      const angle = (weight / totalWeight) * 360;
      const endAngle = startAngle + angle;
      const midAngle = startAngle + angle / 2;
      const percentage = Math.round((weight / totalWeight) * 100);

      const sliceData = {
        player,
        startAngle,
        endAngle,
        midAngle,
        percentage,
      };

      startAngle = endAngle;
      return sliceData;
    });
  }, [players]);

  // Handle server spin event
  useEffect(() => {
    if (status === 'spinning' && winnerAngle > 0) {
      setIsSpinning(true);
      sounds.playSpinStart();

      // Start tick sound rhythm simulating deceleration
      const startTime = performance.now();
      const spinDuration = 6000;
      let lastTickTime = startTime;
      let tickGap = 50; // starts fast

      if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);

      const interval = setInterval(() => {
        const now = performance.now();
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / spinDuration);

        // cubic easing deceleration for tick frequency
        tickGap = 40 + Math.pow(progress, 3) * 450;

        if (now - lastTickTime >= tickGap) {
          sounds.playTick(1.0 + (1 - progress) * 0.4);
          setFlapperActive(true);
          setTimeout(() => setFlapperActive(false), 35);
          lastTickTime = now;
        }

        if (progress >= 1) {
          clearInterval(interval);
        }
      }, 20);

      tickIntervalRef.current = interval;

      // Animate rotation to server target angle
      setRotation(winnerAngle);

      const timer = setTimeout(() => {
        setIsSpinning(false);
        if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
        onSpinComplete?.();
      }, spinDuration + 100);

      return () => {
        clearTimeout(timer);
        if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
      };
    }
  }, [status, winnerAngle, onSpinComplete]);

  // Helper to generate SVG pie slices
  const getCoordinatesForPercent = (angleInDegrees: number, radius: number) => {
    // 0 deg is at 12 o'clock
    const rad = ((angleInDegrees - 90) * Math.PI) / 180;
    return {
      x: 200 + radius * Math.cos(rad),
      y: 200 + radius * Math.sin(rad),
    };
  };

  const WHEEL_RADIUS = 186;

  return (
    <div className="relative flex flex-col items-center justify-center p-3 select-none">
      {/* Outer Glowing Crown Halo */}
      <div className="relative w-[340px] h-[340px] sm:w-[420px] sm:h-[420px] flex items-center justify-center">
        {/* Ambient background glow ring */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-rose-600/30 via-red-950/20 to-amber-500/20 blur-xl pointer-events-none" />

        {/* Outer Wheel Rim (Gold & Metallic Carbon) */}
        <div className="absolute inset-0 rounded-full border-4 border-amber-500/40 shadow-[0_0_35px_rgba(225,29,72,0.5)] bg-gradient-to-b from-[#251016] via-[#12080c] to-[#0a0507]" />

        {/* 24 Golden Pegs around perimeter */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 24 }).map((_, i) => {
            const pegAngle = (i * 360) / 24;
            return (
              <div
                key={i}
                className="absolute w-2.5 h-2.5 rounded-full bg-gradient-to-b from-amber-200 to-amber-600 border border-yellow-200 shadow-sm"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `rotate(${pegAngle}deg) translate(0, -${198}px) translate(-50%, -50%)`,
                }}
              />
            );
          })}
        </div>

        {/* Pointer / Flapper at Top (12 o'clock) */}
        <div
          className={`absolute top-[-10px] z-30 flex flex-col items-center pointer-events-none transition-transform duration-75 ${
            flapperActive ? 'flapper-animate' : ''
          }`}
        >
          {/* Top Flapper Anchor */}
          <div className="w-7 h-7 rounded-full bg-gradient-to-b from-amber-300 via-amber-500 to-amber-700 border-2 border-amber-200 shadow-lg flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-inner" />
          </div>
          {/* Arrow Tip */}
          <div className="w-0 h-0 border-l-[11px] border-l-transparent border-r-[11px] border-r-transparent border-t-[22px] border-t-amber-400 drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)] filter" />
        </div>

        {/* Spinning Wheel SVG */}
        <div
          className="w-[372px] h-[372px] sm:w-[372px] sm:h-[372px] rounded-full overflow-hidden"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning
              ? 'transform 6000ms cubic-bezier(0.12, 0.82, 0.22, 1)'
              : 'none',
          }}
        >
          <svg viewBox="0 0 400 400" className="w-full h-full">
            <defs>
              <filter id="inner-shadow">
                <feOffset dx="0" dy="0" />
                <feGaussianBlur stdDeviation="3" result="offset-blur" />
                <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" />
                <feFlood floodColor="black" floodOpacity="0.4" result="color" />
                <feComposite operator="in" in="color" in2="inverse" result="shadow" />
                <feComposite operator="over" in="shadow" in2="SourceGraphic" />
              </filter>
            </defs>

            {/* Empty state if 0 players */}
            {slices.length === 0 && (
              <circle cx="200" cy="200" r={WHEEL_RADIUS} fill="#1f1217" stroke="#441a24" strokeWidth="3" />
            )}

            {/* If 1 player, single full circle */}
            {slices.length === 1 && (
              <circle
                cx="200"
                cy="200"
                r={WHEEL_RADIUS}
                fill={slices[0].player.color}
                stroke="#fbbf24"
                strokeWidth="2"
              />
            )}

            {/* Multiple player slices */}
            {slices.length > 1 &&
              slices.map((slice, idx) => {
                const start = getCoordinatesForPercent(slice.startAngle, WHEEL_RADIUS);
                const end = getCoordinatesForPercent(slice.endAngle, WHEEL_RADIUS);
                const largeArcFlag = slice.endAngle - slice.startAngle > 180 ? 1 : 0;
                const pathData = [
                  `M 200 200`,
                  `L ${start.x} ${start.y}`,
                  `A ${WHEEL_RADIUS} ${WHEEL_RADIUS} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
                  'Z',
                ].join(' ');

                // Calculate label position (avatar + name)
                const labelRadius = WHEEL_RADIUS * 0.65;
                const labelPos = getCoordinatesForPercent(slice.midAngle, labelRadius);

                return (
                  <g key={slice.player.id || idx}>
                    <path
                      d={pathData}
                      fill={slice.player.color}
                      stroke="#1e0b12"
                      strokeWidth="2.5"
                      className="transition-colors duration-300"
                    />
                    {/* Dark gradient overlay for slice depth */}
                    <path
                      d={pathData}
                      fill="url(#slice-shade)"
                      opacity="0.25"
                    />

                    {/* Slice content (Avatar, Name, %) */}
                    <g
                      transform={`translate(${labelPos.x}, ${labelPos.y}) rotate(${slice.midAngle} 0 0)`}
                      className="pointer-events-none select-none"
                    >
                      <text
                        x="0"
                        y="-10"
                        fontSize="22"
                        textAnchor="middle"
                        dominantBaseline="central"
                      >
                        {slice.player.avatar}
                      </text>
                      <text
                        x="0"
                        y="12"
                        fill="#ffffff"
                        fontSize="11"
                        fontWeight="800"
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="font-mono drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]"
                      >
                        {slice.percentage}%
                      </text>
                      <text
                        x="0"
                        y="25"
                        fill="#fef08a"
                        fontSize="9"
                        fontWeight="700"
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] opacity-90"
                      >
                        {slice.player.name.substring(0, 9)}
                      </text>
                    </g>
                  </g>
                );
              })}
          </svg>
        </div>

        {/* Center Jackpot Hub */}
        <div className="absolute z-20 w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-[#1b0a11] via-[#310c17] to-[#17050d] border-4 border-amber-400 shadow-[0_0_30px_rgba(225,29,72,0.8)] flex flex-col items-center justify-center p-2 text-center">
          <div className="flex items-center gap-1 text-[10px] font-bold text-amber-300 tracking-wider uppercase">
            <Sparkles className="w-3 h-3 text-amber-400" />
            LUCKY DROP
            <Flame className="w-3 h-3 text-rose-500 fill-rose-500" />
          </div>

          <div className="text-[10px] text-gray-400 uppercase font-semibold">JACKPOT</div>

          <div className="text-amber-300 font-extrabold text-base sm:text-lg font-mono drop-shadow-[0_2px_8px_rgba(251,191,36,0.6)]">
            🪙 {pot.toLocaleString()}
          </div>

          <div className="text-[9px] text-rose-400 font-medium">
            {status === 'spinning' ? 'SPINNING...' : status === 'celebrating' ? 'WINNER!' : 'PLACE BETS'}
          </div>
        </div>
      </div>

      {/* Quick Status Sub-Bar */}
      <div className="mt-3 flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 border border-red-900/40 backdrop-blur-md shadow-md text-xs">
        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
        <span className="text-gray-300">
          {status === 'spinning'
            ? '⚡ Round in motion! Determining lucky winner...'
            : status === 'celebrating'
            ? '🎉 Winner selected! Watch the drop celebration!'
            : `${players.length} / 8 players in room • Place your chips!`}
        </span>
      </div>
    </div>
  );
};
