import React, { useState, useEffect } from 'react';
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
  ShieldAlert,
  ShieldCheck,
  FolderOpen,
  Settings,
  Search,
  Cloud,
  CheckCircle2,
  Loader2,
  Save,
} from 'lucide-react';
import { Product, DownloadKey, AppSettings, ProductCategory } from '../types';
import {
  ADMIN_CREDENTIALS,
  setAdminLoggedIn,
  compressImageFile,
  buildWhatsAppKeyDeliveryUrl,
} from '../utils/storage';
import {
  saveProductToFirestore,
  deleteProductFromFirestore,
  createDownloadKeyInFirestore,
  saveKeyToFirestore,
  deleteKeyFromFirestore,
  saveSettingsToFirestore,
} from '../services/firebase';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  keys: DownloadKey[];
  settings: AppSettings;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  products,
  keys,
  settings,
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
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [productError, setProductError] = useState<string | null>(null);

  // Key Generator states
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [customerNote, setCustomerNote] = useState('');
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<DownloadKey | null>(null);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // Settings draft states (persisted directly to Firestore)
  const [draftSettings, setDraftSettings] = useState<AppSettings>(settings);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSavedMsg, setSettingsSavedMsg] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  // Keep selectedProductId synced when products arrive from Firestore
  useEffect(() => {
    if (products.length > 0 && !products.some((p) => p.id === selectedProductId)) {
      setSelectedProductId(products[0].id);
    }
  }, [products, selectedProductId]);

  // Keep draftSettings synced with Firestore settings
  useEffect(() => {
    setDraftSettings(settings);
  }, [settings]);

  // Form data for creating/editing product
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: 'apps',
    categoryLabel: 'Aplicativo Mobile',
    format: '',
    fileSize: '',
    shortDescription: '',
    fullDescription: '',
    originalPrice: 0,
    promoPrice: 0,
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

  // Image Upload Handler (compresses in-browser so it fits comfortably inside Firestore < 1MB)
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProductError(null);
    if (file.size > 10 * 1024 * 1024) {
      setProductError('A imagem selecionada excede 10MB. Escolha uma imagem menor.');
      return;
    }

    try {
      const compressedDataUrl = await compressImageFile(file, 900, 0.78);
      if (compressedDataUrl.length > 900 * 1024) {
        // Retry with stronger compression if still large
        const smallerDataUrl = await compressImageFile(file, 640, 0.65);
        setImagePreview(smallerDataUrl);
        setFormData((prev) => ({ ...prev, image: smallerDataUrl }));
      } else {
        setImagePreview(compressedDataUrl);
        setFormData((prev) => ({ ...prev, image: compressedDataUrl }));
      }
    } catch {
      setProductError('Não foi possível processar a imagem. Tente outro arquivo PNG ou JPG.');
    }
  };

  // Open Create Product
  const startCreateProduct = () => {
    setEditingProduct(null);
    setImagePreview('');
    setProductError(null);
    setFormData({
      name: '',
      category: 'apps',
      categoryLabel: 'Aplicativo Mobile',
      format: '',
      fileSize: '',
      shortDescription: '',
      fullDescription: '',
      originalPrice: 0,
      promoPrice: 0,
      badge: 'Pronto para entrega',
      image: '',
      secretDownloadUrl: '',
      secretInstructions: '',
      demoUrl: '',
      active: true,
    });
    setIsCreatingProduct(true);
  };

  // Open Edit Product
  const startEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setImagePreview(prod.image || '');
    setProductError(null);
    setFormData({ ...prod });
    setIsCreatingProduct(true);
  };

  // Save Product directly to Firestore
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setProductError(null);

    if (!formData.name?.trim()) {
      setProductError('Por favor, informe o nome do produto.');
      return;
    }
    if (!formData.secretDownloadUrl?.trim()) {
      setProductError('Informe o link oculto de download (Mega, Google Drive, etc.).');
      return;
    }

    const productToSave: Product = editingProduct
      ? ({
          ...editingProduct,
          ...formData,
          categoryLabel: getCategoryLabel(formData.category as ProductCategory),
        } as Product)
      : {
          id: 'prod-' + Date.now(),
          name: formData.name.trim(),
          category: (formData.category as Product['category']) || 'apps',
          categoryLabel: getCategoryLabel(formData.category as ProductCategory),
          format: formData.format?.trim() || 'ZIP',
          fileSize: formData.fileSize?.trim() || 'N/A',
          shortDescription: formData.shortDescription?.trim() || '',
          fullDescription: formData.fullDescription?.trim() || '',
          originalPrice: Number(formData.originalPrice) || 0,
          promoPrice: Number(formData.promoPrice) || 0,
          badge: formData.badge?.trim() || 'Pronto para entrega',
          image: formData.image || '',
          secretDownloadUrl: formData.secretDownloadUrl.trim(),
          secretInstructions: formData.secretInstructions?.trim() || '',
          demoUrl: formData.demoUrl?.trim() || '',
          active: formData.active ?? true,
          downloadsCount: 0,
          createdAt: new Date().toISOString(),
        };

    setIsSavingProduct(true);
    try {
      await saveProductToFirestore(productToSave);
      setIsCreatingProduct(false);
      setEditingProduct(null);
    } catch (err) {
      console.error(err);
      setProductError(
        'Erro ao salvar produto no banco de dados Firebase. Verifique as regras do Firestore ou se a imagem é muito grande.'
      );
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto permanentemente do banco de dados?')) {
      return;
    }
    try {
      await deleteProductFromFirestore(id);
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir produto no Firebase. Verifique sua conexão.');
    }
  };

  // Generate Download Key directly in Firestore
  const handleGenerateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) {
      alert('Cadastre e selecione um produto antes de emitir uma chave.');
      return;
    }

    const targetProduct = products.find((p) => p.id === selectedProductId);
    if (!targetProduct) return;

    setIsGeneratingKey(true);
    try {
      const newKey = await createDownloadKeyInFirestore(
        targetProduct.id,
        targetProduct.name,
        customerNote.trim() || 'Venda WhatsApp',
        3
      );
      setNewlyCreatedKey(newKey);
      setCustomerNote('');
    } catch (err) {
      console.error(err);
      alert('Erro ao gerar chave no Firebase. Verifique sua conexão e permissões do Firestore.');
    } finally {
      setIsGeneratingKey(false);
    }
  };

  const handleRevokeKey = async (key: DownloadKey) => {
    try {
      await saveKeyToFirestore({ ...key, status: 'revoked' });
    } catch (err) {
      console.error(err);
      alert('Erro ao revogar chave no Firebase.');
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    if (!confirm('Deseja excluir esta chave permanentemente do banco de dados?')) return;
    try {
      await deleteKeyFromFirestore(keyId);
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir chave no Firebase.');
    }
  };

  const handleCopyNewKey = () => {
    if (newlyCreatedKey) {
      navigator.clipboard.writeText(newlyCreatedKey.key);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setSettingsSavedMsg(null);
    setSettingsError(null);

    try {
      const cleaned: AppSettings = {
        ...draftSettings,
        whatsappNumber: draftSettings.whatsappNumber.replace(/\D/g, ''),
      };
      await saveSettingsToFirestore(cleaned);
      setSettingsSavedMsg('Configurações salvas no banco de dados do site com sucesso!');
    } catch (err) {
      console.error(err);
      setSettingsError(
        'Erro ao salvar configurações no Firebase. Verifique se as regras do Firestore estão publicadas.'
      );
    } finally {
      setIsSavingSettings(false);
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
                  <span>Sessão Autenticada · Armazenamento em Nuvem (Firebase)</span>
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
                  placeholder="Digite seu login"
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
                              placeholder="Ex: Nome do aplicativo, livro ou site"
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
                                  category: e.target.value as Product['category'],
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
                              placeholder="0.00"
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
                              placeholder="0.00"
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
                              placeholder="Ex: PDF + EPUB, ZIP, APK Android"
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
                              placeholder="Ex: 45 MB"
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-cyan-400"
                              required
                            />
                          </div>
                        </div>

                        {/* Image Upload in Native Image Format */}
                        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
                          <div>
                            <label className="block text-xs font-bold text-cyan-300 mb-1">
                              Foto do Produto (Arquivo direto do Computador / Celular)
                            </label>
                            <p className="text-[11px] text-slate-400">
                              Envie no próprio formato de imagem (PNG, JPG, WebP). A foto é otimizada e salva direto no banco de dados do site.
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
                                Nenhuma foto enviada (usará o ícone da categoria).
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Secret Hidden Download URL */}
                        <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-2">
                          <label className="block text-xs font-bold text-emerald-400">
                            Link Oculto do Download (Mega, Google Drive, Mediafire, etc.) *
                          </label>
                          <p className="text-[11px] text-slate-300">
                            Este link fica 100% oculto dos visitantes na vitrine e só é liberado para quem tiver uma chave válida.
                          </p>
                          <input
                            type="text"
                            value={formData.secretDownloadUrl || ''}
                            onChange={(e) =>
                              setFormData({ ...formData, secretDownloadUrl: e.target.value })
                            }
                            placeholder="https://drive.google.com/... ou https://mega.nz/..."
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
                            placeholder="Resumo curto para exibir no card do produto..."
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Descrição Completa
                          </label>
                          <textarea
                            rows={4}
                            value={formData.fullDescription || ''}
                            onChange={(e) =>
                              setFormData({ ...formData, fullDescription: e.target.value })
                            }
                            placeholder="Descreva os recursos, requisitos e detalhes completos do produto..."
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
                            placeholder="Instruções de instalação ou acesso após o desbloqueio..."
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
                            placeholder="https://..."
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

                        {productError && (
                          <div className="p-3 bg-rose-950/60 border border-rose-800/60 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
                            <span>{productError}</span>
                          </div>
                        )}

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
                            disabled={isSavingProduct}
                            className="px-6 py-2.5 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-xl shadow-md shadow-cyan-950/40 flex items-center gap-2"
                          >
                            {isSavingProduct && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            <span>
                              {isSavingProduct
                                ? 'Salvando na Nuvem...'
                                : editingProduct
                                ? 'Salvar Alterações'
                                : 'Publicar Produto na Vitrine'}
                            </span>
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

                      {products.length === 0 ? (
                        <div className="p-8 text-center bg-[#0B101D] border border-slate-800 rounded-xl space-y-3">
                          <FolderOpen className="w-10 h-10 text-slate-500 mx-auto" />
                          <p className="text-sm font-bold text-white">
                            Nenhum produto cadastrado no banco de dados
                          </p>
                          <p className="text-xs text-slate-400">
                            Clique em &quot;Adicionar Novo Produto&quot; acima para publicar seu primeiro item diretamente no Firebase.
                          </p>
                        </div>
                      ) : (
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
                                                IMG
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
                      )}
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

                    {products.length === 0 ? (
                      <p className="text-xs text-amber-300 bg-amber-950/30 border border-amber-500/30 rounded-lg p-3">
                        Cadastre pelo menos um produto na aba &quot;Produtos&quot; para poder gerar chaves de download.
                      </p>
                    ) : (
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
                              placeholder="Ex: Nome do cliente ou comprovante"
                              className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[11px] text-slate-400">
                            Chave aleatória salva diretamente no Firebase com limite de 3 downloads seguros.
                          </span>
                          <button
                            type="submit"
                            disabled={isGeneratingKey}
                            className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-amber-950/40 flex items-center gap-1.5"
                          >
                            {isGeneratingKey ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Key className="w-3.5 h-3.5" />
                            )}
                            <span>{isGeneratingKey ? 'Gerando...' : 'Gerar Chave Aleatória'}</span>
                          </button>
                        </div>
                      </form>
                    )}

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

                            {(() => {
                              const targetProd = products.find(
                                (p) => p.id === newlyCreatedKey.productId
                              );
                              const cleanPhone = settings.whatsappNumber.replace(/\D/g, '');
                              if (!targetProd || !cleanPhone) return null;
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
                      {keys.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-400">
                          Nenhuma chave gerada ainda no banco de dados.
                        </div>
                      ) : (
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
                                        }}
                                        className="p-1.5 text-slate-400 hover:text-white rounded"
                                        title="Copiar Chave"
                                      >
                                        <Copy className="w-3.5 h-3.5" />
                                      </button>
                                      {k.status === 'active' && (
                                        <button
                                          onClick={() => handleRevokeKey(k)}
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
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SETTINGS & WHATSAPP CONFIG (SAVED TO FIRESTORE) */}
              {activeTab === 'settings' && (
                <div className="space-y-6 max-w-2xl">
                  <form
                    onSubmit={handleSaveSettings}
                    className="p-5 bg-[#0B101D] border border-slate-800 rounded-xl space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <h3 className="text-sm font-bold text-white font-['Outfit']">
                          Configurações de Vendas & WhatsApp
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          Todas as configurações salvas aqui ficam armazenadas no banco de dados oficial do site (Firestore).
                        </p>
                      </div>
                      <span className="text-[10px] bg-cyan-950/80 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800/40 font-mono">
                        Nuvem
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Número de WhatsApp para Vendas (DDI + DDD + Número)
                      </label>
                      <input
                        type="text"
                        value={draftSettings.whatsappNumber}
                        onChange={(e) =>
                          setDraftSettings({
                            ...draftSettings,
                            whatsappNumber: e.target.value.replace(/\D/g, ''),
                          })
                        }
                        placeholder="Ex: 5511999999999"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-cyan-400"
                      />
                      <p className="mt-1 text-[11px] text-slate-400">
                        Os botões de &quot;Comprar Agora no WhatsApp&quot; e &quot;Anuncie Aqui&quot; usarão este número.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Visualização Formatada do WhatsApp no Topo / Rodapé
                      </label>
                      <input
                        type="text"
                        value={draftSettings.whatsappFormatted}
                        onChange={(e) =>
                          setDraftSettings({ ...draftSettings, whatsappFormatted: e.target.value })
                        }
                        placeholder="Ex: (11) 99999-9999"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Chave Pix do Vendedor
                      </label>
                      <input
                        type="text"
                        value={draftSettings.pixKey}
                        onChange={(e) =>
                          setDraftSettings({ ...draftSettings, pixKey: e.target.value })
                        }
                        placeholder="Digite sua chave Pix"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Aviso do Topo do Site
                      </label>
                      <input
                        type="text"
                        value={draftSettings.siteNotice}
                        onChange={(e) =>
                          setDraftSettings({ ...draftSettings, siteNotice: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Texto do Banner &quot;Anuncie Aqui&quot;
                      </label>
                      <textarea
                        rows={2}
                        value={draftSettings.adNotice}
                        onChange={(e) =>
                          setDraftSettings({ ...draftSettings, adNotice: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    {settingsSavedMsg && (
                      <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/40 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{settingsSavedMsg}</span>
                      </div>
                    )}

                    {settingsError && (
                      <div className="p-2.5 bg-rose-950/60 border border-rose-500/40 rounded-lg text-xs text-rose-300 flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>{settingsError}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSavingSettings}
                      className="w-full py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      {isSavingSettings ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Save className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {isSavingSettings
                          ? 'Salvando no Banco de Dados...'
                          : 'Salvar Configurações no Banco de Dados'}
                      </span>
                    </button>
                  </form>

                  {/* Firebase Real Cloud Status Card */}
                  <div className="p-5 bg-gradient-to-r from-[#0C1527] to-[#0A1322] border border-cyan-500/30 rounded-xl space-y-2">
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
                    <p className="text-xs text-slate-300 leading-relaxed">
                      O site está livre de dados locais ou exemplos fictícios. Tudo o que você cadastrar aqui é gravado exclusivamente no seu banco de dados em nuvem e carregado em qualquer aparelho.
                    </p>
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
