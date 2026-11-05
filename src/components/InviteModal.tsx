import React, { useState } from 'react';
import { Copy, Check, Share2, Users, X, Sparkles } from 'lucide-react';

interface InviteModalProps {
  roomCode: string;
  roomName: string;
  onClose: () => void;
}

export const InviteModal: React.FC<InviteModalProps> = ({ roomCode, roomName, onClose }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const inviteUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?room=${roomCode}`
    : `https://luckydrop.game?room=${roomCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join my LUCKY DROP room: ${roomName}`,
          text: `Drop into the action! Enter room code: ${roomCode}`,
          url: inviteUrl,
        });
      } catch {}
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-[#160a10] border-2 border-red-900/60 rounded-3xl p-6 shadow-2xl text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-full bg-white/5 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-600 mx-auto flex items-center justify-center text-white mb-3 shadow-lg">
          <Users className="w-6 h-6" />
        </div>

        <h3 className="font-heading font-black text-xl text-white mb-1">
          INVITE FRIENDS
        </h3>
        <p className="text-xs text-gray-400 mb-5">
          Share this code or link with friends to play up to 8 players in {roomName}!
        </p>

        {/* Room Code Display */}
        <div className="bg-black/60 border border-red-900/40 rounded-2xl p-3 mb-4 flex items-center justify-between">
          <div className="text-left">
            <span className="text-[10px] text-gray-400 uppercase font-semibold block">ROOM CODE</span>
            <span className="text-2xl font-mono font-black tracking-widest text-amber-300">
              {roomCode}
            </span>
          </div>
          <button
            onClick={handleCopyCode}
            className="px-3 py-2 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-800 text-rose-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
          >
            {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copiedCode ? 'COPIED' : 'COPY'}
          </button>
        </div>

        {/* Invite Link Display */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={handleCopyLink}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-red-950 to-rose-950 border border-rose-800/60 text-white text-xs font-bold flex items-center justify-center gap-2 hover:brightness-110 active:scale-98 transition-all cursor-pointer shadow-md"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-rose-400" />}
            {copiedLink ? 'LINK COPIED TO CLIPBOARD!' : 'COPY DIRECT INVITE LINK'}
          </button>

          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              onClick={handleNativeShare}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 text-white font-heading font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 hover:brightness-110 active:scale-98 transition-all cursor-pointer shadow-lg"
            >
              <Share2 className="w-4 h-4" />
              SHARE VIA SOCIAL / CHAT
            </button>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-red-950/50 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Friends can join instantly via browser on any phone or laptop!
        </div>
      </div>
    </div>
  );
};
