// src/clients/servicenow.ts
import axios, { type AxiosInstance } from "axios";
import { SNOAuthClientCredentials } from "../auth/snClientCredentials.js";

export class ServiceNowClient {
  private http: AxiosInstance;

  constructor(
    private instance: string,
    private oauth: SNOAuthClientCredentials
  ) {
    const normalizedInstance = instance.startsWith("http")
      ? instance.replace(/\/$/, "")
      : `https://${instance}`;

    this.http = axios.create({
      baseURL: normalizedInstance,
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      timeout: 30000,
    });


(async () => {
  try {
    const t = await oauth.getAccessToken();
    console.log('[OAuth] Token acquired OK:', t.slice(0, 12) + '…');
  } catch (e: any) {
    console.error('[OAuth] Failed to acquire token:', e?.response?.status, e?.response?.data || e?.message);
  }
})();


    // Inject bearer token on each request
    this.http.interceptors.request.use(async (config) => {
      const token = await this.oauth.getAccessToken();
      config.headers = config.headers ?? {};
      (config.headers as any).Authorization = `Bearer ${token}`;
      return config;
    });
  }

  // Example: Search KB
  async searchKb(query: string) {
    const resp = await this.http.get(`/api/now/table/kb_knowledge`, {
      params: { sysparm_query: `active=true^short_descriptionLIKE${query}`, sysparm_limit: 5 },
    });
    return resp.data;
  }

  // Example: Create Incident
  async createIncident(payload: Record<string, any>) {
    const resp = await this.http.post(`/api/now/table/incident`, payload);
    return resp.data;
  }
}
