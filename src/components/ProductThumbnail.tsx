import React from 'react';
import { Layers, Terminal, BookOpen, Smartphone, Globe, Code, Sparkles } from 'lucide-react';
import { Product } from '../types';

interface ProductThumbnailProps {
  product: Product;
  className?: string;
}

export const ProductThumbnail: React.FC<ProductThumbnailProps> = ({ product, className = '' }) => {
  // If a custom image was uploaded by admin (Base64 data URL)
  if (product.image && product.image.trim() !== '') {
    return (
      <div className={`relative w-full h-56 bg-slate-900/90 overflow-hidden flex items-center justify-center ${className}`}>
        <img
          src={product.image}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.currentTarget as HTMLElement).style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-transparent opacity-80" />
      </div>
    );
  }

  // Clean generic category fallback visuals when no photo has been uploaded
  if (product.category === 'apps') {
    return (
      <div className={`relative w-full h-56 bg-gradient-to-b from-[#0a1226] via-[#09101f] to-[#070b14] overflow-hidden flex flex-col items-center justify-center p-6 border-b border-slate-800/60 ${className}`}>
        <div className="absolute inset-0 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />
        <div className="absolute w-28 h-28 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-sky-400 p-0.5 shadow-lg shadow-cyan-500/20 mb-3 group-hover:scale-110 transition-transform duration-300">
            <div className="w-full h-full bg-[#081024] rounded-[14px] flex items-center justify-center">
              <Layers className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
          <h4 className="text-base font-bold text-white tracking-wide line-clamp-1 max-w-[240px]">
            {product.name}
          </h4>
          <span className="text-xs text-cyan-400/80 font-medium tracking-wider uppercase mt-0.5">
            {product.categoryLabel || 'Aplicativo Mobile'}
          </span>
        </div>

        <div className="absolute bottom-2 right-3 flex items-center gap-1 text-[10px] text-slate-500 font-mono">
          <Smartphone className="w-3 h-3 text-cyan-400" />
          <span>App</span>
        </div>
      </div>
    );
  }

  if (product.category === 'livros') {
    return (
      <div className={`relative w-full h-56 bg-gradient-to-b from-[#171329] via-[#0f111e] to-[#070b14] overflow-hidden flex flex-col items-center justify-center p-6 border-b border-slate-800/60 ${className}`}>
        <div className="absolute w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-center">
          <div className="w-28 h-36 bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-800 rounded-r-lg rounded-l-sm shadow-xl shadow-purple-950/60 border-l-4 border-indigo-500 p-2 flex flex-col justify-between group-hover:rotate-1 group-hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <BookOpen className="w-4 h-4 text-purple-300" />
              <span className="text-[8px] font-mono text-purple-300 font-bold uppercase">E-BOOK</span>
            </div>
            <div className="text-center my-1">
              <span className="text-[9px] font-extrabold text-white leading-tight block line-clamp-3">
                {product.name}
              </span>
            </div>
            <div className="border-t border-purple-400/20 pt-1 flex justify-between items-center text-[7px] text-purple-200">
              <span>Digital</span>
              <span>{product.fileSize}</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-2 right-3 flex items-center gap-1 text-[10px] text-indigo-400 font-mono">
          <Sparkles className="w-3 h-3" />
          <span>E-book</span>
        </div>
      </div>
    );
  }

  if (product.category === 'sites') {
    return (
      <div className={`relative w-full h-56 bg-gradient-to-b from-[#0b1928] via-[#0a121f] to-[#070b14] overflow-hidden flex flex-col items-center justify-center p-6 border-b border-slate-800/60 ${className}`}>
        <div className="absolute w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 w-44 h-32 bg-slate-900/90 rounded-lg border border-sky-500/30 shadow-xl overflow-hidden flex flex-col group-hover:border-sky-500/60 transition-colors">
          <div className="h-5 bg-slate-800 px-2 flex items-center justify-between border-b border-slate-700/60">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>
            <Globe className="w-2.5 h-2.5 text-sky-400" />
          </div>
          <div className="flex-1 p-2 flex flex-col items-center justify-center bg-[#080d1a] text-center">
            <Globe className="w-6 h-6 text-sky-400 mb-1" />
            <span className="text-[10px] font-bold text-white line-clamp-2">{product.name}</span>
          </div>
        </div>

        <div className="absolute bottom-2 left-3 flex items-center gap-1 text-[10px] text-sky-400 font-mono">
          <Globe className="w-3 h-3" />
          <span>Site & SaaS</span>
        </div>
      </div>
    );
  }

  if (product.category === 'scripts') {
    return (
      <div className={`relative w-full h-56 bg-gradient-to-b from-[#0f1724] via-[#0a111c] to-[#070b14] overflow-hidden flex flex-col items-center justify-center p-6 border-b border-slate-800/60 ${className}`}>
        <div className="absolute w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="w-14 h-14 rounded-2xl bg-emerald-950/70 border border-emerald-500/30 flex items-center justify-center mb-3 shadow-lg">
          <Terminal className="w-7 h-7 text-emerald-400" />
        </div>
        <h4 className="text-sm font-bold text-white text-center max-w-[220px] line-clamp-1">
          {product.name}
        </h4>
        <span className="text-xs text-emerald-400/80 mt-1">{product.categoryLabel}</span>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-56 bg-gradient-to-b from-[#0e1726] via-[#09111c] to-[#070b14] overflow-hidden flex flex-col items-center justify-center p-6 border-b border-slate-800/60 ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-slate-800/90 border border-slate-700 flex items-center justify-center mb-2 shadow-lg">
        <Code className="w-7 h-7 text-cyan-400" />
      </div>
      <h4 className="text-sm font-semibold text-slate-200 text-center max-w-[200px] line-clamp-1">{product.name}</h4>
      <span className="text-xs text-slate-400 mt-1">{product.categoryLabel}</span>
    </div>
  );
};
