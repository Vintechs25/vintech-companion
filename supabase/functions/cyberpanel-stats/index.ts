import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CyberPanelResponse {
  status?: number;
  fetchStatus?: string;
  error_message?: string;
  cpuUsage?: string | number;
  ramUsage?: string | number;
  diskUsage?: string | number;
  diskUsed?: number;
  bandwidthUsed?: number;
  data?: unknown;
  // Email accounts
  emailAccounts?: EmailAccount[];
  // Databases
  databases?: Database[];
  // SSL
  sslStatus?: string;
  sslExpiry?: string;
  // Backups
  backups?: Backup[];
  // List websites
  websitesList?: Website[];
  // DNS records
  records?: DNSRecord[];
  // PHP
  currentPHP?: string;
}

interface EmailAccount {
  email: string;
  diskUsed: string;
}

interface Database {
  name: string;
  size: string;
}

interface Backup {
  name: string;
  date: string;
  size: string;
}

interface Website {
  domain: string;
  adminEmail: string;
  ipAddress: string;
  admin: string;
  package: string;
  state: string;
  diskUsed: string;
}

interface DNSRecord {
  id: number;
  name: string;
  type: string;
  content: string;
  ttl: number;
  priority?: number;
}

// CyberPanel API endpoint mapping - based on official API structure
// API runs on port 8090 and uses controller-based paths
const API_ENDPOINTS = {
  // Server status
  serverStatus: "/api/serverStatus",
  
  // Website management
  fetchWebsites: "/api/fetchWebsites",
  getWebsiteStatus: "/api/getWebsiteStatus",
  
  // Email management
  getEmailsForDomain: "/api/getEmailsForDomain",
  submitEmailCreation: "/api/submitEmailCreation",
  deleteEmail: "/api/submitEmailDeletion",
  
  // Database management
  fetchDatabases: "/api/fetchDatabases",
  submitDBCreation: "/api/submitDBCreation",
  submitDatabaseDeletion: "/api/submitDatabaseDeletion",
  
  // SSL management
  obtainSSLForADomain: "/api/obtainSSLForADomain",
  
  // Backup management
  getBackupsForDomain: "/api/getBackupsForDomain",
  submitBackupCreation: "/api/submitBackupCreation",
  submitRestore: "/api/submitRestore",
  
  // DNS management
  getCurrentRecordsForDomain: "/api/getCurrentRecordsForDomain",
  addDNSRecord: "/api/addDNSRecord",
  deleteDNSRecord: "/api/deleteDNSRecord",
  
  // FTP management
  getAllFTPAccounts: "/api/getAllFTPAccounts",
  submitFTPCreation: "/api/submitFTPCreation",
  
  // PHP management
  getCurrentPHP: "/api/getCurrentPHP",
  changePHP: "/api/changePHP",
};

async function cyberPanelRequest(
  endpoint: string,
  data: Record<string, unknown>
): Promise<CyberPanelResponse> {
  let CYBERPANEL_URL = Deno.env.get("CYBERPANEL_URL");
  const CYBERPANEL_ADMIN_USER = Deno.env.get("CYBERPANEL_ADMIN_USER");
  const CYBERPANEL_ADMIN_PASS = Deno.env.get("CYBERPANEL_ADMIN_PASS");

  if (!CYBERPANEL_URL || !CYBERPANEL_ADMIN_USER || !CYBERPANEL_ADMIN_PASS) {
    throw new Error("CyberPanel credentials not configured");
  }

  // Ensure URL has proper protocol prefix
  if (!CYBERPANEL_URL.startsWith("http://") && !CYBERPANEL_URL.startsWith("https://")) {
    CYBERPANEL_URL = `https://${CYBERPANEL_URL}`;
  }
  
  // Remove trailing slash if present
  CYBERPANEL_URL = CYBERPANEL_URL.replace(/\/$/, "");
  
  // Add port 8090 if not already specified (CyberPanel API default port)
  if (!CYBERPANEL_URL.includes(":8090") && !CYBERPANEL_URL.includes(":443")) {
    CYBERPANEL_URL = `${CYBERPANEL_URL}:8090`;
  }

  const url = `${CYBERPANEL_URL}${endpoint}`;
  
  console.log(`CyberPanel API request to: ${url}`);
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      adminUser: CYBERPANEL_ADMIN_USER,
      adminPass: CYBERPANEL_ADMIN_PASS,
      ...data,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`CyberPanel API error: ${response.status} - ${text}`);
  }

  return await response.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action, domain, domains } = body;

    let result: Record<string, unknown> = {};

    switch (action) {
      // ============= SERVER STATS =============
      case "serverStatus": {
        const stats = await cyberPanelRequest(API_ENDPOINTS.serverStatus, {});
        
        result = {
          cpu: parseFloat(String(stats.cpuUsage)) || 0,
          memory: parseFloat(String(stats.ramUsage)) || 0,
          disk: parseFloat(String(stats.diskUsage)) || 0,
        };
        break;
      }

      // ============= WEBSITE STATS =============
      case "websiteStats": {
        if (!domain) throw new Error("Domain is required");

        const stats = await cyberPanelRequest(API_ENDPOINTS.getWebsiteStatus, { 
          websiteName: domain 
        });

        result = {
          domain,
          diskUsed: stats.diskUsed || 0,
          bandwidthUsed: stats.bandwidthUsed || 0,
        };
        break;
      }

      case "allWebsitesStats": {
        if (!domains || !Array.isArray(domains)) {
          throw new Error("Domains array is required");
        }

        const websiteStats = await Promise.all(
          domains.map(async (d: string) => {
            try {
              const stats = await cyberPanelRequest(API_ENDPOINTS.getWebsiteStatus, { 
                websiteName: d 
              });
              
              return {
                domain: d,
                diskUsed: stats.diskUsed || 0,
                bandwidthUsed: stats.bandwidthUsed || 0,
                error: null,
              };
            } catch (err) {
              return {
                domain: d,
                diskUsed: 0,
                bandwidthUsed: 0,
                error: err instanceof Error ? err.message : "Unknown error",
              };
            }
          })
        );

        const serverStats = await cyberPanelRequest(API_ENDPOINTS.serverStatus, {});

        result = {
          server: {
            cpu: parseFloat(String(serverStats.cpuUsage)) || 0,
            memory: parseFloat(String(serverStats.ramUsage)) || 0,
            disk: parseFloat(String(serverStats.diskUsage)) || 0,
          },
          websites: websiteStats,
        };
        break;
      }

      // ============= LIST ALL WEBSITES =============
      case "listWebsites": {
        const response = await cyberPanelRequest(API_ENDPOINTS.fetchWebsites, {});
        
        result = {
          websites: response.websitesList || response.data || [],
        };
        break;
      }

      // ============= EMAIL ACCOUNTS =============
      case "listEmails": {
        if (!domain) throw new Error("Domain is required");

        const response = await cyberPanelRequest(API_ENDPOINTS.getEmailsForDomain, {
          domainName: domain,
        });
        
        result = {
          emails: response.emailAccounts || response.data || [],
        };
        break;
      }

      case "createEmail": {
        const { email, password } = body;
        if (!domain || !email || !password) {
          throw new Error("Domain, email, and password are required");
        }

        const response = await cyberPanelRequest(API_ENDPOINTS.submitEmailCreation, {
          domainName: domain,
          userName: email,
          password,
        });
        
        result = {
          success: response.status === 1 || response.fetchStatus === "success",
          message: response.error_message || "Email created successfully",
        };
        break;
      }

      case "deleteEmail": {
        const { email } = body;
        if (!email) throw new Error("Email is required");

        const response = await cyberPanelRequest(API_ENDPOINTS.deleteEmail, {
          email,
        });
        
        result = {
          success: response.status === 1 || response.fetchStatus === "success",
          message: response.error_message || "Email deleted successfully",
        };
        break;
      }

      // ============= DATABASES =============
      case "listDatabases": {
        if (!domain) throw new Error("Domain is required");

        const response = await cyberPanelRequest(API_ENDPOINTS.fetchDatabases, {
          databaseWebsite: domain,
        });
        
        result = {
          databases: response.databases || response.data || [],
        };
        break;
      }

      case "createDatabase": {
        const { dbName, dbUser, dbPassword } = body;
        if (!domain || !dbName || !dbUser || !dbPassword) {
          throw new Error("Domain, dbName, dbUser, and dbPassword are required");
        }

        const response = await cyberPanelRequest(API_ENDPOINTS.submitDBCreation, {
          databaseWebsite: domain,
          dbName,
          dbUsername: dbUser,
          dbPassword,
        });
        
        result = {
          success: response.status === 1 || response.fetchStatus === "success",
          message: response.error_message || "Database created successfully",
        };
        break;
      }

      case "deleteDatabase": {
        const { dbName } = body;
        if (!dbName) throw new Error("Database name is required");

        const response = await cyberPanelRequest(API_ENDPOINTS.submitDatabaseDeletion, {
          dbName,
        });
        
        result = {
          success: response.status === 1 || response.fetchStatus === "success",
          message: response.error_message || "Database deleted successfully",
        };
        break;
      }

      // ============= SSL CERTIFICATES =============
      case "sslStatus": {
        if (!domain) throw new Error("Domain is required");

        // CyberPanel doesn't have a dedicated SSL status endpoint
        // We can try to obtain/renew which will tell us the status
        try {
          const response = await cyberPanelRequest(API_ENDPOINTS.obtainSSLForADomain, {
            domainName: domain,
          });
          
          result = {
            issued: response.status === 1 || response.fetchStatus === "success",
            expiry: response.sslExpiry || null,
          };
        } catch {
          result = {
            issued: false,
            expiry: null,
          };
        }
        break;
      }

      case "issueSSL": {
        if (!domain) throw new Error("Domain is required");

        const response = await cyberPanelRequest(API_ENDPOINTS.obtainSSLForADomain, {
          domainName: domain,
        });
        
        result = {
          success: response.status === 1 || response.fetchStatus === "success",
          message: response.error_message || "SSL certificate issued successfully",
        };
        break;
      }

      // ============= BACKUPS =============
      case "listBackups": {
        if (!domain) throw new Error("Domain is required");

        const response = await cyberPanelRequest(API_ENDPOINTS.getBackupsForDomain, {
          websiteName: domain,
        });
        
        result = {
          backups: response.backups || response.data || [],
        };
        break;
      }

      case "createBackup": {
        if (!domain) throw new Error("Domain is required");

        const response = await cyberPanelRequest(API_ENDPOINTS.submitBackupCreation, {
          websiteName: domain,
        });
        
        result = {
          success: response.status === 1 || response.fetchStatus === "success",
          message: response.error_message || "Backup started successfully",
        };
        break;
      }

      case "restoreBackup": {
        const { backupName } = body;
        if (!domain || !backupName) {
          throw new Error("Domain and backup name are required");
        }

        const response = await cyberPanelRequest(API_ENDPOINTS.submitRestore, {
          websiteName: domain,
          backupName,
        });
        
        result = {
          success: response.status === 1 || response.fetchStatus === "success",
          message: response.error_message || "Restore started successfully",
        };
        break;
      }

      // ============= DNS RECORDS =============
      case "listDNS": {
        if (!domain) throw new Error("Domain is required");

        const response = await cyberPanelRequest(API_ENDPOINTS.getCurrentRecordsForDomain, {
          domainName: domain,
        });
        
        result = {
          records: response.records || response.data || [],
        };
        break;
      }

      case "addDNS": {
        const { recordName, recordType, recordValue, ttl, priority } = body;
        if (!domain || !recordName || !recordType || !recordValue) {
          throw new Error("Domain, recordName, recordType, and recordValue are required");
        }

        const response = await cyberPanelRequest(API_ENDPOINTS.addDNSRecord, {
          domainName: domain,
          name: recordName,
          type: recordType,
          value: recordValue,
          ttl: ttl || 14400,
          priority: priority || 0,
        });
        
        result = {
          success: response.status === 1 || response.fetchStatus === "success",
          message: response.error_message || "DNS record added successfully",
        };
        break;
      }

      case "deleteDNS": {
        const { recordId } = body;
        if (!domain || !recordId) {
          throw new Error("Domain and recordId are required");
        }

        const response = await cyberPanelRequest(API_ENDPOINTS.deleteDNSRecord, {
          domainName: domain,
          id: recordId,
        });
        
        result = {
          success: response.status === 1 || response.fetchStatus === "success",
          message: response.error_message || "DNS record deleted successfully",
        };
        break;
      }

      // ============= FTP ACCOUNTS =============
      case "listFTP": {
        if (!domain) throw new Error("Domain is required");

        const response = await cyberPanelRequest(API_ENDPOINTS.getAllFTPAccounts, {
          domainName: domain,
        });
        
        result = {
          ftpAccounts: response.data || [],
        };
        break;
      }

      case "createFTP": {
        const { ftpUser, ftpPassword, path } = body;
        if (!domain || !ftpUser || !ftpPassword) {
          throw new Error("Domain, ftpUser, and ftpPassword are required");
        }

        const response = await cyberPanelRequest(API_ENDPOINTS.submitFTPCreation, {
          domainName: domain,
          userName: ftpUser,
          password: ftpPassword,
          path: path || `/home/${domain}/public_html`,
        });
        
        result = {
          success: response.status === 1 || response.fetchStatus === "success",
          message: response.error_message || "FTP account created successfully",
        };
        break;
      }

      // ============= PHP VERSION =============
      case "getPHP": {
        if (!domain) throw new Error("Domain is required");

        const response = await cyberPanelRequest(API_ENDPOINTS.getCurrentPHP, {
          domainName: domain,
        });
        
        result = {
          phpVersion: response.currentPHP || response.data || "Unknown",
        };
        break;
      }

      case "changePHP": {
        const { phpVersion } = body;
        if (!domain || !phpVersion) {
          throw new Error("Domain and phpVersion are required");
        }

        const response = await cyberPanelRequest(API_ENDPOINTS.changePHP, {
          domainName: domain,
          phpVersion,
        });
        
        result = {
          success: response.status === 1 || response.fetchStatus === "success",
          message: response.error_message || "PHP version changed successfully",
        };
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("CyberPanel stats error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
