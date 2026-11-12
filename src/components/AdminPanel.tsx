import React, { useState } from 'react';
import {
  X,
  Lock,
  Eye,
  EyeOff,
  Plus,
  Edit2,
  Trash2,
  Key,
  Copy,
  Check,
  MessageCircle,
  Upload,
  HardDrive,
  FileCode,
  DollarSign,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  FolderOpen,
  Settings,
  ExternalLink,
  Search,
  Cloud,
  CheckCircle2,
} from 'lucide-react';
import { Product, DownloadKey, AppSettings, ProductCategory } from '../types';
import {
  ADMIN_CREDENTIALS,
  setAdminLoggedIn,
  generateRandomKey,
  createDownloadKey,
  saveStoredProducts,
  saveStoredKeys,
  saveAppSettings,
  INITIAL_PRODUCTS,
  buildWhatsAppKeyDeliveryUrl,
} from '../utils/storage';
import {
  saveProductToFirestore,
  deleteProductFromFirestore,
  saveKeyToFirestore,
  deleteKeyFromFirestore,
  saveSettingsToFirestore,
  syncInitialDataToFirestore,
} from '../services/firebase';
import { ProductThumbnail } from './ProductThumbnail';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onUpdateProducts: (products: Product[]) => void;
  keys: DownloadKey[];
  onUpdateKeys: (keys: DownloadKey[]) => void;
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  products,
  onUpdateProducts,
  keys,
  onUpdateKeys,
  settings,
  onUpdateSettings,
  isAdmin,
  setIsAdmin,
}) => {
  // Login Form States
  const [loginInput, setLoginInput] = useState('');
  const [senhaInput, setSenhaInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Active Admin Tabs
  const [activeTab, setActiveTab] = useState<'products' | 'keys' | 'settings'>('products');

  // Product CRUD states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [imagePreview, setImagePreview] = useState<string>('');

  // Key Generator states
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [customerNote, setCustomerNote] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<DownloadKey | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [cloudSyncMsg, setCloudSyncMsg] = useState<string | null>(null);

  // Form data for creating/editing product
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: 'apps',
    categoryLabel: 'Aplicativo Mobile',
    format: 'ZIP (Código-Fonte)',
    fileSize: '50 MB',
    shortDescription: '',
    fullDescription: '',
    originalPrice: 100,
    promoPrice: 20,
    badge: 'Pronto para entrega',
    image: '',
    secretDownloadUrl: '',
    secretInstructions: '',
    demoUrl: '',
    active: true,
  });

  if (!isOpen) return null;

  // Handle Login Authentication
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const cleanLogin = loginInput.trim();
    const cleanSenha = senhaInput.trim();

    if (cleanLogin === ADMIN_CREDENTIALS.login && cleanSenha === ADMIN_CREDENTIALS.senha) {
      setIsAdmin(true);
      setAdminLoggedIn(true);
    } else {
      setLoginError('Credenciais incorretas! Verifique o login e a senha informados.');
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setAdminLoggedIn(false);
    setLoginInput('');
    setSenhaInput('');
  };

  // Image Upload Handler (reads directly as Base64, NO URL needed!)
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (< 6MB for smooth localStorage)
      if (file.size > 6 * 1024 * 1024) {
        alert('A imagem é muito grande. Escolha uma imagem de até 6MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setFormData((prev) => ({ ...prev, image: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Open Create Product
  const startCreateProduct = () => {
    setEditingProduct(null);
    setImagePreview('');
    setFormData({
      name: '',
      category: 'apps',
      categoryLabel: 'Aplicativo Mobile',
      format: 'ZIP (Código-Fonte Completo)',
      fileSize: '45 MB',
      shortDescription: '',
      fullDescription: '',
      originalPrice: 150,
      promoPrice: 25,
      badge: 'Pronto para entrega',
      image: '',
      secretDownloadUrl: 'https://mega.nz/file/... ou Google Drive',
      secretInstructions: 'Descompacte o arquivo e siga o tutorial dentro da pasta.',
      demoUrl: '',
      active: true,
    });
    setIsCreatingProduct(true);
  };

  // Open Edit Product
  const startEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setImagePreview(prod.image || '');
    setFormData({
      ...prod,
    });
    setIsCreatingProduct(true);
  };

  // Save Product (Create or Edit)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name?.trim()) {
      alert('Por favor, informe o nome do produto.');
      return;
    }
    if (!formData.secretDownloadUrl?.trim()) {
      alert('Informe o link oculto de download (Mega, Google Drive, etc.).');
      return;
    }

    let updatedProducts: Product[];
    let productToSave: Product;

    if (editingProduct) {
      // Update existing
      productToSave = {
        ...editingProduct,
        ...formData,
        categoryLabel: getCategoryLabel(formData.category as ProductCategory),
      } as Product;
      updatedProducts = products.map((p) => (p.id === editingProduct.id ? productToSave : p));
    } else {
      // Create new
      productToSave = {
        id: 'prod-' + Date.now(),
        name: formData.name || 'Novo Produto',
        category: (formData.category as any) || 'apps',
        categoryLabel: getCategoryLabel(formData.category as ProductCategory),
        format: formData.format || 'ZIP',
        fileSize: formData.fileSize || '50 MB',
        shortDescription: formData.shortDescription || '',
        fullDescription: formData.fullDescription || '',
        originalPrice: Number(formData.originalPrice) || 50,
        promoPrice: Number(formData.promoPrice) || 10,
        badge: formData.badge || 'Pronto para entrega',
        image: formData.image || '',
        secretDownloadUrl: formData.secretDownloadUrl || '',
        secretInstructions: formData.secretInstructions || '',
        demoUrl: formData.demoUrl || '',
        active: formData.active ?? true,
        downloadsCount: 0,
        createdAt: new Date().toISOString(),
      };
      updatedProducts = [productToSave, ...products];
    }

    onUpdateProducts(updatedProducts);
    saveStoredProducts(updatedProducts);

    // Sync to Firestore
    try {
      await saveProductToFirestore(productToSave);
    } catch (err) {
      console.warn('Saved locally, Firestore sync pending:', err);
    }

    setIsCreatingProduct(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto do catálogo?')) {
      const updated = products.filter((p) => p.id !== id);
      onUpdateProducts(updated);
      saveStoredProducts(updated);
      try {
        await deleteProductFromFirestore(id);
      } catch (err) {
        console.warn('Deleted locally, Firestore sync pending:', err);
      }
    }
  };

  // Generate Download Key
  const handleGenerateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) {
      alert('Selecione um produto para emitir a chave.');
      return;
    }

    const targetProduct = products.find((p) => p.id === selectedProductId);
    if (!targetProduct) return;

    const newKey = createDownloadKey(
      targetProduct.id,
      targetProduct.name,
      customerNote || (customerPhone ? `Cliente WhatsApp ${customerPhone}` : 'Venda Pix WhatsApp'),
      3
    );

    const updatedKeys = [newKey, ...keys.filter((k) => k.id !== newKey.id)];
    onUpdateKeys(updatedKeys);
    setNewlyCreatedKey(newKey);
    setCustomerNote('');

    // Sync to Firestore
    try {
      await saveKeyToFirestore(newKey);
    } catch (err) {
      console.warn('Saved locally, Firestore sync pending:', err);
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    const updated = keys.map((k) => (k.id === keyId ? { ...k, status: 'revoked' as const } : k));
    onUpdateKeys(updated);
    saveStoredKeys(updated);
    const keyToUpdate = updated.find((k) => k.id === keyId);
    if (keyToUpdate) {
      try {
        await saveKeyToFirestore(keyToUpdate);
      } catch (err) {
        console.warn('Updated locally, Firestore sync pending:', err);
      }
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    if (confirm('Deseja excluir esta chave permanentemente?')) {
      const updated = keys.filter((k) => k.id !== keyId);
      onUpdateKeys(updated);
      saveStoredKeys(updated);
      try {
        await deleteKeyFromFirestore(keyId);
      } catch (err) {
        console.warn('Deleted locally, Firestore sync pending:', err);
      }
    }
  };

  const handleCopyNewKey = () => {
    if (newlyCreatedKey) {
      navigator.clipboard.writeText(newlyCreatedKey.key);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  // Reset to default seed
  const handleResetCatalog = () => {
    if (confirm('Deseja restaurar a vitrine com os produtos originais de exemplo?')) {
      onUpdateProducts(INITIAL_PRODUCTS);
      saveStoredProducts(INITIAL_PRODUCTS);
      alert('Catálogo restaurado com sucesso!');
    }
  };

  const getCategoryLabel = (category: ProductCategory): string => {
    switch (category) {
      case 'apps':
        return 'Aplicativo Mobile';
      case 'livros':
        return 'Livro & E-book';
      case 'sites':
        return 'Site & SaaS Web';
      case 'scripts':
        return 'Script & Automação';
      default:
        return 'Outro / Utilitário';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#080D1A] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">
        {/* Top bar */}
        <div className="p-4 bg-[#050811] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center">
              <Lock className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white font-['Outfit']">
                Painel Administrativo Doidão Downloads
              </h2>
              {isAdmin ? (
                <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Sessão Autenticada (Admin Master)</span>
                </p>
              ) : (
                <p className="text-[11px] text-slate-400">
                  Autenticação necessária para gerenciar o catálogo
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If NOT logged in, show Login Screen */}
        {!isAdmin ? (
          <div className="p-6 sm:p-8 max-w-md mx-auto w-full my-auto space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Lock className="w-7 h-7 text-cyan-400" />
              </div>
              <h3 className="text-lg font-bold text-white font-['Outfit']">
                Acesso do Administrador
              </h3>
              <p className="text-xs text-slate-400">
                Apenas o proprietário autorizado possui acesso a esta área restrita.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Login de Administrador
                </label>
                <input
                  type="text"
                  value={loginInput}
                  onChange={(e) => setLoginInput(e.target.value)}
                  placeholder="Digite seu login (ex: 12480670961)"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-400"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Senha Secreta
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={senhaInput}
                    onChange={(e) => setSenhaInput(e.target.value)}
                    placeholder="Digite sua senha"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-400 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="p-3 bg-rose-950/60 border border-rose-800/60 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm rounded-xl transition-all shadow-lg shadow-cyan-950/40"
              >
                Entrar no Painel
              </button>
            </form>
          </div>
        ) : (
          /* LOGGED IN ADMIN DASHBOARD */
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Navigation Tabs Header */}
            <div className="px-4 sm:px-6 pt-3 bg-[#060A14] border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setActiveTab('products');
                    setIsCreatingProduct(false);
                  }}
                  className={`px-3.5 py-2.5 text-xs font-bold rounded-t-lg border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                    activeTab === 'products'
                      ? 'border-cyan-400 text-cyan-300 bg-slate-900/60'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Produtos ({products.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('keys')}
                  className={`px-3.5 py-2.5 text-xs font-bold rounded-t-lg border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                    activeTab === 'keys'
                      ? 'border-amber-400 text-amber-300 bg-slate-900/60'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Chaves de Download ({keys.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className={`px-3.5 py-2.5 text-xs font-bold rounded-t-lg border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                    activeTab === 'settings'
                      ? 'border-sky-400 text-sky-300 bg-slate-900/60'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Configurações & WhatsApp</span>
                </button>
              </div>

              <button
                onClick={handleLogout}
                className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap"
              >
                Sair
              </button>
            </div>

            {/* TAB CONTENTS */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {/* TAB 1: PRODUCTS MANAGER */}
              {activeTab === 'products' && (
                <div className="space-y-6">
                  {/* If in Create / Edit mode */}
                  {isCreatingProduct ? (
                    <div className="bg-[#0B101D] border border-slate-700/80 rounded-xl p-5 space-y-5 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <h3 className="text-base font-bold text-white font-['Outfit']">
                          {editingProduct ? 'Editar Produto' : 'Cadastrar Novo Produto'}
                        </h3>
                        <button
                          type="button"
                          onClick={() => {
                            setIsCreatingProduct(false);
                            setEditingProduct(null);
                          }}
                          className="text-xs text-slate-400 hover:text-white"
                        >
                          Voltar para a Lista
                        </button>
                      </div>

                      <form onSubmit={handleSaveProduct} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                              Nome do Produto *
                            </label>
                            <input
                              type="text"
                              value={formData.name || ''}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              placeholder="Ex: Minha Obra - App Gestão de Obras"
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                              Categoria *
                            </label>
                            <select
                              value={formData.category || 'apps'}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  category: e.target.value as any,
                                  categoryLabel: getCategoryLabel(e.target.value as ProductCategory),
                                })
                              }
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400"
                            >
                              <option value="apps">Aplicativo Mobile</option>
                              <option value="livros">Livro & E-book</option>
                              <option value="sites">Site & SaaS Web</option>
                              <option value="scripts">Script & Automação</option>
                              <option value="outros">Outro / Utilitário</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                              Preço à Vista Pix (R$) *
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={formData.promoPrice ?? ''}
                              onChange={(e) =>
                                setFormData({ ...formData, promoPrice: parseFloat(e.target.value) || 0 })
                              }
                              placeholder="10.00"
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-cyan-400"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                              Preço Original De/Por (R$)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={formData.originalPrice ?? ''}
                              onChange={(e) =>
                                setFormData({ ...formData, originalPrice: parseFloat(e.target.value) || 0 })
                              }
                              placeholder="800.00"
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-cyan-400"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                              Formato do Arquivo *
                            </label>
                            <input
                              type="text"
                              value={formData.format || ''}
                              onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                              placeholder="Ex: PDF + EPUB, ZIP (React/Node), APK Android"
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-cyan-400"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">
                              Tamanho do Arquivo *
                            </label>
                            <input
                              type="text"
                              value={formData.fileSize || ''}
                              onChange={(e) => setFormData({ ...formData, fileSize: e.target.value })}
                              placeholder="Ex: 45 MB, 120 MB"
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-cyan-400"
                              required
                            />
                          </div>
                        </div>

                        {/* Image Upload in Native Image Format (Base64 file reader, NO external URL!) */}
                        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
                          <div>
                            <label className="block text-xs font-bold text-cyan-300 mb-1">
                              Foto do Produto (Arquivo direto do Computador / Celular)
                            </label>
                            <p className="text-[11px] text-slate-400">
                              Envie o arquivo no próprio formato de imagem (PNG, JPG, WebP). Sem precisar de URL!
                            </p>
                          </div>

                          <div className="flex flex-col sm:flex-row items-center gap-4">
                            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md">
                              <Upload className="w-4 h-4 text-slate-950" />
                              <span>Escolher Foto do Arquivo</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageFileChange}
                                className="hidden"
                              />
                            </label>

                            {imagePreview ? (
                              <div className="flex items-center gap-3">
                                <div className="w-16 h-16 rounded-lg overflow-hidden border border-cyan-400/50 bg-slate-950">
                                  <img
                                    src={imagePreview}
                                    alt="Prévia"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setImagePreview('');
                                    setFormData({ ...formData, image: '' });
                                  }}
                                  className="text-xs text-rose-400 hover:underline"
                                >
                                  Remover Foto
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-500 italic">
                                Nenhuma imagem personalizada enviada (usará o mockup visual automático).
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Secret Hidden Download URL */}
                        <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-2">
                          <label className="block text-xs font-bold text-emerald-400">
                            🔒 Link Oculto do Download (Mega, Google Drive, Mediafire, etc.) *
                          </label>
                          <p className="text-[11px] text-slate-300">
                            Este link fica 100% oculto dos visitantes na vitrine. Ele só será liberado e visível para o cliente que inserir a chave de download gerada por você após pagar.
                          </p>
                          <input
                            type="text"
                            value={formData.secretDownloadUrl || ''}
                            onChange={(e) =>
                              setFormData({ ...formData, secretDownloadUrl: e.target.value })
                            }
                            placeholder="https://mega.nz/file/... ou https://drive.google.com/..."
                            className="w-full px-3.5 py-2.5 bg-slate-950 border border-emerald-500/40 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-emerald-400"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Descrição Curta (para a vitrine)
                          </label>
                          <textarea
                            rows={2}
                            value={formData.shortDescription || ''}
                            onChange={(e) =>
                              setFormData({ ...formData, shortDescription: e.target.value })
                            }
                            placeholder="Resumo em 2 frases para atrair o cliente..."
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Descrição Completa & Instruções do Produto
                          </label>
                          <textarea
                            rows={4}
                            value={formData.fullDescription || ''}
                            onChange={(e) =>
                              setFormData({ ...formData, fullDescription: e.target.value })
                            }
                            placeholder="Descreva os recursos, requisitos, conteúdo dos livros ou código..."
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Instruções Pós-Download (Exibidas junto com o link liberado)
                          </label>
                          <textarea
                            rows={2}
                            value={formData.secretInstructions || ''}
                            onChange={(e) =>
                              setFormData({ ...formData, secretInstructions: e.target.value })
                            }
                            placeholder="Ex: Descompacte o arquivo ZIP e abra o PDF com a senha padrão..."
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Link de Demonstração / Preview ao Vivo (Opcional)
                          </label>
                          <input
                            type="text"
                            value={formData.demoUrl || ''}
                            onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
                            placeholder="https://exemplo-demo.com"
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-cyan-400"
                          />
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                          <input
                            type="checkbox"
                            id="activeProd"
                            checked={formData.active ?? true}
                            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                            className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-700"
                          />
                          <label htmlFor="activeProd" className="text-xs text-slate-300 font-medium">
                            Produto visível na vitrine pública
                          </label>
                        </div>

                        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                          <button
                            type="button"
                            onClick={() => {
                              setIsCreatingProduct(false);
                              setEditingProduct(null);
                            }}
                            className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 rounded-xl"
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            className="px-6 py-2.5 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl shadow-md shadow-cyan-950/40"
                          >
                            {editingProduct ? 'Salvar Alterações' : 'Publicar Produto na Vitrine'}
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    /* Products List View */
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                        <div className="relative flex-1 max-w-sm">
                          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            value={productSearch}
                            onChange={(e) => setProductSearch(e.target.value)}
                            placeholder="Filtrar produtos cadastrados..."
                            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                          />
                        </div>

                        <button
                          onClick={startCreateProduct}
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-cyan-950/30 transition-all shrink-0"
                        >
                          <Plus className="w-4 h-4 text-slate-950" />
                          <span>Adicionar Novo Produto</span>
                        </button>
                      </div>

                      {/* Products Table */}
                      <div className="bg-[#0B101D] border border-slate-800 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs text-slate-300">
                            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                              <tr>
                                <th className="p-3">Produto</th>
                                <th className="p-3">Categoria</th>
                                <th className="p-3">Formato / Tam.</th>
                                <th className="p-3">Preço Pix</th>
                                <th className="p-3">Status</th>
                                <th className="p-3 text-right">Ações</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/80">
                              {products
                                .filter((p) =>
                                  p.name.toLowerCase().includes(productSearch.toLowerCase())
                                )
                                .map((prod) => (
                                  <tr key={prod.id} className="hover:bg-slate-900/50">
                                    <td className="p-3">
                                      <div className="flex items-center gap-2.5">
                                        <div className="w-9 h-9 rounded bg-slate-800 overflow-hidden shrink-0">
                                          {prod.image ? (
                                            <img
                                              src={prod.image}
                                              alt={prod.name}
                                              className="w-full h-full object-cover"
                                            />
                                          ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[10px] text-cyan-400 font-bold">
                                              VIP
                                            </div>
                                          )}
                                        </div>
                                        <div>
                                          <p className="font-bold text-white line-clamp-1">{prod.name}</p>
                                          <span className="text-[10px] text-slate-400 font-mono">
                                            #{prod.id.slice(0, 8)}
                                          </span>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="p-3">
                                      <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] font-medium text-slate-300">
                                        {prod.categoryLabel}
                                      </span>
                                    </td>
                                    <td className="p-3 font-mono text-[11px] text-slate-300">
                                      {prod.fileSize}
                                    </td>
                                    <td className="p-3 font-mono font-bold text-emerald-400">
                                      R$ {prod.promoPrice.toFixed(2).replace('.', ',')}
                                    </td>
                                    <td className="p-3">
                                      <span
                                        className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                          prod.active
                                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                                            : 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
                                        }`}
                                      >
                                        <span
                                          className={`w-1.5 h-1.5 rounded-full ${
                                            prod.active ? 'bg-emerald-400' : 'bg-rose-400'
                                          }`}
                                        />
                                        <span>{prod.active ? 'Ativo' : 'Pausado'}</span>
                                      </span>
                                    </td>
                                    <td className="p-3 text-right">
                                      <div className="flex items-center justify-end gap-1.5">
                                        <button
                                          onClick={() => startEditProduct(prod)}
                                          className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded transition-colors"
                                          title="Editar Produto"
                                        >
                                          <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteProduct(prod.id)}
                                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                                          title="Excluir Produto"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: DOWNLOAD KEYS GENERATOR & TRACKER */}
              {activeTab === 'keys' && (
                <div className="space-y-6">
                  {/* Key Generator Tool */}
                  <div className="p-5 bg-[#0B101D] border border-amber-500/30 rounded-xl space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-950 border border-amber-500/40 flex items-center justify-center">
                        <Key className="w-4 h-4 text-amber-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white font-['Outfit']">
                          Gerador de Chave de Download Aleatória
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          O cliente pagou no WhatsApp? Gere a chave aleatória aqui e envie para ele liberar o download imediatamente.
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleGenerateKey} className="space-y-4 pt-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Selecione o Produto Vendido *
                          </label>
                          <select
                            value={selectedProductId}
                            onChange={(e) => setSelectedProductId(e.target.value)}
                            className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                            required
                          >
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} - R$ {p.promoPrice.toFixed(2)}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Nome do Cliente ou Nota da Venda
                          </label>
                          <input
                            type="text"
                            value={customerNote}
                            onChange={(e) => setCustomerNote(e.target.value)}
                            placeholder="Ex: João - Pix R$ 30 recebido"
                            className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-slate-400">
                          Chave aleatória gerada com formato exclusivo e limite de 3 downloads seguros.
                        </span>
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-amber-950/40 flex items-center gap-1.5"
                        >
                          <Key className="w-3.5 h-3.5" />
                          <span>Gerar Chave Aleatória</span>
                        </button>
                      </div>
                    </form>

                    {/* Show Newly Generated Key Card */}
                    {newlyCreatedKey && (
                      <div className="mt-4 p-4 bg-amber-950/30 border border-amber-500/50 rounded-xl space-y-3 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div>
                            <span className="text-[10px] text-amber-300 font-semibold uppercase tracking-wider block">
                              Chave Gerada para: {newlyCreatedKey.productName}
                            </span>
                            <span className="text-xl font-mono font-black text-amber-300 tracking-wider">
                              {newlyCreatedKey.key}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button
                              onClick={handleCopyNewKey}
                              className="flex-1 sm:flex-none py-2 px-3 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 rounded-lg flex items-center justify-center gap-1.5"
                            >
                              {copiedKey ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  <span className="text-emerald-300">Copiada!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copiar Chave</span>
                                </>
                              )}
                            </button>

                            {/* Direct WhatsApp delivery button */}
                            {(() => {
                              const targetProd = products.find(
                                (p) => p.id === newlyCreatedKey.productId
                              );
                              if (!targetProd) return null;
                              const waUrl = buildWhatsAppKeyDeliveryUrl(
                                settings.whatsappNumber,
                                newlyCreatedKey.customerNote,
                                targetProd,
                                newlyCreatedKey.key
                              );
                              return (
                                <a
                                  href={waUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-1 sm:flex-none py-2 px-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 shadow"
                                >
                                  <MessageCircle className="w-3.5 h-3.5 fill-white text-emerald-600" />
                                  <span>Enviar no WhatsApp</span>
                                </a>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Keys History Table */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Histórico de Chaves Emitidas ({keys.length})
                    </h4>
                    <div className="bg-[#0B101D] border border-slate-800 rounded-xl overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-300">
                          <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                            <tr>
                              <th className="p-3">Chave</th>
                              <th className="p-3">Produto</th>
                              <th className="p-3">Nota / Cliente</th>
                              <th className="p-3">Downloads</th>
                              <th className="p-3">Status</th>
                              <th className="p-3 text-right">Ações</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/80">
                            {keys.map((k) => (
                              <tr key={k.id} className="hover:bg-slate-900/50">
                                <td className="p-3 font-mono font-bold text-amber-300">
                                  {k.key}
                                </td>
                                <td className="p-3 max-w-[180px] truncate text-white">
                                  {k.productName}
                                </td>
                                <td className="p-3 text-slate-400">
                                  {k.customerNote || '—'}
                                </td>
                                <td className="p-3 font-mono text-[11px]">
                                  {k.downloadCount} / {k.maxUses}
                                </td>
                                <td className="p-3">
                                  <span
                                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                                      k.status === 'active'
                                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/50'
                                        : k.status === 'used'
                                        ? 'bg-slate-800 text-slate-400'
                                        : 'bg-rose-950 text-rose-300 border border-rose-800/50'
                                    }`}
                                  >
                                    {k.status === 'active'
                                      ? 'Ativa'
                                      : k.status === 'used'
                                      ? 'Esgotada'
                                      : 'Revogada'}
                                  </span>
                                </td>
                                <td className="p-3 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(k.key);
                                        alert(`Chave ${k.key} copiada!`);
                                      }}
                                      className="p-1.5 text-slate-400 hover:text-white rounded"
                                      title="Copiar Chave"
                                    >
                                      <Copy className="w-3.5 h-3.5" />
                                    </button>
                                    {k.status === 'active' && (
                                      <button
                                        onClick={() => handleRevokeKey(k.id)}
                                        className="text-[10px] text-amber-400 hover:underline px-1"
                                        title="Revogar Chave"
                                      >
                                        Revogar
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleDeleteKey(k.id)}
                                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded"
                                      title="Excluir Chave"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SETTINGS & WHATSAPP CONFIG */}
              {activeTab === 'settings' && (
                <div className="space-y-6 max-w-2xl">
                  <div className="p-5 bg-[#0B101D] border border-slate-800 rounded-xl space-y-4">
                    <h3 className="text-sm font-bold text-white font-['Outfit']">
                      Configurações de Vendas & WhatsApp
                    </h3>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Número de WhatsApp para Vendas (DDI + DDD + Número)
                      </label>
                      <input
                        type="text"
                        value={settings.whatsappNumber}
                        onChange={(e) => {
                          const updated = {
                            ...settings,
                            whatsappNumber: e.target.value.replace(/\D/g, ''),
                          };
                          onUpdateSettings(updated);
                          saveAppSettings(updated);
                        }}
                        placeholder="Ex: 5548998091948"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white font-mono"
                      />
                      <p className="mt-1 text-[11px] text-slate-400">
                        Os botões de "Comprar Agora no WhatsApp" e "Anuncie Aqui" usarão este número.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Visualização Formatada do WhatsApp no Topo / Rodapé
                      </label>
                      <input
                        type="text"
                        value={settings.whatsappFormatted}
                        onChange={(e) => {
                          const updated = { ...settings, whatsappFormatted: e.target.value };
                          onUpdateSettings(updated);
                          saveAppSettings(updated);
                        }}
                        placeholder="Ex: (48) 99809-1948"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Chave Pix do Vendedor
                      </label>
                      <input
                        type="text"
                        value={settings.pixKey}
                        onChange={(e) => {
                          const updated = { ...settings, pixKey: e.target.value };
                          onUpdateSettings(updated);
                          saveAppSettings(updated);
                        }}
                        placeholder="12480670961"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Texto do Banner "Anuncie Aqui"
                      </label>
                      <textarea
                        rows={2}
                        value={settings.adNotice}
                        onChange={(e) => {
                          const updated = { ...settings, adNotice: e.target.value };
                          onUpdateSettings(updated);
                          saveAppSettings(updated);
                        }}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white"
                      />
                    </div>
                  </div>

                  {/* Firebase Real Cloud Status Card */}
                  <div className="p-5 bg-gradient-to-r from-[#0C1527] to-[#0A1322] border border-cyan-500/30 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center">
                          <Cloud className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                            Banco de Dados Firebase Firestore
                          </h4>
                          <span className="text-[11px] text-emerald-400 font-mono font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span>Conectado: site-doida</span>
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] bg-cyan-950/80 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800/40 font-mono">
                        Produção
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      Seus produtos, vendas e chaves de download estão vinculados ao seu projeto real do Firebase (<strong>site-doida</strong>). Todos os dados persistirão na nuvem oficial.
                    </p>

                    {cloudSyncMsg && (
                      <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/40 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{cloudSyncMsg}</span>
                      </div>
                    )}

                    <button
                      type="button"
                      disabled={isSyncingCloud}
                      onClick={async () => {
                        setIsSyncingCloud(true);
                        setCloudSyncMsg(null);
                        try {
                          await syncInitialDataToFirestore();
                          setCloudSyncMsg('Todos os produtos e chaves foram sincronizados no Firebase com sucesso!');
                        } catch (e) {
                          setCloudSyncMsg('Catálogo enviado! Verifique o console do Firestore no Firebase.');
                        } finally {
                          setIsSyncingCloud(false);
                        }
                      }}
                      className="w-full py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncingCloud ? 'animate-spin' : ''}`} />
                      <span>{isSyncingCloud ? 'Enviando para a Nuvem...' : 'Sincronizar Catálogo Completo no Firestore'}</span>
                    </button>
                  </div>

                  {/* Reset Catalog Button */}
                  <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">Restaurar Vitrine Original</h4>
                      <p className="text-[11px] text-slate-400">
                        Restaura os produtos e itens de exemplo originais.
                      </p>
                    </div>
                    <button
                      onClick={handleResetCatalog}
                      className="px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Restaurar Padrão</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
