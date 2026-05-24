import axios, { AxiosInstance } from 'axios';
import { Logger } from '../utils/logger';

const DISCORD_API_BASE = 'https://discord.com/api/v10';
const MAX_RETRIES = 3;
const RETRY_DELAY = 50; // 50ms minimum between requests

export class DiscordAPI {
  private client: AxiosInstance;
  private token: string;
  private logger: Logger;
  private requestCount: number = 0;
  private lastRequestTime: number = 0;
  private rateLimitReset: number = 0;

  constructor(token: string) {
    this.token = token;
    this.logger = new Logger('DiscordAPI');
    
    this.client = axios.create({
      baseURL: DISCORD_API_BASE,
      headers: {
        'Authorization': token,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Content-Type': 'application/json',
      },
      timeout: 5000,
    });
  }

  async validateToken(): Promise<boolean> {
    try {
      const response = await this.client.get('/users/@me');
      const user = response.data;
      this.logger.info(`Token belongs to: ${user.username}#${user.discriminator || '0'}`);
      return true;
    } catch (error) {
      this.logger.error('Token validation failed - invalid or expired token');
      throw error;
    }
  }

  async checkVanity(vanity: string): Promise<boolean> {
    try {
      // Respect rate limits
      await this.waitForRateLimit();

      const response = await this.client.get(`/users/${vanity}`, {
        validateStatus: () => true,
      });
      
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  async claimVanity(vanity: string, guildId: string = '@me'): Promise<boolean> {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        // Wait for rate limit window
        await this.waitForRateLimit();

        const response = await this.client.patch(
          `/guilds/${guildId}`,
          { vanity_url_code: vanity },
          { validateStatus: () => true }
        );

        // Update rate limit info
        if (response.headers['x-ratelimit-reset-after']) {
          const resetAfter = parseFloat(response.headers['x-ratelimit-reset-after']) * 1000;
          this.rateLimitReset = Date.now() + resetAfter;
        }

        if (response.status === 200) {
          return true;
        }
        
        if (response.status === 429) {
          const retryAfter = (response.data.retry_after || 1) * 1000;
          this.logger.warn(`Rate limited, waiting ${retryAfter}ms`);
          this.rateLimitReset = Date.now() + retryAfter;
          await this.sleep(retryAfter);
          continue;
        }

        if (response.status === 404) {
          // Vanity not available or doesn't exist
          return false;
        }
      } catch (error) {
        this.logger.error(`Claim attempt ${attempt + 1} failed:`, error);
      }
      
      if (attempt < MAX_RETRIES - 1) {
        // Exponential backoff
        await this.sleep(RETRY_DELAY * Math.pow(2, attempt));
      }
    }
    
    return false;
  }

  private async waitForRateLimit(): Promise<void> {
    const now = Date.now();
    const waitTime = this.rateLimitReset - now;
    
    if (waitTime > 0) {
      this.logger.warn(`Waiting ${waitTime}ms for rate limit reset`);
      await this.sleep(waitTime + 100); // Add 100ms buffer
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
