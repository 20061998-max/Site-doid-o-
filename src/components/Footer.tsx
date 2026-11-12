import React from 'react';
import { DownloadCloud, MessageCircle, Key, Lock, ShieldCheck } from 'lucide-react';
import { AppSettings } from '../types';
import { buildWhatsAppAdUrl } from '../utils/storage';

interface FooterProps {
  settings: AppSettings;
  onOpenUnlock: () => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  onOpenUnlock,
  onOpenAdmin,
}) => {
  const adUrl = buildWhatsAppAdUrl(settings.whatsappNumber);
  const whatsAppDirectUrl = `https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}`;

  return (
    <footer className="mt-16 bg-[#050811] border-t border-slate-800/80 pt-12 pb-8 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800/60">
          {/* Col 1: Brand & Bio */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
                <DownloadCloud className="w-4 h-4 text-cyan-400" />
              </div>
              <span className="text-lg font-black text-white tracking-tight font-['Outfit']">
                DOIDÃO<span className="text-cyan-400">DOWNLOADS</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              Plataforma especializada na venda de aplicativos móveis, livros digitais, código-fonte e sistemas prontos. Pagamento facilitado via Pix e entrega de chaves com download seguro via WhatsApp.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Transações auditadas e suporte individual</span>
            </div>
          </div>

          {/* Col 2: Navegação & Ações */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-['Outfit']">
              Navegação
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href={adUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 transition-colors flex items-center gap-1.5"
                >
                  <MessageCircle className="w-3 h-3 text-emerald-400" />
                  <span>Anuncie Aqui no WhatsApp</span>
                </a>
              </li>
              <li>
                <button
                  onClick={onOpenUnlock}
                  className="hover:text-cyan-400 transition-colors flex items-center gap-1.5 text-left"
                >
                  <Key className="w-3 h-3 text-amber-400" />
                  <span>Resgatar Download com Senha</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenAdmin}
                  className="hover:text-cyan-400 transition-colors flex items-center gap-1.5 text-left"
                >
                  <Lock className="w-3 h-3 text-cyan-400" />
                  <span>Área da Administração</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Atendimento Direto */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-['Outfit']">
              Atendimento Direto
            </h4>
            <p className="text-[11px] text-slate-400">
              Dúvidas antes de comprar ou suporte pós-venda? Chame agora:
            </p>
            <a
              href={whatsAppDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-md shadow-emerald-950/40 text-xs"
            >
              <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
              <span>WhatsApp {settings.whatsappFormatted}</span>
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} Doidão Downloads. Todos os direitos reservados.</p>
          <p className="text-slate-500">
            Ambiente 100% Protegido · Entrega Imediata de Chaves
          </p>
        </div>
      </div>
    </footer>
  );
};
