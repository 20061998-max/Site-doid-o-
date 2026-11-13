import React, { useState, useMemo, useEffect } from 'react';
import { AlertCircle, Loader2, PackageOpen, Plus } from 'lucide-react';
import { Product, DownloadKey, AppSettings, ProductCategory } from './types';
import { EMPTY_SETTINGS, isAdminLoggedIn, setAdminLoggedIn } from './utils/storage';
import {
  testFirestoreConnection,
  subscribeToProducts,
  subscribeToKeys,
  subscribeToSettings,
} from './services/firebase';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ProductCard } from './components/ProductCard';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { UnlockModal } from './components/UnlockModal';
import { AdBanner } from './components/AdBanner';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { AdminPanel } from './components/AdminPanel';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [keys, setKeys] = useState<DownloadKey[]>([]);
  const [settings, setSettings] = useState<AppSettings>(EMPTY_SETTINGS);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dbError, setDbError] = useState<string | null>(null);

  // Filter & Search states
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedProductDetails, setSelectedProductDetails] = useState<Product | null>(null);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [unlockProductId, setUnlockProductId] = useState<string | undefined>();
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  // Subscribe in real time to Firebase Firestore (zero localStorage or mock data)
  useEffect(() => {
    setIsAdmin(isAdminLoggedIn());
    testFirestoreConnection();

    let productsReady = false;
    let settingsReady = false;

    const markReady = () => {
      if (productsReady && settingsReady) {
        setIsLoading(false);
      }
    };

    const unsubProducts = subscribeToProducts(
      (cloudProducts) => {
        setProducts(cloudProducts);
        productsReady = true;
        markReady();
      },
      () => {
        setDbError('Não foi possível conectar ao banco de dados Firestore.');
        setIsLoading(false);
      }
    );

    const unsubSettings = subscribeToSettings(
      (cloudSettings) => {
        setSettings(cloudSettings);
        settingsReady = true;
        markReady();
      },
      () => {
        settingsReady = true;
        markReady();
      }
    );

    const unsubKeys = subscribeToKeys((cloudKeys) => {
      setKeys(cloudKeys);
    });

    return () => {
      unsubProducts();
      unsubSettings();
      unsubKeys();
    };
  }, []);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // If not admin, only show active products
      if (!isAdmin && !product.active) return false;

      // Category filter
      if (selectedCategory !== 'todos') {
        if (product.category !== selectedCategory) return false;
      }

      // Search query filter
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesDesc =
          product.shortDescription.toLowerCase().includes(query) ||
          product.fullDescription.toLowerCase().includes(query);
        const matchesFormat = product.format.toLowerCase().includes(query);
        const matchesCategory = product.categoryLabel.toLowerCase().includes(query);
        return matchesName || matchesDesc || matchesFormat || matchesCategory;
      }

      return true;
    });
  }, [products, selectedCategory, searchQuery, isAdmin]);

  const handleOpenUnlock = (productId?: string) => {
    setUnlockProductId(productId);
    setIsUnlockModalOpen(true);
  };

  const handleLogoutAdmin = () => {
    setIsAdmin(false);
    setAdminLoggedIn(false);
  };

  const hasActiveFilters = searchQuery.trim() !== '' || selectedCategory !== 'todos';

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navbar */}
      <Navbar
        settings={settings}
        isAdmin={isAdmin}
        onOpenAdmin={() => setIsAdminPanelOpen(true)}
        onLogoutAdmin={handleLogoutAdmin}
        onOpenUnlockModal={handleOpenUnlock}
      />

      {/* Hero with search and 3-step explanation */}
      <HeroSection
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        settings={settings}
      />

      {/* Products Showcase Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Section Heading Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-slate-800/80 gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-cyan-400 uppercase tracking-wider mb-1">
              <span className="text-cyan-400 font-bold">#</span>
              <span>VITRINE DISPONÍVEL</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-['Outfit']">
              {selectedCategory === 'todos'
                ? 'Todos os Softwares, Livros e Sistemas Prontos'
                : selectedCategory === 'apps'
                ? 'Aplicativos Mobile Prontos'
                : selectedCategory === 'livros'
                ? 'Livros Técnicos & E-books Digitais'
                : selectedCategory === 'sites'
                ? 'SaaS, Portais & Sistemas Web'
                : selectedCategory === 'scripts'
                ? 'Scripts, Automações & Exploits'
                : 'Outros Produtos Digitais'}
            </h2>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span>
              Exibindo <strong className="text-cyan-400">{filteredProducts.length}</strong> de {products.length} itens
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-cyan-400 hover:underline flex items-center gap-1"
              >
                <span>(Limpar busca)</span>
              </button>
            )}
          </div>
        </div>

        {/* Loading, Error, Grid, or Empty States */}
        {isLoading ? (
          <div className="py-16 text-center bg-slate-900/40 border border-slate-800 rounded-2xl p-8 max-w-lg mx-auto">
            <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mx-auto mb-3" />
            <h3 className="text-base font-bold text-white font-['Outfit']">
              Carregando vitrine do banco de dados...
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Buscando os produtos e configurações atualizadas na nuvem.
            </p>
          </div>
        ) : dbError ? (
          <div className="py-16 text-center bg-rose-950/30 border border-rose-800/50 rounded-2xl p-8 max-w-lg mx-auto">
            <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white font-['Outfit']">
              Erro de conexão com o banco de dados
            </h3>
            <p className="mt-1 text-xs text-rose-300">{dbError}</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                settings={settings}
                onOpenDetails={setSelectedProductDetails}
                onOpenUnlock={handleOpenUnlock}
              />
            ))}
          </div>
        ) : hasActiveFilters ? (
          /* Empty Search / Category Filter State */
          <div className="py-16 text-center bg-slate-900/40 border border-slate-800 rounded-2xl p-8 max-w-lg mx-auto">
            <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white font-['Outfit']">
              Nenhum produto encontrado
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Não encontramos resultados para a sua busca ou filtro atual.
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('todos');
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-colors"
              >
                Ver todos os produtos
              </button>
            </div>
          </div>
        ) : (
          /* Clean Empty Catalog State (no mock data) */
          <div className="py-16 text-center bg-slate-900/40 border border-slate-800 rounded-2xl p-8 max-w-lg mx-auto">
            <PackageOpen className="w-12 h-12 text-cyan-400/70 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white font-['Outfit']">
              Vitrine vazia no momento
            </h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              Nenhum produto foi cadastrado no banco de dados ainda. Acesse a Administração para cadastrar livros, sites, aplicativos e configurar seu WhatsApp.
            </p>
            <div className="mt-5 flex items-center justify-center">
              <button
                onClick={() => setIsAdminPanelOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-colors shadow-md shadow-cyan-950/40"
              >
                <Plus className="w-4 h-4" />
                <span>Acessar Administração</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* "Anuncie Aqui" Banner */}
      <AdBanner settings={settings} />

      {/* Footer */}
      <Footer
        settings={settings}
        onOpenUnlock={() => handleOpenUnlock()}
        onOpenAdmin={() => setIsAdminPanelOpen(true)}
      />

      {/* Floating WhatsApp button */}
      <FloatingWhatsApp settings={settings} />

      {/* Product Details Modal */}
      <ProductDetailsModal
        product={selectedProductDetails}
        settings={settings}
        onClose={() => setSelectedProductDetails(null)}
        onOpenUnlock={handleOpenUnlock}
      />

      {/* Unlock Download with Key Modal */}
      <UnlockModal
        isOpen={isUnlockModalOpen}
        onClose={() => {
          setIsUnlockModalOpen(false);
          setUnlockProductId(undefined);
        }}
        preSelectedProductId={unlockProductId}
        settings={settings}
      />

      {/* Admin Panel Modal */}
      <AdminPanel
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        products={products}
        keys={keys}
        settings={settings}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
      />
    </div>
  );
}
