// Vintech Hosting API Client
const API_BASE = "https://vintechdev.store/api";

interface ApiResponse<T = unknown> {
  result?: string;
  error?: string;
  data?: T;
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
    name: string;
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
  amount: string;
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

interface OrderPayload {
  userid: number;
  product: string;
  domain: string;
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
    return apiRequest<ApiResponse>("/service.php", {
      method: "POST",
      body: JSON.stringify({
        id: serviceId,
        action,
        ...data,
      }),
    });
  },
};

// Order endpoint
export const orderApi = {
  create: async (payload: OrderPayload): Promise<ApiResponse> => {
    return apiRequest<ApiResponse>("/order.php", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

// Invoices endpoint
export const invoicesApi = {
  getAll: async (userid: number): Promise<Invoice[]> => {
    return apiRequest<Invoice[]>(`/invoices.php?userid=${userid}`);
  },
};

// Domains endpoint
export const domainsApi = {
  getAll: async (userid: number): Promise<Domain[]> => {
    return apiRequest<Domain[]>(`/domains.php?userid=${userid}`);
  },
};

// Tickets endpoints
export const ticketsApi = {
  getAll: async (userid: number): Promise<Ticket[]> => {
    return apiRequest<Ticket[]>(`/tickets.php?userid=${userid}`);
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
  OrderPayload,
};
