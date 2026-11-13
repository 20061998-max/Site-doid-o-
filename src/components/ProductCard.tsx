import React from 'react';
import { MessageCircle, Key, ArrowUpRight, Code2 } from 'lucide-react';
import { Product, AppSettings } from '../types';
import { ProductThumbnail } from './ProductThumbnail';
import { buildWhatsAppBuyUrl } from '../utils/storage';

interface ProductCardProps {
  product: Product;
  settings: AppSettings;
  onOpenDetails: (product: Product) => void;
  onOpenUnlock: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  settings,
  onOpenDetails,
  onOpenUnlock,
}) => {
  const whatsAppBuyUrl = buildWhatsAppBuyUrl(settings.whatsappNumber, product);

  const formatPrice = (value: number) => {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="group relative bg-[#0B101D] border border-slate-800/80 rounded-2xl overflow-hidden hover:border-slate-700/80 hover:shadow-xl hover:shadow-cyan-950/20 transition-all duration-300 flex flex-col justify-between">
      {/* Card Header Tags */}
      <div className="p-3.5 pb-2 flex items-center justify-between gap-2 z-10 bg-[#0B101D]/90 backdrop-blur-sm">
        <span className="text-[11px] font-semibold text-slate-300 bg-slate-800/90 px-2.5 py-0.5 rounded-md border border-slate-700/60">
          {product.categoryLabel}
        </span>
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{product.badge || 'Pronto para entrega'}</span>
        </div>
      </div>

      {/* Visual Image / Thumbnail */}
      <div
        className="cursor-pointer relative overflow-hidden"
        onClick={() => onOpenDetails(product)}
        title="Clique para ver detalhes completos"
      >
        <ProductThumbnail product={product} />
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Tech stack / Format subtitle */}
          <div className="flex items-center gap-1.5 text-xs text-cyan-400/90 font-mono mb-2 line-clamp-1">
            <Code2 className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
            <span className="truncate">{product.format}</span>
          </div>

          {/* Product Title */}
          <h3
            onClick={() => onOpenDetails(product)}
            className="text-base sm:text-lg font-bold text-white tracking-tight hover:text-cyan-400 transition-colors cursor-pointer font-['Outfit'] line-clamp-1"
          >
            {product.name}
          </h3>

          {/* Short Description */}
          <p className="mt-1.5 text-xs text-slate-400 leading-relaxed line-clamp-2">
            {product.shortDescription}
          </p>
        </div>

        {/* Pricing and Action Section */}
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          {/* Price Strip */}
          <div className="flex items-end justify-between mb-3">
            <div>
              <span className="block text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                VALOR À VISTA (PIX)
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-black text-white font-mono">
                  R$ {formatPrice(product.promoPrice)}
                </span>
                {product.originalPrice > product.promoPrice && (
                  <span className="text-xs text-slate-500 line-through font-mono">
                    R$ {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => onOpenDetails(product)}
              className="inline-flex items-center gap-0.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <span>Detalhes</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* WhatsApp Buy Button */}
          {settings.whatsappNumber.replace(/\D/g, '') ? (
            <a
              href={whatsAppBuyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-emerald-950/40 flex items-center justify-center gap-2 group-hover:shadow-emerald-900/30"
            >
              <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
              <span>Comprar Agora no WhatsApp</span>
            </a>
          ) : (
            <div className="w-full py-3 px-4 bg-slate-800/80 text-slate-400 font-semibold text-xs rounded-xl border border-slate-700/60 flex items-center justify-center gap-2">
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp não configurado no Admin</span>
            </div>
          )}

          {/* Unlock with key link */}
          <button
            onClick={() => onOpenUnlock(product.id)}
            className="w-full mt-2.5 py-1.5 text-[11px] text-slate-400 hover:text-amber-400 transition-colors flex items-center justify-center gap-1.5"
          >
            <Key className="w-3 h-3 text-amber-400" />
            <span>Já comprou? Desbloquear download com senha</span>
          </button>
        </div>
      </div>
    </div>
  );
};
