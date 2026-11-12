import React from 'react';
import { Search, CheckCircle2, KeyRound, Unlock, X } from 'lucide-react';
import { ProductCategory, AppSettings } from '../types';

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: ProductCategory;
  onSelectCategory: (category: ProductCategory) => void;
  settings: AppSettings;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
}) => {
  const categories: { id: ProductCategory; label: string }[] = [
    { id: 'todos', label: 'Todos os Projetos' },
    { id: 'apps', label: 'Aplicativos Mobile' },
    { id: 'sites', label: 'SaaS & Web' },
    { id: 'livros', label: 'Livros & E-books' },
    { id: 'scripts', label: 'Scripts & Automações' },
    { id: 'outros', label: 'Outros' },
  ];

  return (
    <section className="relative pt-8 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 text-center max-w-3xl mx-auto">
        {/* Main Hero Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight sm:leading-none font-['Outfit']">
          Vitrine Exclusiva de{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400">
            Apps, Livros, Sites & Sistemas Prontos
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed font-normal max-w-2xl mx-auto">
          Adquira soluções digitais completas com código-fonte aberto, livros técnicos e scripts de automação, sem mensalidades abusivas e com entrega validada diretamente pelo desenvolvedor.
        </p>

        {/* Search Input */}
        <div className="mt-6 max-w-xl mx-auto">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar por aplicativo, livro, site, nicho ou tecnologia (ex: Delivery, CRM, Pix)..."
              className="w-full pl-11 pr-10 py-3.5 text-sm bg-slate-900/90 text-white placeholder-slate-400 border border-slate-700/80 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3.5 p-1 text-slate-400 hover:text-white transition-colors"
                title="Limpar busca"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-bold'
                    : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3-Step Process Cards */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {/* Step 1 */}
        <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl hover:border-slate-700/80 transition-colors flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide font-['Outfit']">
              1. Escolha & Contate
            </h3>
            <p className="mt-1 text-xs text-slate-400 leading-snug">
              Clique em "Comprar Agora" para falar direto no WhatsApp com o desenvolvedor.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl hover:border-slate-700/80 transition-colors flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-950/60 border border-amber-500/30 flex items-center justify-center shrink-0">
            <KeyRound className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide font-['Outfit']">
              2. Receba a Senha Única
            </h3>
            <p className="mt-1 text-xs text-slate-400 leading-snug">
              Após autorização do pagamento, o admin emite uma senha exclusiva no painel.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl hover:border-slate-700/80 transition-colors flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Unlock className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide font-['Outfit']">
              3. Desbloqueie o Download
            </h3>
            <p className="mt-1 text-xs text-slate-400 leading-snug">
              Insira a chave no site e tenha acesso imediato ao código-fonte, PDFs e manuais.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
