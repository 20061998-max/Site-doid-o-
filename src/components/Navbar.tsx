import React from 'react';
import { ShieldCheck, MessageCircle, Key, Lock, LogOut, DownloadCloud } from 'lucide-react';
import { AppSettings } from '../types';
import { buildWhatsAppAdUrl } from '../utils/storage';

interface NavbarProps {
  settings: AppSettings;
  isAdmin: boolean;
  onOpenAdmin: () => void;
  onLogoutAdmin: () => void;
  onOpenUnlockModal: (productId?: string) => void;
  onOpenAdModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  isAdmin,
  onOpenAdmin,
  onLogoutAdmin,
  onOpenUnlockModal,
}) => {
  const adUrl = buildWhatsAppAdUrl(settings.whatsappNumber);

  return (
    <header className="sticky top-0 z-40 bg-[#070b14]/90 backdrop-blur-md border-b border-slate-800/80">
      {/* Top micro bar for trust & WhatsApp info */}
      <div className="bg-[#050811] border-b border-slate-800/40 py-1.5 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-cyan-400">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span className="font-medium tracking-tight">Compra 100% Segura com Autorização Direta via WhatsApp</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-medium">WhatsApp Oficial:</span>
            <a
              href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 font-bold hover:underline"
            >
              {settings.whatsappFormatted}
            </a>
          </div>
        </div>
      </div>

      {/* Main navigation row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-sky-400 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#070b14] rounded-[10px] flex items-center justify-center">
                <DownloadCloud className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-white font-['Outfit']">
                  DOIDÃO<span className="text-cyan-400">DOWNLOADS</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/30">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 -mt-0.5 hidden sm:block">
                Livros, Apps, Sites & Downloads Prontos
              </p>
            </div>
          </a>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Anunciar button */}
          <a
            href={adUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 rounded-lg transition-all"
            title="Anuncie seu produto com o administrador"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Anunciar</span>
          </a>

          {/* Desbloquear com chave button */}
          <button
            onClick={() => onOpenUnlockModal()}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-300 bg-amber-950/30 hover:bg-amber-900/40 border border-amber-500/30 rounded-lg transition-all"
            title="Já comprou? Digite sua chave para baixar"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden xs:inline">Resgatar</span> Download
          </button>

          {/* Admin panel button */}
          {isAdmin ? (
            <div className="flex items-center gap-1">
              <button
                onClick={onOpenAdmin}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-sky-500 hover:from-cyan-500 hover:to-sky-400 rounded-lg shadow-md shadow-cyan-900/30 transition-all"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Painel Admin</span>
              </button>
              <button
                onClick={onLogoutAdmin}
                title="Sair da Administração"
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors border border-transparent hover:border-rose-800/30"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-200 bg-slate-800/80 hover:bg-slate-700 hover:text-white border border-slate-700 rounded-lg transition-all"
            >
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Administração</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
