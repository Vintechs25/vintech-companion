// WHMCS Configuration
// Update these values to match your WHMCS setup

export const WHMCS_CONFIG = {
  // Base URLs
  billingUrl: "https://billing.vintechdev.store",
  
  // Product IDs - Update these to match your WHMCS Products/Services
  products: {
    basic: {
      pid: 1,
      name: "Basic",
      monthlyPrice: 4.99,
      features: [
        "5 GB SSD Storage",
        "1 Website",
        "Free SSL Certificate",
        "Weekly Backups",
        "Email Support",
      ],
    },
    pro: {
      pid: 2,
      name: "Professional",
      monthlyPrice: 9.99,
      features: [
        "25 GB NVMe Storage",
        "Unlimited Websites",
        "Free SSL Certificates",
        "Daily Backups",
        "Priority Support",
        "Free Domain",
      ],
    },
    enterprise: {
      pid: 3,
      name: "Enterprise",
      monthlyPrice: 24.99,
      features: [
        "100 GB NVMe Storage",
        "Unlimited Websites",
        "Free SSL Certificates",
        "Real-time Backups",
        "24/7 Phone Support",
        "Free Domain",
        "Dedicated IP",
        "Advanced Security",
      ],
    },
  },

  // Department IDs - Update these to match your WHMCS Support Departments
  departments: {
    sales: { id: 1, name: "Sales" },
    technical: { id: 2, name: "Technical Support" },
    billing: { id: 3, name: "Billing" },
  },

  // Billing cycles with discounts
  billingCycles: {
    monthly: { value: "monthly", label: "Monthly", months: 1, discount: 0 },
    quarterly: { value: "quarterly", label: "Quarterly", months: 3, discount: 5 },
    semiannually: { value: "semiannually", label: "Semi-Annually", months: 6, discount: 10 },
    annually: { value: "annually", label: "Annually", months: 12, discount: 15 },
  },

// Payment methods
  paymentMethods: [
    { id: "paystack", name: "Pay with M-Pesa, Card & Bank", description: "Debit/Credit Cards, M-Pesa, Bank Transfer" },
  ],

  // Ticket priorities
  priorities: ["Low", "Medium", "High", "Urgent"],
} as const;

// Helper functions
export function getProductById(productKey: string) {
  return WHMCS_CONFIG.products[productKey as keyof typeof WHMCS_CONFIG.products];
}

export function getDepartmentById(deptKey: string) {
  return WHMCS_CONFIG.departments[deptKey as keyof typeof WHMCS_CONFIG.departments];
}

export function calculatePrice(basePrice: number, billingCycle: string): number {
  const cycle = WHMCS_CONFIG.billingCycles[billingCycle as keyof typeof WHMCS_CONFIG.billingCycles];
  if (!cycle) return basePrice;
  
  const months = cycle.months;
  const discount = cycle.discount / 100;
  const totalBeforeDiscount = basePrice * months;
  
  return totalBeforeDiscount * (1 - discount);
}

export function formatBillingCyclePrice(baseMonthlyPrice: number, billingCycle: string): string {
  const cycle = WHMCS_CONFIG.billingCycles[billingCycle as keyof typeof WHMCS_CONFIG.billingCycles];
  if (!cycle) return `$${baseMonthlyPrice.toFixed(2)}/mo`;
  
  const total = calculatePrice(baseMonthlyPrice, billingCycle);
  const perMonth = total / cycle.months;
  
  if (cycle.months === 1) {
    return `$${total.toFixed(2)}/mo`;
  }
  
  return `$${total.toFixed(2)} ($${perMonth.toFixed(2)}/mo)`;
}
