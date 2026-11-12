import { Product, DownloadKey, AppSettings } from '../types';

const PRODUCTS_KEY = 'doidao_downloads_products';
const KEYS_KEY = 'doidao_downloads_keys';
const SETTINGS_KEY = 'doidao_downloads_settings';
const AUTH_KEY = 'doidao_downloads_admin_auth';

export const ADMIN_CREDENTIALS = {
  login: '12480670961',
  senha: 'admin2298',
};

export const DEFAULT_SETTINGS: AppSettings = {
  whatsappNumber: '5548998091948',
  whatsappFormatted: '(48) 99809-1948',
  pixKey: '12480670961',
  sellerName: 'Doidão Downloads',
  siteNotice: 'Compra 100% Segura com Autorização Direta via WhatsApp',
  adNotice: 'Aqui ninguém além de mim anuncia no site. Nós analisamos a integridade do seu produto e publicamos na vitrine para você vender com segurança.',
};

// Seed sample products with realistic digital assets
export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-minha-obra',
    name: 'Minha Obra - App de Gestão & Orçamentos',
    category: 'apps',
    categoryLabel: 'Aplicativo Mobile',
    format: 'React Native · Node.js · Tailwind · APK + Código-Fonte',
    fileSize: '84 MB (Compactado ZIP)',
    shortDescription: 'Por que você precisa desse aplicativo na sua obra? Orçamentos prontos em segundos. Esqueça planilhas manuais.',
    fullDescription: `Sistema mobile completo e responsivo para mestres de obras, arquitetos e empreiteiros autônomos. 
    
Recursos Inclusos:
• Cadastro e acompanhamento de obras em tempo real
• Calculadora automática de materiais (concreto, tijolos, argamassa, pintura)
• Emissão de orçamentos e recibos em PDF prontos para enviar no WhatsApp
• Controle de despesas diárias e diárias de pedreiros
• Código-fonte 100% aberto e pronto para compilar na Google Play ou rodar local`,
    originalPrice: 800.00,
    promoPrice: 10.00,
    badge: 'Pronto para entrega',
    image: '', // Will use customized visual mockup if empty
    secretDownloadUrl: 'https://mega.nz/file/doidao-minha-obra-app-v2.zip',
    secretInstructions: 'Descompacte o arquivo ZIP. Dentro você encontrará o APK compilado para instalar direto no Android e a pasta "source-code" com o projeto React Native.',
    demoUrl: 'https://exemplo-obra-preview.vercel.app',
    active: true,
    featured: true,
    downloadsCount: 142,
    createdAt: '2026-03-01T10:00:00Z',
  },
  {
    id: 'prod-xbox-desbloqueio',
    name: 'Desbloqueio Abad avatar instantâneo Xbox 360',
    category: 'scripts',
    categoryLabel: 'Script & Automação',
    format: 'Exploit de Hypervisor via software · Pacote Completo USB',
    fileSize: '320 MB (Pacote ISO/ZIP)',
    shortDescription: 'DESBLOQUEIO INSTANTÂNEO XBOX 360 - ABadAvatar v1.3 (100% Via Software). Libere todo o potencial do seu console sem soldas.',
    fullDescription: `O método mais seguro e prático para Xbox 360 Fat e Slim. Não requer abertura do aparelho nem solda na placa-mãe.
    
O que acompanha no pacote:
• Exploit ABadAvatar v1.3 atualizado e testado
• Guia passo a passo ilustrado em PDF em português
• Freestyle Dash e Aurora Dash pré-configuradas em PT-BR
• Emuladores clássicos (Super Nintendo, Mega Drive, Arcade)
• Ferramentas de injeção via Pendrive formatado em FAT32`,
    originalPrice: 800.00,
    promoPrice: 30.00,
    badge: 'Pronto para entrega',
    image: '',
    secretDownloadUrl: 'https://drive.google.com/drive/folders/doidao-xbox-360-exploit-v13',
    secretInstructions: 'Insira um pendrive formatado em FAT32 no seu computador e copie os arquivos da pasta "Pendrive_Root" para a raiz do seu drive USB. Siga as instruções do PDF anexo.',
    active: true,
    featured: true,
    downloadsCount: 318,
    createdAt: '2026-03-02T14:30:00Z',
  },
  {
    id: 'prod-livro-fullstack',
    name: 'Livro: O Guia Definitivo do Desenvolvedor Fullstack Moderno',
    category: 'livros',
    categoryLabel: 'Livro & E-book',
    format: 'PDF Digital de Alta Resolução + ePub + Repositório no GitHub',
    fileSize: '45 MB (E-book Ilustrado 480 páginas)',
    shortDescription: 'Do zero absoluto à arquitetura de software profissional. Domine React, Node.js, TypeScript, PostgreSQL e APIs em 2026.',
    fullDescription: `Um dos livros técnicos mais completos em língua portuguesa sobre desenvolvimento web fullstack contemporâneo.

Capítulos em Destaque:
1. Fundamentos sólidos de JavaScript Moderno (ES2024+) e TypeScript
2. React com Hooks avançados, Server Components e Zustand
3. Backends robustos com Node.js, Express, Fastify e Prisma
4. Bancos de dados relacionais e modelagem profissional com PostgreSQL
5. Segurança, autenticação JWT, OAuth2 e boas práticas OWASP
6. Como precificar seus projetos e conseguir clientes recorrentes`,
    originalPrice: 199.00,
    promoPrice: 19.90,
    badge: 'Pronto para entrega',
    image: '',
    secretDownloadUrl: 'https://drive.google.com/file/d/doidao-livro-fullstack-edicao-2026.pdf',
    secretInstructions: 'O arquivo PDF está liberado para leitura em qualquer dispositivo (Kindle, Celular, Tablet, PC). Acompanha o link do repositório fechado com os códigos de cada capítulo.',
    active: true,
    featured: true,
    downloadsCount: 89,
    createdAt: '2026-03-03T09:15:00Z',
  },
  {
    id: 'prod-saas-delivery',
    name: 'SaaS Delivery Pró - Sistema de Pedidos & Cardápio Digital',
    category: 'sites',
    categoryLabel: 'Site & SaaS Web',
    format: 'Next.js 15 · TypeScript · Tailwind CSS · Painel Admin + PDV',
    fileSize: '150 MB (Código Completo Pronto para Deploy)',
    shortDescription: 'Crie sua própria plataforma estilo iFood para restaurantes da sua cidade. Sem mensalidades abusivas e 100% customizável.',
    fullDescription: `Tenha o seu próprio negócio de delivery ou instale para pizzarias, hamburguerias e restaurantes locais cobrando taxa mensal.

Destaques da Plataforma:
• Cardápio digital interativo com fotos de alta qualidade e adicionais
• Envio de pedido formatado direto para o WhatsApp do estabelecimento
• Painel do restaurante com som de novo pedido e controle de status (Na Cozinha, Em Rota, Entregue)
• Suporte a taxas de entrega por bairro ou raio de distância
• Integração Pix automática com QR Code Copia e Cola`,
    originalPrice: 1500.00,
    promoPrice: 49.90,
    badge: 'Pronto para entrega',
    image: '',
    secretDownloadUrl: 'https://mega.nz/file/doidao-saas-delivery-pro-full.zip',
    secretInstructions: 'Instale o Node.js v20+. Execute "npm install" e configure o arquivo .env com os dados do seu banco de dados ou Supabase. Manual de instalação em vídeo incluso na pasta "docs".',
    demoUrl: 'https://delivery-pro-demo.exemplo.com',
    active: true,
    featured: true,
    downloadsCount: 205,
    createdAt: '2026-03-04T18:00:00Z',
  },
  {
    id: 'prod-bot-whatsapp',
    name: 'Bot de Vendas & Disparos WhatsApp v5.8 Multi-Atendentes',
    category: 'scripts',
    categoryLabel: 'Script & Automação',
    format: 'Node.js · Baileys v6 · Webhook · Interface Web Gratuita',
    fileSize: '42 MB (Script Pré-configurado)',
    shortDescription: 'Automatize suas vendas 24h por dia no WhatsApp. Respostas automáticas, catálogo interativo e disparo em massa inteligente.',
    fullDescription: `Automação completa para WhatsApp sem pagar APIs caras por mensagem. Funciona via QR Code em minutos.

Recursos:
• Fluxo de atendimento tipo URA interativo ("Digite 1 para suporte, 2 para compras")
• Integração pronta com Mercado Pago / Pix gerando chave na hora
• Disparador de mensagens com delay anti-banimento configurável
• Multi-atendentes: conecte atendentes diferentes no mesmo número
• Compatível com VPS barata (R$ 20/mês) ou Windows local`,
    originalPrice: 650.00,
    promoPrice: 35.00,
    badge: 'Pronto para entrega',
    image: '',
    secretDownloadUrl: 'https://drive.google.com/drive/folders/doidao-bot-whatsapp-v58',
    secretInstructions: 'Abra a pasta no terminal e digite "npm start". Escaneie o QR Code que aparece na tela com o seu WhatsApp para conectar instantaneamente.',
    active: true,
    featured: false,
    downloadsCount: 94,
    createdAt: '2026-03-05T11:20:00Z',
  },
  {
    id: 'prod-livro-inteligencia-artificial',
    name: 'Livro: O Guia Prático de Inteligência Artificial para Negócios',
    category: 'livros',
    categoryLabel: 'Livro & E-book',
    format: 'PDF Digital Interativo + Planilhas de Prompts + 15 Vídeo-Aulas',
    fileSize: '65 MB (Guia Definitivo 320 páginas)',
    shortDescription: 'Como usar IA para multiplicar as vendas da sua empresa, criar conteúdos virais e automatizar processos chatos.',
    fullDescription: `Guia prático sem enrolação matemática ou termos difíceis. Foco 100% em ROI e aplicação real no dia a dia corporativo e de prestadores de serviço.

Conteúdo:
• Engenharia de prompt aplicada para vendas e persuasão
• Como automatizar criação de posts, roteiros e anúncios de alta conversão
• Criação de agentes que atendem clientes automaticamente
• Casos de estudo reais de empresas brasileiras que dobraram faturamento`,
    originalPrice: 150.00,
    promoPrice: 15.00,
    badge: 'Pronto para entrega',
    image: '',
    secretDownloadUrl: 'https://mega.nz/file/doidao-livro-ia-pratica-2026.pdf',
    secretInstructions: 'Faça o download do arquivo PDF e da pasta complementar com os templates de prompts prontos para copiar e colar no ChatGPT/Gemini.',
    active: true,
    featured: false,
    downloadsCount: 76,
    createdAt: '2026-03-06T15:45:00Z',
  },
];

// Initial pre-configured test keys for immediate testing
export const INITIAL_KEYS: DownloadKey[] = [
  {
    id: 'key-sample-1',
    key: 'DOIDAO-MINHA-OBRA-2026',
    productId: 'prod-minha-obra',
    productName: 'Minha Obra - App de Gestão & Orçamentos',
    customerNote: 'Chave de Teste VIP - Minha Obra',
    status: 'active',
    createdAt: '2026-03-01T12:00:00Z',
    downloadCount: 0,
    maxUses: 5,
  },
  {
    id: 'key-sample-2',
    key: 'DOIDAO-XBOX-360-VIP',
    productId: 'prod-xbox-desbloqueio',
    productName: 'Desbloqueio Abad avatar instantâneo Xbox 360',
    customerNote: 'Chave de Demonstração - Xbox 360',
    status: 'active',
    createdAt: '2026-03-02T16:00:00Z',
    downloadCount: 0,
    maxUses: 5,
  },
  {
    id: 'key-sample-3',
    key: 'DOIDAO-LIVRO-FULLSTACK',
    productId: 'prod-livro-fullstack',
    productName: 'Livro: O Guia Definitivo do Desenvolvedor Fullstack Moderno',
    customerNote: 'Chave de Teste - Livro Fullstack',
    status: 'active',
    createdAt: '2026-03-03T10:00:00Z',
    downloadCount: 0,
    maxUses: 5,
  },
];

// LocalStorage helpers
export function getStoredProducts(): Product[] {
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY);
    if (!raw) {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading products from localStorage:', e);
    return INITIAL_PRODUCTS;
  }
}

export function saveStoredProducts(products: Product[]): void {
  try {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  } catch (e) {
    console.error('Error saving products to localStorage:', e);
  }
}

export function getStoredKeys(): DownloadKey[] {
  try {
    const raw = localStorage.getItem(KEYS_KEY);
    if (!raw) {
      localStorage.setItem(KEYS_KEY, JSON.stringify(INITIAL_KEYS));
      return INITIAL_KEYS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading keys from localStorage:', e);
    return INITIAL_KEYS;
  }
}

export function saveStoredKeys(keys: DownloadKey[]): void {
  try {
    localStorage.setItem(KEYS_KEY, JSON.stringify(keys));
  } catch (e) {
    console.error('Error saving keys to localStorage:', e);
  }
}

export function getAppSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Error reading settings from localStorage:', e);
    return DEFAULT_SETTINGS;
  }
}

export function saveAppSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings to localStorage:', e);
  }
}

export function generateRandomKey(prefix = 'DOIDAO'): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const segment1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const segment2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${prefix}-${segment1}-${segment2}`;
}

export function createDownloadKey(productId: string, productName: string, customerNote = '', maxUses = 3): DownloadKey {
  const keys = getStoredKeys();
  const newKey: DownloadKey = {
    id: 'key-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    key: generateRandomKey(),
    productId,
    productName,
    customerNote: customerNote || 'Venda WhatsApp',
    status: 'active',
    createdAt: new Date().toISOString(),
    downloadCount: 0,
    maxUses,
  };
  keys.unshift(newKey);
  saveStoredKeys(keys);
  return newKey;
}

export function validateKey(keyToTest: string): {
  success: boolean;
  message: string;
  product?: Product;
  downloadKey?: DownloadKey;
} {
  const cleanKey = keyToTest.trim().toUpperCase();
  if (!cleanKey) {
    return { success: false, message: 'Por favor, digite a sua chave de download.' };
  }

  const keys = getStoredKeys();
  const foundKey = keys.find(k => k.key.toUpperCase() === cleanKey);

  if (!foundKey) {
    return {
      success: false,
      message: 'Chave não encontrada ou inválida. Verifique os caracteres ou entre em contato com nosso WhatsApp.',
    };
  }

  if (foundKey.status === 'revoked') {
    return {
      success: false,
      message: 'Esta chave de download foi revogada pelo administrador.',
    };
  }

  if (foundKey.downloadCount >= foundKey.maxUses) {
    return {
      success: false,
      message: `Esta chave atingiu o limite máximo de ${foundKey.maxUses} downloads. Caso precise de nova autorização, fale conosco no WhatsApp.`,
    };
  }

  const products = getStoredProducts();
  const product = products.find(p => p.id === foundKey.productId);

  if (!product) {
    return {
      success: false,
      message: 'Produto associado a esta chave não foi localizado no catálogo.',
    };
  }

  return {
    success: true,
    message: 'Chave autorizada com sucesso!',
    product,
    downloadKey: foundKey,
  };
}

export function recordKeyDownload(keyId: string): void {
  const keys = getStoredKeys();
  const idx = keys.findIndex(k => k.id === keyId);
  if (idx !== -1) {
    keys[idx].downloadCount += 1;
    keys[idx].usedAt = new Date().toISOString();
    if (keys[idx].downloadCount >= keys[idx].maxUses) {
      keys[idx].status = 'used';
    }
    saveStoredKeys(keys);
  }

  // Also increment product download counter
  if (idx !== -1) {
    const products = getStoredProducts();
    const pIdx = products.findIndex(p => p.id === keys[idx].productId);
    if (pIdx !== -1) {
      products[pIdx].downloadsCount = (products[pIdx].downloadsCount || 0) + 1;
      saveStoredProducts(products);
    }
  }
}

// Admin Auth State
export function isAdminLoggedIn(): boolean {
  try {
    return localStorage.getItem(AUTH_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setAdminLoggedIn(loggedIn: boolean): void {
  try {
    if (loggedIn) {
      localStorage.setItem(AUTH_KEY, 'true');
    } else {
      localStorage.removeItem(AUTH_KEY);
    }
  } catch (e) {
    console.error('Error setting admin auth:', e);
  }
}

// Helpers for WhatsApp links
export function buildWhatsAppBuyUrl(phone: string, product: Product): string {
  const cleanPhone = phone.replace(/\D/g, '');
  const message = `Olá! Vi o produto *${product.name}* (${product.categoryLabel}) por *R$ ${product.promoPrice.toFixed(2).replace('.', ',')}* no site *Doidão Downloads* e quero comprar via Pix.\n\nComo faço para efetuar o pagamento e receber minha chave de download imediata?`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function buildWhatsAppAdUrl(phone: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  const message = `Olá! Gostaria de anunciar meu produto/aplicativo/livro na vitrine do *Doidão Downloads*. Como funciona a negociação de espaço e valor para anúncio?`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function buildWhatsAppKeyDeliveryUrl(phone: string, customerName: string, product: Product, key: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  const greeting = customerName ? `Olá, *${customerName}*!` : `Olá!`;
  const message = `${greeting}\n\nSeu pagamento para o produto *${product.name}* foi confirmado com sucesso!\n\n🔑 *Sua Chave de Acesso Exclusiva:*\n\`${key}\`\n\nPara baixar seus arquivos agora:\n1. Acesse o site do Doidão Downloads\n2. Clique em "Desbloquear download com chave"\n3. Cole sua chave e clique em Liberar!\n\nQualquer dúvida estamos à disposição!`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
