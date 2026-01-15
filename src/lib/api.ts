// Vintech Hosting API Client
const API_BASE = "https://vintechdev.store/api";

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

// Helper function for API requests
async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Auth endpoints
export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    return apiRequest<LoginResponse>("/whmcs.php", {
      method: "POST",
      body: JSON.stringify({
        action: "login",
        email,
        password,
      }),
    });
  },

  register: async (
    email: string,
    password: string,
    firstname: string,
    lastname: string
  ): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>("/whmcs.php", {
      method: "POST",
      body: JSON.stringify({
        action: "register",
        email,
        password,
        firstname,
        lastname,
      }),
    });
  },
};

// Dashboard endpoint
export const dashboardApi = {
  get: async (userid: number): Promise<DashboardData> => {
    return apiRequest<DashboardData>(`/dashboard.php?userid=${userid}`);
  },
};

// Services endpoints
export const servicesApi = {
  getAll: async (userid: number): Promise<Service[]> => {
    return apiRequest<Service[]>(`/services.php?userid=${userid}`);
  },

  getOne: async (id: number): Promise<Service> => {
    return apiRequest<Service>(`/service.php?id=${id}`);
  },

  action: async (
    serviceId: number,
    action: string,
    data?: Record<string, unknown>
  ): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>("/service-action.php", {
      method: "POST",
      body: JSON.stringify({
        service_id: serviceId,
        action,
        ...data,
      }),
    });
  },
};

// Order endpoint
export const orderApi = {
  create: async (payload: OrderPayload): Promise<ApiResponse> => {
    // NOTE: This endpoint may expect form-encoded POST (not JSON)
    const form = new URLSearchParams();
    for (const [key, value] of Object.entries(payload)) {
      form.set(key, String(value));
    }

    return apiRequest<ApiResponse>("/order.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form.toString(),
    });
  },
};

// Invoices endpoint
export const invoicesApi = {
  getAll: async (userid: number): Promise<Invoice[]> => {
    return apiRequest<Invoice[]>(`/invoices.php?userid=${userid}`);
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
    return apiRequest<Domain[]>(`/domains.php?userid=${userid}`);
  },

  search: async (domain: string): Promise<DomainSearchResult[]> => {
    return apiRequest<DomainSearchResult[]>(`/domain-search.php?domain=${encodeURIComponent(domain)}`);
  },

  register: async (payload: DomainRegistrationPayload): Promise<DomainOrderResponse> => {
    return apiRequest<DomainOrderResponse>("/domain-register.php", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  transfer: async (userid: number, domain: string, eppCode: string): Promise<DomainOrderResponse> => {
    return apiRequest<DomainOrderResponse>("/domain-transfer.php", {
      method: "POST",
      body: JSON.stringify({ userid, domain, epp_code: eppCode }),
    });
  },
};

// Tickets endpoints
export const ticketsApi = {
  getAll: async (userid: number): Promise<Ticket[]> => {
    return apiRequest<Ticket[]>(`/tickets.php?userid=${userid}`);
  },

  getOne: async (ticketId: number): Promise<TicketDetail> => {
    return apiRequest<TicketDetail>(`/ticket.php?id=${ticketId}`);
  },

  open: async (
    userid: number,
    subject: string,
    message: string,
    department?: string,
    priority?: string
  ): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>("/openticket.php", {
      method: "POST",
      body: JSON.stringify({
        userid,
        subject,
        message,
        department,
        priority,
      }),
    });
  },

  reply: async (ticketId: number, message: string): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>("/replyticket.php", {
      method: "POST",
      body: JSON.stringify({
        ticketid: ticketId,
        message,
      }),
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
