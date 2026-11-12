import React from 'react';
import { Layers, Terminal, BookOpen, Smartphone, Globe, Shield, Code, Sparkles } from 'lucide-react';
import { Product } from '../types';

interface ProductThumbnailProps {
  product: Product;
  className?: string;
}

export const ProductThumbnail: React.FC<ProductThumbnailProps> = ({ product, className = '' }) => {
  // If a custom image was uploaded by admin (Base64 or image path)
  if (product.image && product.image.trim() !== '') {
    return (
      <div className={`relative w-full h-56 bg-slate-900/90 overflow-hidden flex items-center justify-center ${className}`}>
        <img
          src={product.image}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            // Fallback if image fails
            (e.currentTarget as HTMLElement).style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-transparent opacity-80" />
      </div>
    );
  }

  // Domain-specific styled high-fidelity vector mockups based on product category & theme
  if (product.id === 'prod-minha-obra' || product.category === 'apps') {
    return (
      <div className={`relative w-full h-56 bg-gradient-to-b from-[#0a1226] via-[#09101f] to-[#070b14] overflow-hidden flex flex-col items-center justify-center p-6 border-b border-slate-800/60 ${className}`}>
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />
        
        {/* Glow */}
        <div className="absolute w-28 h-28 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-sky-400 p-0.5 shadow-lg shadow-cyan-500/20 mb-3 group-hover:scale-110 transition-transform duration-300">
            <div className="w-full h-full bg-[#081024] rounded-[14px] flex items-center justify-center">
              <Layers className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
          <h4 className="text-base font-bold text-white tracking-wide">{product.name.split('-')[0].trim()}</h4>
          <span className="text-xs text-cyan-400/80 font-medium tracking-wider uppercase mt-0.5">Aplicativo Mobile</span>
        </div>

        <div className="absolute bottom-2 right-3 flex items-center gap-1 text-[10px] text-slate-500 font-mono">
          <Smartphone className="w-3 h-3 text-cyan-400" />
          <span>Android / iOS</span>
        </div>
      </div>
    );
  }

  if (product.id === 'prod-xbox-desbloqueio' || (product.category === 'scripts' && product.name.includes('Xbox'))) {
    return (
      <div className={`relative w-full h-56 bg-gradient-to-b from-[#13111c] via-[#0d101a] to-[#070b14] overflow-hidden flex flex-col items-center justify-center p-6 border-b border-slate-800/60 ${className}`}>
        {/* Background glow and podium */}
        <div className="absolute w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        
        {/* Mockup phone & exploit graphics */}
        <div className="relative z-10 flex items-center justify-center">
          <div className="relative w-28 h-40 bg-slate-900 rounded-xl border border-emerald-500/40 p-2 shadow-2xl shadow-emerald-950/50 flex flex-col items-center justify-between group-hover:-translate-y-1 transition-transform duration-300">
            <div className="w-8 h-1 bg-slate-700 rounded-full" />
            <div className="w-full flex-1 my-1 rounded bg-[#090e17] p-1.5 flex flex-col items-center justify-center text-center">
              <Shield className="w-6 h-6 text-emerald-400 mb-1" />
              <span className="text-[9px] font-bold text-emerald-300 font-mono">ABadAvatar</span>
              <span className="text-[7px] text-slate-400">v1.3 Hypervisor</span>
            </div>
            <div className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>
          </div>

          {/* Pedestal effect */}
          <div className="absolute -bottom-6 w-36 h-8 bg-slate-800/70 rounded-[100%] blur-sm border border-slate-700/40" />
        </div>

        <div className="absolute bottom-2 left-3 flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
          <Terminal className="w-3 h-3" />
          <span>Exploit Software</span>
        </div>
      </div>
    );
  }

  if (product.category === 'livros') {
    return (
      <div className={`relative w-full h-56 bg-gradient-to-b from-[#171329] via-[#0f111e] to-[#070b14] overflow-hidden flex flex-col items-center justify-center p-6 border-b border-slate-800/60 ${className}`}>
        <div className="absolute w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
        
        {/* 3D Book Graphic */}
        <div className="relative z-10 flex items-center justify-center">
          <div className="w-28 h-36 bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-800 rounded-r-lg rounded-l-sm shadow-xl shadow-purple-950/60 border-l-4 border-indigo-500 p-2 flex flex-col justify-between group-hover:rotate-1 group-hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <BookOpen className="w-4 h-4 text-purple-300" />
              <span className="text-[8px] font-mono text-purple-300 font-bold uppercase">E-BOOK</span>
            </div>
            <div className="text-center my-1">
              <span className="text-[9px] font-extrabold text-white leading-tight block line-clamp-3">
                {product.name.replace('Livro:', '').trim()}
              </span>
            </div>
            <div className="border-t border-purple-400/20 pt-1 flex justify-between items-center text-[7px] text-purple-200">
              <span>PDF / ePub</span>
              <span>2026</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-2 right-3 flex items-center gap-1 text-[10px] text-indigo-400 font-mono">
          <Sparkles className="w-3 h-3" />
          <span>Alta Resolução</span>
        </div>
      </div>
    );
  }

  if (product.category === 'sites') {
    return (
      <div className={`relative w-full h-56 bg-gradient-to-b from-[#0b1928] via-[#0a121f] to-[#070b14] overflow-hidden flex flex-col items-center justify-center p-6 border-b border-slate-800/60 ${className}`}>
        <div className="absolute w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
        
        {/* Browser Mockup */}
        <div className="relative z-10 w-44 h-32 bg-slate-900/90 rounded-lg border border-sky-500/30 shadow-xl overflow-hidden flex flex-col group-hover:border-sky-500/60 transition-colors">
          <div className="h-5 bg-slate-800 px-2 flex items-center justify-between border-b border-slate-700/60">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>
            <span className="text-[8px] text-slate-400 font-mono">saas-delivery.app</span>
            <Globe className="w-2.5 h-2.5 text-sky-400" />
          </div>
          <div className="flex-1 p-2 flex flex-col gap-1.5 bg-[#080d1a]">
            <div className="h-2 w-2/3 bg-sky-600/40 rounded" />
            <div className="grid grid-cols-2 gap-1 mt-1">
              <div className="h-10 bg-slate-800/60 rounded border border-slate-700/40 p-1 flex flex-col justify-between">
                <div className="w-full h-1 bg-slate-600 rounded" />
                <div className="w-1/2 h-1 bg-emerald-400 rounded" />
              </div>
              <div className="h-10 bg-slate-800/60 rounded border border-slate-700/40 p-1 flex flex-col justify-between">
                <div className="w-full h-1 bg-slate-600 rounded" />
                <div className="w-1/2 h-1 bg-sky-400 rounded" />
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-2 left-3 flex items-center gap-1 text-[10px] text-sky-400 font-mono">
          <Globe className="w-3 h-3" />
          <span>SaaS Completo</span>
        </div>
      </div>
    );
  }

  // Default / Script thumbnail
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
