import { supabase } from "@/integrations/supabase/client";

// ============= TYPES =============

export interface ServerStats {
  cpu: number;
  memory: number;
  disk: number;
}

export interface WebsiteStats {
  domain: string;
  diskUsed: number;
  bandwidthUsed: number;
  error: string | null;
}

export interface CyberPanelStats {
  server: ServerStats;
  websites: WebsiteStats[];
}

export interface EmailAccount {
  email: string;
  diskUsed: string;
}

export interface Database {
  name: string;
  size: string;
}

export interface Backup {
  name: string;
  date: string;
  size: string;
}

export interface Website {
  domain: string;
  adminEmail: string;
  ipAddress: string;
  admin: string;
  package: string;
  state: string;
  diskUsed: string;
}

export interface DNSRecord {
  id: number;
  name: string;
  type: string;
  content: string;
  ttl: number;
  priority?: number;
}

export interface SSLStatus {
  issued: boolean;
  expiry: string | null;
}

export interface FTPAccount {
  username: string;
  path: string;
}

// ============= HELPER =============

async function invokeEdgeFunction<T>(
  action: string,
  params: Record<string, unknown> = {}
): Promise<T | null> {
  try {
    const { data, error } = await supabase.functions.invoke("cyberpanel-stats", {
      body: { action, ...params },
    });

    if (error) {
      console.error(`CyberPanel ${action} error:`, error);
      return null;
    }

    if (!data?.success) {
      console.error(`CyberPanel ${action} failed:`, data?.error);
      return null;
    }

    return data.data as T;
  } catch (err) {
    console.error(`Failed to invoke ${action}:`, err);
    return null;
  }
}

// ============= SERVER STATS =============

export async function fetchCyberPanelStats(domains: string[]): Promise<CyberPanelStats | null> {
  return invokeEdgeFunction<CyberPanelStats>("allWebsitesStats", { domains });
}

export async function fetchServerStatus(): Promise<ServerStats | null> {
  return invokeEdgeFunction<ServerStats>("serverStatus");
}

export async function fetchWebsiteStats(domain: string): Promise<WebsiteStats | null> {
  return invokeEdgeFunction<WebsiteStats>("websiteStats", { domain });
}

export async function listWebsites(): Promise<{ websites: Website[] } | null> {
  return invokeEdgeFunction<{ websites: Website[] }>("listWebsites");
}

// ============= EMAIL ACCOUNTS =============

export async function listEmails(domain: string): Promise<{ emails: EmailAccount[] } | null> {
  return invokeEdgeFunction<{ emails: EmailAccount[] }>("listEmails", { domain });
}

export async function createEmail(
  domain: string,
  email: string,
  password: string
): Promise<{ success: boolean; message: string } | null> {
  return invokeEdgeFunction<{ success: boolean; message: string }>("createEmail", {
    domain,
    email,
    password,
  });
}

export async function deleteEmail(
  email: string
): Promise<{ success: boolean; message: string } | null> {
  return invokeEdgeFunction<{ success: boolean; message: string }>("deleteEmail", { email });
}

// ============= DATABASES =============

export async function listDatabases(domain: string): Promise<{ databases: Database[] } | null> {
  return invokeEdgeFunction<{ databases: Database[] }>("listDatabases", { domain });
}

export async function createDatabase(
  domain: string,
  dbName: string,
  dbUser: string,
  dbPassword: string
): Promise<{ success: boolean; message: string } | null> {
  return invokeEdgeFunction<{ success: boolean; message: string }>("createDatabase", {
    domain,
    dbName,
    dbUser,
    dbPassword,
  });
}

export async function deleteDatabase(
  dbName: string
): Promise<{ success: boolean; message: string } | null> {
  return invokeEdgeFunction<{ success: boolean; message: string }>("deleteDatabase", { dbName });
}

// ============= SSL CERTIFICATES =============

export async function getSSLStatus(domain: string): Promise<SSLStatus | null> {
  return invokeEdgeFunction<SSLStatus>("sslStatus", { domain });
}

export async function issueSSL(
  domain: string
): Promise<{ success: boolean; message: string } | null> {
  return invokeEdgeFunction<{ success: boolean; message: string }>("issueSSL", { domain });
}

// ============= BACKUPS =============

export async function listBackups(domain: string): Promise<{ backups: Backup[] } | null> {
  return invokeEdgeFunction<{ backups: Backup[] }>("listBackups", { domain });
}

export async function createBackup(
  domain: string
): Promise<{ success: boolean; message: string } | null> {
  return invokeEdgeFunction<{ success: boolean; message: string }>("createBackup", { domain });
}

export async function restoreBackup(
  domain: string,
  backupName: string
): Promise<{ success: boolean; message: string } | null> {
  return invokeEdgeFunction<{ success: boolean; message: string }>("restoreBackup", {
    domain,
    backupName,
  });
}

// ============= DNS RECORDS =============

export async function listDNS(domain: string): Promise<{ records: DNSRecord[] } | null> {
  return invokeEdgeFunction<{ records: DNSRecord[] }>("listDNS", { domain });
}

export async function addDNS(
  domain: string,
  recordName: string,
  recordType: string,
  recordValue: string,
  ttl?: number,
  priority?: number
): Promise<{ success: boolean; message: string } | null> {
  return invokeEdgeFunction<{ success: boolean; message: string }>("addDNS", {
    domain,
    recordName,
    recordType,
    recordValue,
    ttl,
    priority,
  });
}

export async function deleteDNS(
  domain: string,
  recordId: number
): Promise<{ success: boolean; message: string } | null> {
  return invokeEdgeFunction<{ success: boolean; message: string }>("deleteDNS", {
    domain,
    recordId,
  });
}

// ============= FTP ACCOUNTS =============

export async function listFTP(domain: string): Promise<{ ftpAccounts: FTPAccount[] } | null> {
  return invokeEdgeFunction<{ ftpAccounts: FTPAccount[] }>("listFTP", { domain });
}

export async function createFTP(
  domain: string,
  ftpUser: string,
  ftpPassword: string,
  path?: string
): Promise<{ success: boolean; message: string } | null> {
  return invokeEdgeFunction<{ success: boolean; message: string }>("createFTP", {
    domain,
    ftpUser,
    ftpPassword,
    path,
  });
}

// ============= PHP VERSION =============

export async function getPHPVersion(domain: string): Promise<{ phpVersion: string } | null> {
  return invokeEdgeFunction<{ phpVersion: string }>("getPHP", { domain });
}

export async function changePHPVersion(
  domain: string,
  phpVersion: string
): Promise<{ success: boolean; message: string } | null> {
  return invokeEdgeFunction<{ success: boolean; message: string }>("changePHP", {
    domain,
    phpVersion,
  });
}
