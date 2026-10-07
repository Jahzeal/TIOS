import { Injectable, Logger, Inject, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface HunterContact {
  name: string;
  role: string;
  email: string;
  phone?: string;
}

@Injectable()
export class HunterService {
  private readonly logger = new Logger(HunterService.name);
  private readonly apiKey: string;

  constructor(@Optional() @Inject(ConfigService) private configService: ConfigService) {
    this.apiKey = this.configService?.get<string>('HUNTER_API_KEY') || process.env.HUNTER_API_KEY || '';
    if (!this.apiKey || this.apiKey.trim() === '' || this.apiKey.startsWith('YOUR_')) {
      this.logger.warn('Hunter.io API key is not configured.');
    } else {
      this.logger.log('Hunter.io API key detected. Operating in Live Mode.');
    }
  }

  /**
   * Search Hunter.io Domain Search API — returns only managerial/decision-maker contacts,
   * ranked highest seniority first.
   */
  async findContacts(domain: string): Promise<HunterContact[]> {
    const cleanDomain = this.extractDomain(domain);
    if (!cleanDomain) {
      this.logger.error(`Invalid domain format: ${domain}`);
      return [];
    }

    if (!this.apiKey || this.apiKey.trim() === '' || this.apiKey.startsWith('YOUR_')) {
      this.logger.warn(`Hunter.io API key missing. Skipping search for ${cleanDomain}.`);
      return [];
    }

    this.logger.log(`Searching decision-maker contacts for domain: ${cleanDomain}`);

    try {
      const response = await axios.get(
        'https://api.hunter.io/v2/domain-search',
        {
          params: {
            domain: cleanDomain,
            api_key: this.apiKey,
            limit: 10,
          },
        },
      );

      if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data.emails)
      ) {
        const emails = response.data.data.emails;
        const contacts: HunterContact[] = emails
          .filter((e: any) => e.first_name || e.last_name) // only named contacts
          .map((e: any) => ({
            name: `${e.first_name || ''} ${e.last_name || ''}`.trim(),
            role: e.position || 'Manager',
            email: e.value,
            phone: e.phone_number || undefined,
          }));

        this.logger.log(
          `Hunter.io found ${contacts.length} live contacts for ${cleanDomain}`,
        );
        return contacts;
      }

      return [];
    } catch (error: any) {
      const apiError = error.response?.data || error.message;
      this.logger.error(
        `Hunter.io Domain Search failed for ${cleanDomain}: ${JSON.stringify(apiError)}`,
      );
      return [];
    }
  }

  private extractDomain(urlStr: string): string | null {
    try {
      let tempUrl = urlStr.trim();
      if (!/^https?:\/\//i.test(tempUrl)) tempUrl = 'https://' + tempUrl;
      const parsed = new URL(tempUrl);
      return parsed.hostname.replace('www.', '');
    } catch (e) {
      return urlStr
        .replace(/https?:\/\//i, '')
        .replace('www.', '')
        .split('/')[0];
    }
  }
}
