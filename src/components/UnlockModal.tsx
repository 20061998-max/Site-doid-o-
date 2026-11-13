import React, { useState } from 'react';
import {
  X,
  Key,
  Download,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Copy,
  Check,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { Product, DownloadKey, AppSettings } from '../types';
import { validateKeyInFirestore, recordKeyDownloadInFirestore } from '../services/firebase';

interface UnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedProductId?: string;
  settings: AppSettings;
}

export const UnlockModal: React.FC<UnlockModalProps> = ({
  isOpen,
  onClose,
  settings,
}) => {
  const [keyInput, setKeyInput] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unlockedData, setUnlockedData] = useState<{
    product: Product;
    downloadKey: DownloadKey;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsValidating(true);

    try {
      const result = await validateKeyInFirestore(keyInput);
      if (result.success && result.product && result.downloadKey) {
        setUnlockedData({
          product: result.product,
          downloadKey: result.downloadKey,
        });
        // Register the download in Firestore
        await recordKeyDownloadInFirestore(result.downloadKey);
      } else {
        setError(result.message);
      }
    } catch {
      setError('Erro de conexão ao verificar a chave no servidor. Tente novamente.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleCopyLink = () => {
    if (unlockedData?.product.secretDownloadUrl) {
      navigator.clipboard.writeText(unlockedData.product.secretDownloadUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const resetModal = () => {
    setKeyInput('');
    setError(null);
    setUnlockedData(null);
    setIsValidating(false);
    onClose();
  };

  const cleanPhone = settings.whatsappNumber.replace(/\D/g, '');
  const supportWhatsAppUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
        `Olá! Estou com dúvidas ou preciso de suporte para validar minha chave de download no Doidão Downloads.`
      )}`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0B101D] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-500/30 flex items-center justify-center">
              <Key className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-['Outfit']">
                Desbloqueio de Download
              </h3>
              <p className="text-[11px] text-slate-400">
                Insira sua chave única fornecida pelo vendedor
              </p>
            </div>
          </div>
          <button
            onClick={resetModal}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {!unlockedData ? (
            /* Input Form */
            <form onSubmit={handleValidate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Chave de Liberação (Ex: DOIDAO-XXXX-XXXX)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={keyInput}
                    onChange={(e) => {
                      setKeyInput(e.target.value.toUpperCase());
                      setError(null);
                    }}
                    placeholder="Cole ou digite sua chave aqui..."
                    className="w-full pl-4 pr-10 py-3 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 font-mono tracking-wider focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20"
                    autoFocus
                  />
                  <Key className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-500" />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-rose-950/50 border border-rose-800/50 rounded-xl text-xs text-rose-300 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">{error}</p>
                    {supportWhatsAppUrl && (
                      <a
                        href={supportWhatsAppUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1.5 inline-flex items-center gap-1 text-emerald-400 hover:underline font-bold"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>Falar com o vendedor no WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-400 space-y-1">
                <p className="text-slate-300 font-medium">Como funciona?</p>
                <p>1. Ao comprar via WhatsApp e enviar o comprovante Pix, o vendedor gera sua chave de autorização.</p>
                <p>2. Você digita ou cola a chave neste campo para desbloquear os arquivos imediatamente.</p>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={resetModal}
                  className="flex-1 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!keyInput.trim() || isValidating}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-md shadow-amber-900/20 flex items-center justify-center gap-2"
                >
                  {isValidating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verificando...</span>
                    </>
                  ) : (
                    <span>Validar e Desbloquear</span>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Unlocked Product Screen */
            <div className="space-y-4 animate-in zoom-in-95 duration-200">
              <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white font-['Outfit']">
                    Download Liberado com Sucesso!
                  </h4>
                  <p className="text-xs text-emerald-300">
                    Sua chave foi autenticada e os arquivos estão prontos para baixar.
                  </p>
                </div>
              </div>

              {/* Product Card Info */}
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Produto:</span>
                  <span className="font-bold text-white text-right">{unlockedData.product.name}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Formato:</span>
                  <span className="font-mono text-cyan-300">{unlockedData.product.format}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Tamanho:</span>
                  <span className="font-mono text-emerald-400">{unlockedData.product.fileSize}</span>
                </div>
              </div>

              {/* Secret Instructions */}
              {unlockedData.product.secretInstructions && (
                <div className="p-3.5 bg-cyan-950/20 border border-cyan-800/40 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-cyan-300 block">Instruções de Instalação / Acesso:</span>
                  <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                    {unlockedData.product.secretInstructions}
                  </p>
                </div>
              )}

              {/* Primary Download CTA Button */}
              <div className="space-y-2 pt-2">
                <a
                  href={unlockedData.product.secretDownloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-black text-sm rounded-xl transition-all shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5 text-slate-950" />
                  <span>Baixar Arquivos Agora ({unlockedData.product.fileSize})</span>
                  <ExternalLink className="w-4 h-4 text-slate-950" />
                </a>

                {/* Copy Link Button */}
                <button
                  onClick={handleCopyLink}
                  className="w-full py-2 px-3 text-xs text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300">Link copiado para a área de transferência!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copiar Link de Download Direto</span>
                    </>
                  )}
                </button>
              </div>

              <div className="pt-2 border-t border-slate-800 text-center">
                <button
                  onClick={resetModal}
                  className="text-xs text-slate-400 hover:text-white transition-colors"
                >
                  Fechar janela
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
