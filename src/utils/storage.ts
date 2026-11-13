import { Product, AppSettings } from '../types';

const AUTH_SESSION_KEY = 'doidao_downloads_admin_session';

export const ADMIN_CREDENTIALS = {
  login: '12480670961',
  senha: 'admin2298',
};

// Empty baseline settings structure used only before the database document is created
export const EMPTY_SETTINGS: AppSettings = {
  whatsappNumber: '',
  whatsappFormatted: '',
  pixKey: '',
  sellerName: 'Doidão Downloads',
  siteNotice: 'Compra 100% Segura com Autorização Direta via WhatsApp',
  adNotice:
    'Aqui ninguém além de mim anuncia no site. Nós analisamos a integridade do seu produto e publicamos na vitrine para você vender com segurança.',
};

export function generateRandomKey(prefix = 'DOIDAO'): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const segment1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const segment2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${prefix}-${segment1}-${segment2}`;
}

// Session-only Admin Auth State (no site data or configurations stored on the device)
export function isAdminLoggedIn(): boolean {
  try {
    return sessionStorage.getItem(AUTH_SESSION_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setAdminLoggedIn(loggedIn: boolean): void {
  try {
    if (loggedIn) {
      sessionStorage.setItem(AUTH_SESSION_KEY, 'true');
    } else {
      sessionStorage.removeItem(AUTH_SESSION_KEY);
    }
  } catch (e) {
    console.error('Error setting admin session:', e);
  }
}

// Compress uploaded image in-browser so it fits comfortably inside a Firestore document (< 1MB)
export function compressImageFile(file: File, maxWidth = 900, quality = 0.78): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Falha ao ler arquivo de imagem.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Formato de imagem inválido.'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// Helpers for WhatsApp links
export function buildWhatsAppBuyUrl(phone: string, product: Product): string {
  const cleanPhone = phone.replace(/\D/g, '');
  if (!cleanPhone) return '#';
  const message = `Olá! Vi o produto *${product.name}* (${product.categoryLabel}) por *R$ ${product.promoPrice.toFixed(2).replace('.', ',')}* no site *Doidão Downloads* e quero comprar via Pix.\n\nComo faço para efetuar o pagamento e receber minha chave de download imediata?`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function buildWhatsAppAdUrl(phone: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  if (!cleanPhone) return '#';
  const message = `Olá! Gostaria de anunciar meu produto/aplicativo/livro na vitrine do *Doidão Downloads*. Como funciona a negociação de espaço e valor para anúncio?`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function buildWhatsAppKeyDeliveryUrl(
  phone: string,
  customerName: string,
  product: Product,
  key: string
): string {
  const cleanPhone = phone.replace(/\D/g, '');
  if (!cleanPhone) return '#';
  const greeting = customerName ? `Olá, *${customerName}*!` : `Olá!`;
  const message = `${greeting}\n\nSeu pagamento para o produto *${product.name}* foi confirmado com sucesso!\n\n🔑 *Sua Chave de Acesso Exclusiva:*\n\`${key}\`\n\nPara baixar seus arquivos agora:\n1. Acesse o site do Doidão Downloads\n2. Clique em "Resgatar Download"\n3. Cole sua chave e clique em Liberar!\n\nQualquer dúvida estamos à disposição!`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
