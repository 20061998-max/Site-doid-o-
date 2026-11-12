import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { AppSettings } from '../types';

interface FloatingWhatsAppProps {
  settings: AppSettings;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({ settings }) => {
  const [showTooltip, setShowTooltip] = useState(true);
  const whatsAppDirectUrl = `https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
    'Olá! Estou navegando no Doidão Downloads e gostaria de tirar uma dúvida sobre os produtos.'
  )}`;

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2">
      {/* Mini Tooltip */}
      {showTooltip && (
        <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl shadow-xl text-xs text-slate-200 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Fale direto comigo no WhatsApp!</span>
          <button
            onClick={() => setShowTooltip(false)}
            className="p-0.5 text-slate-400 hover:text-white rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Button */}
      <a
        href={whatsAppDirectUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-2.5 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-full shadow-2xl shadow-emerald-950/70 hover:scale-105 transition-all text-xs sm:text-sm"
      >
        <MessageCircle className="w-5 h-5 fill-white text-emerald-600" />
        <span className="hidden xs:inline">WhatsApp</span>
        <span className="font-mono text-emerald-100">{settings.whatsappFormatted}</span>
      </a>
    </div>
  );
};
