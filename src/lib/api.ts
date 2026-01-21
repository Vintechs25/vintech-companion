// Vintech Hosting API Client
// Requests are sent to the PHP bridge which injects WHMCS credentials server-side.
const WHMCS_API_URL = "https://vintechdev.store/api/whmcs.php";
const WHMCS_BILLING_URL = "https://billing.vintechdev.store";

// ============= WHMCS Configuration Constants =============
// These IDs must match your WHMCS setup

// Product IDs from WHMCS Products/Services
export const WHMCS_PRODUCTS = {
  basic: { pid: 1, name: "Basic", price: 4.99 },
  pro: { pid: 2, name: "Professional", price: 9.99 },
  enterprise: { pid: 3, name: "Enterprise", price: 24.99 },
} as const;

// Department IDs from WHMCS Support Departments
export const WHMCS_DEPARTMENTS = {
  sales: { id: 1, name: "Sales" },
  technical: { id: 2, name: "Technical Support" },
  billing: { id: 3, name: "Billing" },
} as const;

// Billing cycles supported
export const BILLING_CYCLES = {
  monthly: { value: "monthly", label: "Monthly", discount: 0 },
  quarterly: { value: "quarterly", label: "Quarterly", discount: 5 },
  semiannually: { value: "semiannually", label: "Semi-Annually", discount: 10 },
  annually: { value: "annually", label: "Annually", discount: 15 },
} as const;

// Priority values for tickets
export const TICKET_PRIORITIES = ["Low", "Medium", "High", "Urgent"] as const;

// ============= Interfaces =============

interface ApiResponse<T = unknown> {
  result?: string;
  error?: string;
  message?: string;
  data?: T;
  pay_url?: string;
  invoiceid?: number;
  orderid?: number;
}

interface LoginResponse {
  result: string;
  userid?: number;
  passwordhash?: string;
  twoFactorEnabled?: boolean;
  message?: string;
}

interface DashboardData {
  user: {
    firstname: string;
    lastname: string;
    email: string;
  };
  services: Service[];
  domains: Domain[];
  invoices: Invoice[];
  tickets: Ticket[];
}

interface Service {
  id: number;
  domain: string;
  status: string;
  ip: string;
  username: string;
  panel_url: string;
  product?: string;
  billingcycle?: string;
  nextduedate?: string;
}

interface Domain {
  id: number;
  domain: string;
  status: string;
  registrationdate?: string;
  expirydate?: string;
  autorenew?: boolean;
}

interface Invoice {
  id: number;
  total: string;
  status: string;
  duedate: string;
  pay_url: string;
  date?: string;
  datepaid?: string;
}

interface Ticket {
  id: number;
  subject: string;
  status: string;
  department?: string;
  date?: string;
  lastreply?: string;
  priority?: string;
}

interface TicketReply {
  id: number;
  message: string;
  date: string;
  admin: boolean;
  name?: string;
}

interface TicketDetail extends Ticket {
  replies: TicketReply[];
}

interface OrderPayload {
  userid: number;
  pid: number;
  domain: string;
  billingcycle: string;
  paymentmethod: string;
  // Optional domain registration fields
  registerDomain?: boolean;
  domainRegPeriod?: number;
  idProtection?: boolean;
}

// Helper function for WHMCS API requests
async function whmcsRequest<T>(
  action: string,
  params?: Record<string, unknown>
): Promise<T> {
  const body = new URLSearchParams();
  body.append("action", action);
  body.append("responsetype", "json");

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) body.append(key, String(value));
    }
  }

  const response = await fetch(WHMCS_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Helper to generate payment URL
function getPaymentUrl(invoiceId: number): string {
  return `${WHMCS_BILLING_URL}/viewinvoice.php?id=${invoiceId}`;
}

// Helper to generate view invoice URL
function getInvoiceUrl(invoiceId: number): string {
  return `${WHMCS_BILLING_URL}/viewinvoice.php?id=${invoiceId}`;
}

// ============= Auth API =============
export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    return whmcsRequest<LoginResponse>("ValidateLogin", {
      email,
      password2: password,
    });
  },

  register: async (
    email: string,
    password: string,
    firstname: string,
    lastname: string,
    billing: {
      phonenumber: string;
      companyname?: string;
      address1: string;
      address2?: string;
      city: string;
      state: string;
      postcode: string;
      country: string;
    }
  ): Promise<ApiResponse> => {
    return whmcsRequest<ApiResponse>("AddClient", {
      email,
      password2: password,
      firstname,
      lastname,
      phonenumber: billing.phonenumber,
      companyname: billing.companyname || "",
      address1: billing.address1,
      address2: billing.address2 || "",
      city: billing.city,
      state: billing.state,
      postcode: billing.postcode,
      country: billing.country,
    });
  },

  resetPassword: async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await whmcsRequest<ApiResponse>("ResetPassword", { email });
      if (response.result === "success") {
        return { success: true };
      }
      return { success: false, error: response.message || "Failed to send reset email" };
    } catch {
      return { success: false, error: "Failed to send reset email. Please try again." };
    }
  },
};

// ============= Dashboard API =============
export const dashboardApi = {
  get: async (userid: number): Promise<DashboardData> => {
    const [clientDetails, products, domains, invoices, tickets] = await Promise.all([
      whmcsRequest<{ client?: { firstname: string; lastname: string; email: string } }>("GetClientsDetails", { clientid: userid }),
      whmcsRequest<{ products?: { product: Service[] } }>("GetClientsProducts", { clientid: userid }),
      whmcsRequest<{ domains?: { domain: Domain[] } }>("GetClientsDomains", { clientid: userid }),
      whmcsRequest<{ invoices?: { invoice: Invoice[] } }>("GetInvoices", { userid }),
      whmcsRequest<{ tickets?: { ticket: Ticket[] } }>("GetTickets", { clientid: userid }),
    ]);

    return {
      user: {
        firstname: clientDetails.client?.firstname || "",
        lastname: clientDetails.client?.lastname || "",
        email: clientDetails.client?.email || "",
      },
      services: clientDetails && products.products?.product ? products.products.product : [],
      domains: domains.domains?.domain || [],
      invoices: invoices.invoices?.invoice || [],
      tickets: tickets.tickets?.ticket || [],
    };
  },
};

// ============= Services API =============
export const servicesApi = {
  getAll: async (userid: number): Promise<Service[]> => {
    const response = await whmcsRequest<{ products?: { product: Service[] } }>("GetClientsProducts", { clientid: userid });
    return response.products?.product || [];
  },

  getOne: async (id: number): Promise<Service> => {
    const response = await whmcsRequest<{ products?: { product: Service[] } }>("GetClientsProducts", { serviceid: id });
    return response.products?.product?.[0] || {} as Service;
  },

  // Specific module actions for WHMCS
  changePassword: async (serviceId: number, newPassword: string): Promise<ApiResponse> => {
    return whmcsRequest<ApiResponse>("ModuleChangePassword", {
      serviceid: serviceId,
      servicepassword: newPassword,
    });
  },

  suspend: async (serviceId: number, reason?: string): Promise<ApiResponse> => {
    return whmcsRequest<ApiResponse>("ModuleSuspend", {
      serviceid: serviceId,
      suspendreason: reason || "Requested by user",
    });
  },

  unsuspend: async (serviceId: number): Promise<ApiResponse> => {
    return whmcsRequest<ApiResponse>("ModuleUnsuspend", {
      serviceid: serviceId,
    });
  },

  // Generic module command for custom actions
  moduleCommand: async (serviceId: number, command: string): Promise<ApiResponse> => {
    return whmcsRequest<ApiResponse>("ModuleCustom", {
      serviceid: serviceId,
      func_name: command,
    });
  },

  // Legacy action method - maps to specific actions
  action: async (
    serviceId: number,
    action: string,
    data?: Record<string, unknown>
  ): Promise<ApiResponse> => {
    switch (action.toLowerCase()) {
      case "changepassword":
        return servicesApi.changePassword(serviceId, data?.password as string || "");
      case "suspend":
        return servicesApi.suspend(serviceId, data?.reason as string);
      case "unsuspend":
        return servicesApi.unsuspend(serviceId);
      case "reboot":
      case "installwp":
      default:
        return servicesApi.moduleCommand(serviceId, action);
    }
  },
};

// ============= Order API =============
export const orderApi = {
  create: async (payload: OrderPayload): Promise<ApiResponse> => {
    // Build order params - WHMCS AddOrder supports both products and domains
    const orderParams: Record<string, unknown> = {
      clientid: payload.userid,
      paymentmethod: payload.paymentmethod,
    };

    // Add hosting product using array notation for WHMCS
    orderParams["pid[0]"] = payload.pid;
    orderParams["domain[0]"] = payload.domain;
    orderParams["billingcycle[0]"] = payload.billingcycle;

    // If registering a new domain, add domain registration separately
    // Domain registration requires proper array indexing for domains
    if (payload.registerDomain) {
      // For domain registration bundled with hosting, use separate domain array
      orderParams["domaintype[0]"] = "register";
      // Use regperiod from payload, defaulting to what's valid for most TLDs
      orderParams["regperiod[0]"] = payload.domainRegPeriod || 1;
      if (payload.idProtection) {
        orderParams["idprotection[0]"] = 1;
      }
    } else {
      // For existing domains, don't include domain registration params
      orderParams["domaintype[0]"] = "none";
    }

    const response = await whmcsRequest<ApiResponse>("AddOrder", orderParams);

    // Add payment URL if invoice was created
    if (response.result === "success" && response.invoiceid) {
      response.pay_url = getPaymentUrl(response.invoiceid);
    }

    return response;
  },
};

// ============= Invoices API =============
export const invoicesApi = {
  getAll: async (userid: number): Promise<Invoice[]> => {
    const response = await whmcsRequest<{ invoices?: { invoice: Invoice[] } }>("GetInvoices", { userid });
    const invoices = response.invoices?.invoice || [];
    
    // Add payment URLs for unpaid invoices
    return invoices.map(invoice => ({
      ...invoice,
      pay_url: invoice.status.toLowerCase() === "unpaid" 
        ? getPaymentUrl(invoice.id) 
        : invoice.pay_url || "",
    }));
  },

  getOne: async (invoiceId: number): Promise<Invoice> => {
    const response = await whmcsRequest<{ 
      invoiceid?: string;
      id?: number;
      total: string;
      status: string;
      duedate: string;
      date?: string;
      datepaid?: string;
    }>("GetInvoice", { invoiceid: invoiceId });
    
    // WHMCS GetInvoice returns invoiceid as a string, normalize to id as number
    const normalizedId = response.invoiceid ? parseInt(response.invoiceid) : (response.id || invoiceId);
    
    return {
      id: normalizedId,
      total: response.total,
      status: response.status,
      duedate: response.duedate,
      date: response.date,
      datepaid: response.datepaid,
      pay_url: response.status?.toLowerCase() === "unpaid" ? getPaymentUrl(normalizedId) : "",
    };
  },

  downloadPdf: (invoiceId: number): string => {
    return `${WHMCS_BILLING_URL}/dl.php?type=i&id=${invoiceId}`;
  },
};

// ============= Domain Interfaces =============
interface DomainSearchResult {
  domain: string;
  available: boolean;
  price: string;
}

interface DomainRegistrationPayload {
  userid: number;
  domain: string;
  years: number;
  privacy: boolean;
  paymentmethod: string;
  registrant: {
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
}

interface DomainOrderResponse extends ApiResponse {
  pay_url?: string;
}

// ============= Domains API =============
export const domainsApi = {
  getAll: async (userid: number): Promise<Domain[]> => {
    const response = await whmcsRequest<{ domains?: { domain: Domain[] } }>("GetClientsDomains", { clientid: userid });
    return response.domains?.domain || [];
  },

  search: async (domain: string): Promise<DomainSearchResult[]> => {
    const baseDomain = domain.split(".")[0].toLowerCase().trim();
    
    // Extended list of popular TLDs
    const tlds = [
      ".com", ".net", ".org", ".io", ".co", ".dev", ".app", ".xyz",
      ".info", ".biz", ".us", ".me", ".tv", ".cc", ".online", ".site",
      ".store", ".tech", ".cloud", ".ai", ".pro", ".name", ".mobi", ".asia"
    ];
    
    try {
      // Fetch TLD pricing from WHMCS first
      const pricingResponse = await whmcsRequest<{ 
        result?: string;
        pricing?: Record<string, { register?: Record<string, string> }>;
      }>("GetTLDPricing", { currencyid: 1 });
      
      const pricing = pricingResponse.pricing || {};
      
      // Check availability for ALL TLDs in parallel using Promise.all
      const results = await Promise.all(
        tlds.map(async (tld): Promise<DomainSearchResult> => {
          const fullDomain = `${baseDomain}${tld}`;
          const tldKey = tld.replace(".", "");
          const tldPricing = pricing[tldKey]?.register;
          const price = tldPricing?.["1"] || tldPricing?.["2"] || "12.99";
          
          try {
            const whoisResponse = await whmcsRequest<{ 
              status?: string; 
              result?: string;
            }>("DomainWhois", { domain: fullDomain });
            
            return {
              domain: fullDomain,
              available: whoisResponse.status === "available",
              price: typeof price === "string" ? price : "12.99",
            };
          } catch {
            return {
              domain: fullDomain,
              available: false,
              price: typeof price === "string" ? price : "12.99",
            };
          }
        })
      );
      
      // Sort: available domains first, then by TLD popularity
      return results.sort((a, b) => {
        if (a.available && !b.available) return -1;
        if (!a.available && b.available) return 1;
        return tlds.indexOf(`.${a.domain.split(".").pop()}`) - tlds.indexOf(`.${b.domain.split(".").pop()}`);
      });
    } catch {
      // Return fallback results on error
      return tlds.map((tld) => ({
        domain: `${baseDomain}${tld}`,
        available: true,
        price: "12.99",
      }));
    }
  },

  register: async (payload: DomainRegistrationPayload): Promise<DomainOrderResponse> => {
    // WHMCS AddOrder requires array syntax for domains
    const response = await whmcsRequest<DomainOrderResponse>("AddOrder", {
      clientid: payload.userid,
      "domain[0]": payload.domain,
      "domaintype[0]": "register",
      "regperiod[0]": payload.years,
      "idprotection[0]": payload.privacy ? 1 : 0,
      paymentmethod: payload.paymentmethod,
      // Registrant contact info - using proper WHMCS field names
      contactid: "new",
      firstname: payload.registrant.firstname,
      lastname: payload.registrant.lastname,
      email: payload.registrant.email,
      phonenumber: payload.registrant.phone,
      address1: payload.registrant.address,
      city: payload.registrant.city,
      state: payload.registrant.state,
      postcode: payload.registrant.postcode,
      country: payload.registrant.country,
    });

    // Add payment URL if invoice was created
    if (response.result === "success" && response.invoiceid) {
      response.pay_url = getPaymentUrl(response.invoiceid);
    }

    return response;
  },

  transfer: async (
    userid: number, 
    domain: string, 
    eppCode: string,
    paymentmethod: string = "paypal"
  ): Promise<DomainOrderResponse> => {
    const response = await whmcsRequest<DomainOrderResponse>("AddOrder", {
      clientid: userid,
      domain,
      domaintype: "transfer",
      regperiod: 1, // Transfer includes 1 year renewal
      eppcode: eppCode, // Correct WHMCS parameter name
      paymentmethod,
    });

    // Add payment URL if invoice was created
    if (response.result === "success" && response.invoiceid) {
      response.pay_url = getPaymentUrl(response.invoiceid);
    }

    return response;
  },

  // Get TLD pricing from WHMCS
  getPricing: async (): Promise<Record<string, { register: string; transfer: string; renew: string }>> => {
    try {
      const response = await whmcsRequest<{ pricing?: Record<string, unknown> }>("GetTLDPricing");
      return (response.pricing || {}) as Record<string, { register: string; transfer: string; renew: string }>;
    } catch {
      return {};
    }
  },
};

// ============= Tickets API =============
export const ticketsApi = {
  getAll: async (userid: number): Promise<Ticket[]> => {
    const response = await whmcsRequest<{ tickets?: { ticket: Ticket[] } }>("GetTickets", { clientid: userid });
    return response.tickets?.ticket || [];
  },

  getOne: async (ticketId: number): Promise<TicketDetail> => {
    const response = await whmcsRequest<TicketDetail>("GetTicket", { ticketid: ticketId });
    return response;
  },

  open: async (
    userid: number,
    subject: string,
    message: string,
    departmentKey?: string,
    priority?: string,
    serviceId?: number
  ): Promise<ApiResponse> => {
    // Map department key to numeric ID
    const deptId = departmentKey 
      ? WHMCS_DEPARTMENTS[departmentKey as keyof typeof WHMCS_DEPARTMENTS]?.id || 1
      : 1;

    return whmcsRequest<ApiResponse>("OpenTicket", {
      clientid: userid,
      subject,
      message,
      deptid: deptId, // Numeric department ID
      priority: priority || "Medium",
      ...(serviceId && { serviceid: serviceId }),
    });
  },

  reply: async (ticketId: number, message: string, userid?: number): Promise<ApiResponse> => {
    return whmcsRequest<ApiResponse>("AddTicketReply", {
      ticketid: ticketId,
      message,
      ...(userid && { clientid: userid }),
    });
  },

  close: async (ticketId: number): Promise<ApiResponse> => {
    return whmcsRequest<ApiResponse>("CloseTicket", {
      ticketid: ticketId,
    });
  },
};

// ============= Export Types =============
export type {
  ApiResponse,
  LoginResponse,
  DashboardData,
  Service,
  Domain,
  Invoice,
  Ticket,
  TicketDetail,
  TicketReply,
  OrderPayload,
  DomainSearchResult,
  DomainRegistrationPayload,
  DomainOrderResponse,
};

// Export URLs for external use
export { WHMCS_BILLING_URL, getPaymentUrl, getInvoiceUrl };
