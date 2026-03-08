/* ════════════════════════════════════════════════════════ */
/*  STOCKPRO INDUSTRIAL v2.0 — CONSTANTS */
/* ════════════════════════════════════════════════════════ */

const USERS = {
  // Utilisateurs réels - de la base de données (database.sql)
  'DIR001': {
    password: 'DG1234',
    role: 'DG',
    name: 'Directeur Général',
    initials: 'DG',
    permissions: ['read', 'write', 'settings', 'approve']
  },
  'TECH01': {
    password: 'TECH1234',
    role: 'TECH',
    name: 'Responsable Technique',
    initials: 'RT',
    permissions: ['read', 'reports']
  },
  'STOCK01': {
    password: 'STOCK1234',
    role: 'STOCK',
    name: 'Responsable de Stock',
    initials: 'RS',
    permissions: ['read', 'write']
  }
};

const COUNTRIES = [
  { code: 'TG', name: 'Togo', currency: 'XOF', symbol: 'CFA' },
  { code: 'FR', name: 'France', currency: 'EUR', symbol: '€' },
  { code: 'US', name: 'États-Unis', currency: 'USD', symbol: '$' },
  { code: 'MA', name: 'Maroc', currency: 'MAD', symbol: 'DH' },
  { code: 'SN', name: 'Sénégal', currency: 'XOF', symbol: 'CFA' },
  { code: 'CI', name: "Côte d'Ivoire", currency: 'XOF', symbol: 'CFA' },
  { code: 'CM', name: 'Cameroun', currency: 'XAF', symbol: 'FCFA' },
  { code: 'GA', name: 'Gabon', currency: 'XAF', symbol: 'FCFA' },
  { code: 'BJ', name: 'Bénin', currency: 'XOF', symbol: 'CFA' },
  { code: 'CD', name: 'Congo RDC', currency: 'CDF', symbol: 'FC' },
  { code: 'MG', name: 'Madagascar', currency: 'MGA', symbol: 'Ar' },
  { code: 'TN', name: 'Tunisie', currency: 'TND', symbol: 'DT' },
  { code: 'DZ', name: 'Algérie', currency: 'DZD', symbol: 'DA' },
  { code: 'GH', name: 'Ghana', currency: 'GHS', symbol: 'GH₵' },
  { code: 'NG', name: 'Nigeria', currency: 'NGN', symbol: '₦' },
  { code: 'ZA', name: 'Afrique du Sud', currency: 'ZAR', symbol: 'R' },
  { code: 'BR', name: 'Brésil', currency: 'BRL', symbol: 'R$' },
  { code: 'CN', name: 'Chine', currency: 'CNY', symbol: '¥' },
  { code: 'DE', name: 'Allemagne', currency: 'EUR', symbol: '€' },
  { code: 'GB', name: 'Royaume-Uni', currency: 'GBP', symbol: '£' },
  { code: 'CA', name: 'Canada', currency: 'CAD', symbol: 'CA$' },
  { code: 'AU', name: 'Australie', currency: 'AUD', symbol: 'A$' },
  { code: 'JP', name: 'Japon', currency: 'JPY', symbol: '¥' },
  { code: 'IN', name: 'Inde', currency: 'INR', symbol: '₹' },
  { code: 'AE', name: 'Émirats Arabes', currency: 'AED', symbol: 'AED' },
  { code: 'TR', name: 'Turquie', currency: 'TRY', symbol: '₺' },
  { code: 'MX', name: 'Mexique', currency: 'MXN', symbol: 'MX$' },
  { code: 'AR', name: 'Argentine', currency: 'ARS', symbol: '$' },
  { code: 'EG', name: 'Égypte', currency: 'EGP', symbol: 'E£' },
  { code: 'KE', name: 'Kenya', currency: 'KES', symbol: 'KSh' },
  { code: 'ET', name: 'Éthiopie', currency: 'ETB', symbol: 'ETB' },
  { code: 'TZ', name: 'Tanzanie', currency: 'TZS', symbol: 'TSh' },
  { code: 'ML', name: 'Mali', currency: 'XOF', symbol: 'CFA' },
  { code: 'BF', name: 'Burkina Faso', currency: 'XOF', symbol: 'CFA' },
  { code: 'NE', name: 'Niger', currency: 'XOF', symbol: 'CFA' },
  { code: 'GN', name: 'Guinée', currency: 'GNF', symbol: 'FG' },
  { code: 'RW', name: 'Rwanda', currency: 'RWF', symbol: 'FRw' },
  { code: 'MW', name: 'Malawi', currency: 'MWK', symbol: 'MK' },
  { code: 'ZM', name: 'Zambie', currency: 'ZMW', symbol: 'ZK' },
  { code: 'UG', name: 'Ouganda', currency: 'UGX', symbol: 'USh' }
];

const CURRENCIES = [
  { code: 'XOF', name: 'Franc CFA UEMOA', symbol: 'CFA' },
  { code: 'XAF', name: 'Franc CFA CEMAC', symbol: 'FCFA' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'USD', name: 'Dollar US', symbol: '$' },
  { code: 'GBP', name: 'Livre Sterling', symbol: '£' },
  { code: 'MAD', name: 'Dirham marocain', symbol: 'DH' },
  { code: 'DZD', name: 'Dinar algérien', symbol: 'DA' },
  { code: 'TND', name: 'Dinar tunisien', symbol: 'DT' },
  { code: 'NGN', name: 'Naira nigérian', symbol: '₦' },
  { code: 'GHS', name: 'Cedi ghanéen', symbol: 'GH₵' },
  { code: 'ZAR', name: 'Rand sud-africain', symbol: 'R' },
  { code: 'CNY', name: 'Yuan chinois', symbol: '¥' },
  { code: 'INR', name: 'Roupie indienne', symbol: '₹' },
  { code: 'BRL', name: 'Réal brésilien', symbol: 'R$' },
  { code: 'CAD', name: 'Dollar canadien', symbol: 'CA$' },
  { code: 'AUD', name: 'Dollar australien', symbol: 'A$' },
  { code: 'JPY', name: 'Yen japonais', symbol: '¥' },
  { code: 'AED', name: 'Dirham émirati', symbol: 'AED' },
  { code: 'TRY', name: 'Livre turque', symbol: '₺' }
];

const DEMO_MATERIALS = [
  {
    id: 'MAT001',
    name: 'Résine PEHD',
    code: 'MAT-001',
    cat: 'Polymères',
    unit: 'kg',
    stock: 4500,
    minStock: 1000,
    safetyStock: 2000,
    supplier: 'ChemPlast SA',
    desc: 'Polyéthylène haute densité',
    color: '#f59e0b',
    icon: '🌀',
    created: new Date().toISOString().split('T')[0]
  },
  {
    id: 'MAT002',
    name: 'Résine PEBP',
    code: 'MAT-002',
    cat: 'Polymères',
    unit: 'kg',
    stock: 320,
    minStock: 500,
    safetyStock: 1000,
    supplier: 'PolyMat SARL',
    desc: 'Polyéthylène basse pression',
    color: '#3b82f6',
    icon: '🌀',
    created: new Date().toISOString().split('T')[0]
  },
  {
    id: 'MAT003',
    name: 'Masterbatch Noir',
    code: 'MAT-003',
    cat: 'Colorants',
    unit: 'kg',
    stock: 85,
    minStock: 200,
    safetyStock: 400,
    supplier: 'ColorTech',
    desc: 'Concentré colorant noir',
    color: '#64748b',
    icon: '🎨',
    created: new Date().toISOString().split('T')[0]
  },
  {
    id: 'MAT004',
    name: 'Plastifiant DOP',
    code: 'MAT-004',
    cat: 'Plastifiants',
    unit: 'L',
    stock: 1200,
    minStock: 300,
    safetyStock: 600,
    supplier: 'ChemPlast SA',
    desc: 'Dioctyl phtalate',
    color: '#10b981',
    icon: '🧴',
    created: new Date().toISOString().split('T')[0]
  },
  {
    id: 'MAT005',
    name: 'Stabilisant Ca/Zn',
    code: 'MAT-005',
    cat: 'Stabilisants',
    unit: 'kg',
    stock: 150,
    minStock: 50,
    safetyStock: 100,
    supplier: 'StabiliChem',
    desc: 'Stabilisant thermique',
    color: '#8b5cf6',
    icon: '⚗️',
    created: new Date().toISOString().split('T')[0]
  },
  {
    id: 'MAT006',
    name: 'Carbonate de Calcium',
    code: 'MAT-006',
    cat: 'Charges',
    unit: 'kg',
    stock: 8000,
    minStock: 2000,
    safetyStock: 4000,
    supplier: 'MinéralPlus',
    desc: 'CaCO3 grade industriel',
    color: '#f97316',
    icon: '📦',
    created: new Date().toISOString().split('T')[0]
  }
];
