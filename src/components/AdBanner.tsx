import React from 'react';
import { MessageCircle, ShieldCheck } from 'lucide-react';
import { AppSettings } from '../types';
import { buildWhatsAppAdUrl } from '../utils/storage';

interface AdBannerProps {
  settings: AppSettings;
}

export const AdBanner: React.FC<AdBannerProps> = ({ settings }) => {
  const adUrl = buildWhatsAppAdUrl(settings.whatsappNumber);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-12">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0C1322] via-[#091120] to-[#0B1728] border border-cyan-500/20 p-6 sm:p-8 shadow-xl">
        {/* Glow */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Garantia de Qualidade & Entrega</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white font-['Outfit']">
              Tem um aplicativo, livro ou site e quer anunciar aqui?
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              {settings.adNotice ||
                'Aqui ninguém além de mim anuncia no site. Nós analisamos a integridade do seu produto e publicamos na vitrine para que você venda com total segurança.'}
            </p>
          </div>

          <div className="shrink-0 w-full md:w-auto">
            <a
              href={adUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-950/50 hover:shadow-emerald-900/40"
            >
              <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
              <span>Solicitar Anúncio no WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
