// Vintech Hosting API Client
const WHMCS_API_URL = "https://vintechdev.store/api/whmcs.php";
const WHMCS_API_IDENTIFIER = "Fg08ttjpIYSm2QgOmcQJmyRrNC5Qv9CR";
const WHMCS_API_SECRET = "xnDujdSB0XPqeARqqgJDcdXPpNX3t7Gj";

interface ApiResponse<T = unknown> {
  result?: string;
  error?: string;
  message?: string;
  data?: T;
  pay_url?: string;
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
  product: string;
  domain: string;
  paymentmethod: string;
}

// Helper function for WHMCS API requests
async function whmcsRequest<T>(
  action: string,
  params?: Record<string, unknown>
): Promise<T> {
  const formData = new URLSearchParams();
  formData.append("identifier", WHMCS_API_IDENTIFIER);
  formData.append("secret", WHMCS_API_SECRET);
  formData.append("action", action);
  formData.append("responsetype", "json");

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    }
  }

  // Pass action as query parameter since PHP may read from $_GET
  const url = `${WHMCS_API_URL}?action=${encodeURIComponent(action)}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Auth endpoints
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
    lastname: string
  ): Promise<ApiResponse> => {
    return whmcsRequest<ApiResponse>("AddClient", {
      email,
      password2: password,
      firstname,
      lastname,
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

// Dashboard endpoint - combines multiple WHMCS calls
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

// Services endpoints
export const servicesApi = {
  getAll: async (userid: number): Promise<Service[]> => {
    const response = await whmcsRequest<{ products?: { product: Service[] } }>("GetClientsProducts", { clientid: userid });
    return response.products?.product || [];
  },

  getOne: async (id: number): Promise<Service> => {
    const response = await whmcsRequest<{ products?: { product: Service[] } }>("GetClientsProducts", { serviceid: id });
    return response.products?.product?.[0] || {} as Service;
  },

  action: async (
    serviceId: number,
    action: string,
    data?: Record<string, unknown>
  ): Promise<ApiResponse> => {
    return whmcsRequest<ApiResponse>("ModuleCustom", {
      serviceid: serviceId,
      func_name: action,
      ...data,
    });
  },
};

// Order endpoint
export const orderApi = {
  create: async (payload: OrderPayload): Promise<ApiResponse> => {
    return whmcsRequest<ApiResponse>("AddOrder", {
      clientid: payload.userid,
      pid: payload.product,
      domain: payload.domain,
      paymentmethod: payload.paymentmethod,
    });
  },
};

// Invoices endpoint
export const invoicesApi = {
  getAll: async (userid: number): Promise<Invoice[]> => {
    const response = await whmcsRequest<{ invoices?: { invoice: Invoice[] } }>("GetInvoices", { userid });
    return response.invoices?.invoice || [];
  },
};

// Domain search result interface
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

// Domains endpoint
export const domainsApi = {
  getAll: async (userid: number): Promise<Domain[]> => {
    const response = await whmcsRequest<{ domains?: { domain: Domain[] } }>("GetClientsDomains", { clientid: userid });
    return response.domains?.domain || [];
  },

  search: async (domain: string): Promise<DomainSearchResult[]> => {
    const response = await whmcsRequest<{ status?: string; result?: DomainSearchResult[] }>("DomainWhois", { domain });
    return response.result || [{ domain, available: response.status === "available", price: "" }];
  },

  register: async (payload: DomainRegistrationPayload): Promise<DomainOrderResponse> => {
    return whmcsRequest<DomainOrderResponse>("AddOrder", {
      clientid: payload.userid,
      domain: payload.domain,
      domaintype: "register",
      regperiod: payload.years,
      idprotection: payload.privacy,
      paymentmethod: payload.paymentmethod,
      ...payload.registrant,
    });
  },

  transfer: async (userid: number, domain: string, eppCode: string): Promise<DomainOrderResponse> => {
    return whmcsRequest<DomainOrderResponse>("AddOrder", {
      clientid: userid,
      domain,
      domaintype: "transfer",
      eppcode: eppCode,
    });
  },
};

// Tickets endpoints
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
    department?: string,
    priority?: string
  ): Promise<ApiResponse> => {
    return whmcsRequest<ApiResponse>("OpenTicket", {
      clientid: userid,
      subject,
      message,
      deptid: department || "1",
      priority: priority || "Medium",
    });
  },

  reply: async (ticketId: number, message: string): Promise<ApiResponse> => {
    return whmcsRequest<ApiResponse>("AddTicketReply", {
      ticketid: ticketId,
      message,
    });
  },
};

// Export types
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
