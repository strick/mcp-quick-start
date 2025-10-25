// src/auth/snClientCredentials.ts
import axios from "axios";
import qs from "qs";

type TokenBundle = {
  accessToken: string;
  expiresAt: number; // epoch seconds
};

export class SNOAuthClientCredentials {
  private token?: TokenBundle;

  constructor(
    private instance: string,
    private clientId: string,
    private clientSecret: string,
    private scope?: string
  ) {}

  private async fetchToken(): Promise<TokenBundle> {
    // allow either an instance hostname (example.service-now.com) or a full URL
    const normalizedInstance = this.instance.startsWith("http")
      ? this.instance.replace(/\/$/, "")
      : `https://${this.instance}`;

    const url = `${normalizedInstance}/oauth_token.do`;

    const body: Record<string, string> = {
      grant_type: "client_credentials",
      client_id: this.clientId,
      client_secret: this.clientSecret,
    };
    if (this.scope) body.scope = this.scope;

    const { data } = await axios.post(
      url,
      qs.stringify(body),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    // ServiceNow returns { access_token, token_type, expires_in }
    const now = Math.floor(Date.now() / 1000);
    const ttl = typeof data.expires_in === "number" ? data.expires_in : 3000;

    return {
      accessToken: data.access_token,
      // subtract a small safety window
      expiresAt: now + Math.max(60, ttl - 30),
    };
  }

  async getAccessToken(): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    if (!this.token || now >= this.token.expiresAt) {
      this.token = await this.fetchToken();
    }
    return this.token.accessToken;
  }
}
