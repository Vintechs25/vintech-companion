// Billing System Configuration
// Update these values to match your billing setup

export const BILLING_CONFIG = {
  // Base URLs
  billingUrl: "https://billing.vintechdev.store",
  
  // Currency
  currency: "KES",
  currencySymbol: "KES",
  
  // Product IDs - Update these to match your Products/Services
  products: {
    basic: {
      pid: 1,
      name: "Basic Hosting",
      tagline: "Affordable hosting for personal websites",
      description: "Perfect for personal websites, portfolios, and small projects.",
      // Pricing in KES
      semiannualPrice: 1200,
      annualPrice: 2000,
      features: [
        "5 GB SSD Storage",
        "1 Website",
        "Free SSL Certificate",
        "Weekly Backups",
        "Email Accounts",
        "Basic Security Protection",
        "Email Support",
      ],
      limits: [
        "1 website",
        "Limited CPU & RAM",
        "Fair usage policy applies",
      ],
      orderUrl: "https://billing.vintechdev.store/index.php?rp=/store/hosting-plans/basic-hosting",
    },
    pro: {
      pid: 2,
      name: "Professional Hosting",
      tagline: "Best value for growing websites",
      description: "Reliable hosting for businesses and professionals.",
      // Pricing in KES
      semiannualPrice: 2600,
      annualPrice: 4500,
      features: [
        "20-25 GB NVMe Storage",
        "Unlimited Websites (Fair Use)",
        "Free SSL Certificates",
        "Daily Backups",
        "Unlimited Email Accounts",
        "Enhanced Security Protection",
        "Priority Support",
      ],
      limits: [
        "Fair usage policy",
        "Medium CPU & RAM allocation",
      ],
      orderUrl: "https://billing.vintechdev.store/index.php?rp=/store/hosting-plans/professionalhosting",
    },
    enterprise: {
      pid: 3,
      name: "Enterprise Hosting",
      tagline: "High-performance hosting for serious businesses",
      description: "Advanced hosting for high-traffic and mission-critical websites.",
      // Pricing in KES
      semiannualPrice: 5500,
      annualPrice: 9500,
      features: [
        "50-100 GB NVMe Storage",
        "Unlimited Websites",
        "Free SSL Certificates",
        "Daily / Real-Time Backups",
        "Dedicated IP Address",
        "Advanced Security & Firewall",
        "24/7 Priority Support",
      ],
      limits: [
        "Higher CPU & RAM priority",
        "Designed for business workloads",
      ],
      orderUrl: "https://billing.vintechdev.store/index.php?rp=/store/hosting-plans/enterprise",
    },
  },

  // Department IDs - Update these to match your Support Departments
  departments: {
    sales: { id: 1, name: "Sales" },
    technical: { id: 2, name: "Technical Support" },
    billing: { id: 3, name: "Billing" },
  },

  // Billing cycles - ONLY Semi-Annual and Annual available
  billingCycles: {
    semiannually: { value: "semiannually", label: "Semi-Annual (6 Months)", months: 6, discount: 0 },
    annually: { value: "annually", label: "Annual (12 Months)", months: 12, discount: 0, recommended: true },
  },

  // Default billing cycle
  defaultBillingCycle: "annually",

  // Payment methods
  paymentMethods: [
    { id: "paystack", name: "Pay with M-Pesa, Card & Bank", description: "Debit/Credit Cards, M-Pesa, Bank Transfer" },
  ],

  // Ticket priorities
  priorities: ["Low", "Medium", "High", "Urgent"],
} as const;

// Backward compatibility alias
export const WHMCS_CONFIG = BILLING_CONFIG;

// Helper functions
export function getProductById(productKey: string) {
  return BILLING_CONFIG.products[productKey as keyof typeof BILLING_CONFIG.products];
}

export function getDepartmentById(deptKey: string) {
  return BILLING_CONFIG.departments[deptKey as keyof typeof BILLING_CONFIG.departments];
}

export function getProductPrice(productKey: string, billingCycle: string): number {
  const product = BILLING_CONFIG.products[productKey as keyof typeof BILLING_CONFIG.products];
  if (!product) return 0;
  
  if (billingCycle === "annually") {
    return product.annualPrice;
  }
  return product.semiannualPrice;
}

export function calculatePrice(productKey: string, billingCycle: string): number {
  return getProductPrice(productKey, billingCycle);
}

export function getMonthlyEquivalent(productKey: string, billingCycle: string): number {
  const total = getProductPrice(productKey, billingCycle);
  const cycle = BILLING_CONFIG.billingCycles[billingCycle as keyof typeof BILLING_CONFIG.billingCycles];
  if (!cycle) return total;
  return Math.round(total / cycle.months);
}

export function formatPrice(amount: number): string {
  return `KES ${amount.toLocaleString()}`;
}

export function formatBillingCyclePrice(productKey: string, billingCycle: string): string {
  const total = getProductPrice(productKey, billingCycle);
  const cycle = BILLING_CONFIG.billingCycles[billingCycle as keyof typeof BILLING_CONFIG.billingCycles];
  if (!cycle) return formatPrice(total);
  
  const perMonth = Math.round(total / cycle.months);
  return `${formatPrice(total)} (≈ ${formatPrice(perMonth)}/mo)`;
}
