import React from 'react';
import { X, MessageCircle, Key, FileCode, HardDrive, ExternalLink, ShieldCheck, Check } from 'lucide-react';
import { Product, AppSettings } from '../types';
import { ProductThumbnail } from './ProductThumbnail';
import { buildWhatsAppBuyUrl } from '../utils/storage';

interface ProductDetailsModalProps {
  product: Product | null;
  settings: AppSettings;
  onClose: () => void;
  onOpenUnlock: (productId: string) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  settings,
  onClose,
  onOpenUnlock,
}) => {
  if (!product) return null;

  const whatsAppBuyUrl = buildWhatsAppBuyUrl(settings.whatsappNumber, product);

  const formatPrice = (value: number) => {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0B101D] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header bar */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-cyan-300 bg-cyan-950/60 px-2.5 py-0.5 rounded border border-cyan-800/40">
              {product.categoryLabel}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Cód: #{product.id.slice(0, 8)}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Visual Showcase */}
          <div className="rounded-xl overflow-hidden border border-slate-800">
            <ProductThumbnail product={product} className="h-64" />
          </div>

          {/* Title & Metadata */}
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-['Outfit']">
              {product.name}
            </h2>
            <div className="mt-2.5 flex flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-1 text-cyan-300 bg-slate-900 px-2.5 py-1 rounded border border-slate-800 font-mono">
                <FileCode className="w-3.5 h-3.5" />
                <span>{product.format}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-300 bg-slate-900 px-2.5 py-1 rounded border border-slate-800 font-mono">
                <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                <span>{product.fileSize}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800/60">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Descrição Completa
            </h4>
            <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line font-normal">
              {product.fullDescription || product.shortDescription}
            </div>
          </div>

          {/* Demo Link if exists */}
          {product.demoUrl && (
            <div className="flex items-center justify-between p-3 bg-sky-950/30 border border-sky-800/40 rounded-xl text-xs">
              <span className="text-sky-300">Deseja testar ou ver uma demonstração ao vivo?</span>
              <a
                href={product.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sky-400 hover:underline font-bold"
              >
                <span>Acessar Demo</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* How it works info */}
          <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1.5">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Garantia de Entrega Doidão Downloads</span>
            </div>
            <p>
              1. Você clica em Comprar e negocia via WhatsApp direto com o vendedor.
            </p>
            <p>
              2. Pagamento efetuado via Pix com confirmação instantânea.
            </p>
            <p>
              3. O administrador gera sua chave única que libera o link seguro de download imediatamente!
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800/80 bg-[#090d18] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Preço Especial Pix
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white font-mono">
                R$ {formatPrice(product.promoPrice)}
              </span>
              {product.originalPrice > product.promoPrice && (
                <span className="text-xs text-slate-500 line-through font-mono">
                  R$ {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                onClose();
                onOpenUnlock(product.id);
              }}
              className="py-2.5 px-3.5 text-xs font-semibold text-amber-300 bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/30 rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0"
            >
              <Key className="w-4 h-4 text-amber-400" />
              <span>Já paguei / Tenho Chave</span>
            </button>

            {settings.whatsappNumber.replace(/\D/g, '') ? (
              <a
                href={whatsAppBuyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none py-2.5 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-emerald-950/40 flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
                <span>Comprar no WhatsApp</span>
              </a>
            ) : (
              <span className="flex-1 sm:flex-none py-2.5 px-4 bg-slate-800 text-slate-400 font-semibold text-xs rounded-xl border border-slate-700 text-center">
                WhatsApp não configurado
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
