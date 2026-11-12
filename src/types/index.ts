export type ProductCategory = 'todos' | 'livros' | 'apps' | 'sites' | 'scripts' | 'outros';

export interface Product {
  id: string;
  name: string;
  category: 'livros' | 'apps' | 'sites' | 'scripts' | 'outros';
  categoryLabel: string;
  format: string; // Ex: 'PDF + EPUB (450 pág.)', 'ZIP (Código React/Node)', 'APK + Source'
  fileSize: string; // Ex: '45 MB', '120 MB'
  shortDescription: string;
  fullDescription: string;
  originalPrice: number;
  promoPrice: number;
  badge: string; // Ex: 'Pronto para entrega'
  image: string; // Base64 data URL or pre-seeded SVG/image
  secretDownloadUrl: string; // The real hidden download link (Google Drive, Mega, etc.)
  secretInstructions?: string; // Step-by-step instructions displayed when key is unlocked
  demoUrl?: string; // Optional live preview
  active: boolean;
  featured?: boolean;
  downloadsCount: number;
  createdAt: string;
}

export interface DownloadKey {
  id: string;
  key: string;
  productId: string;
  productName: string;
  customerNote: string;
  status: 'active' | 'used' | 'revoked';
  createdAt: string;
  usedAt?: string;
  downloadCount: number;
  maxUses: number;
}

export interface AppSettings {
  whatsappNumber: string; // e.g. '5548998091948'
  whatsappFormatted: string; // e.g. '(48) 99809-1948'
  pixKey: string;
  sellerName: string;
  siteNotice: string;
  adNotice: string;
}
