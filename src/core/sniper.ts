import { EventEmitter } from 'events';
import { DiscordAPI } from '../api/discord';
import { VanityMonitor } from '../monitor/monitor';
import { Cache } from '../utils/cache';
import { Logger } from '../utils/logger';

export interface SniperConfig {
  token: string;
  vanities: string[];
  checkInterval: number;
  maxRetries: number;
}

export class VanitySniper extends EventEmitter {
  private config: SniperConfig;
  private api: DiscordAPI;
  private monitor: VanityMonitor;
  private cache: Cache;
  private logger: Logger;
  private isRunning: boolean = false;
  private snipedVanities: Set<string> = new Set();

  constructor(config: SniperConfig) {
    super();
    this.config = config;
    this.logger = new Logger('VanitySniper');
    this.api = new DiscordAPI(config.token);
    this.cache = new Cache();
    this.monitor = new VanityMonitor(this.api, config.checkInterval, this.cache);
  }

  async initialize(): Promise<void> {
    try {
      // Validate token
      await this.api.validateToken();
      this.logger.info('✓ Token validated');

      // Load vanities into cache
      for (const vanity of this.config.vanities) {
        if (!vanity) continue;
        this.cache.set(`vanity:${vanity}`, {
          name: vanity,
          lastChecked: null,
          attempts: 0,
        });
      }

      // Start monitoring
      this.isRunning = true;
      this.monitor.start(this.config.vanities.filter(v => v));

      // Listen to snipe events
      this.monitor.on('available', (vanity: string) => {
        this.handleVanityAvailable(vanity);
      });

      this.monitor.on('error', (error: Error) => {
        this.logger.error('Monitor error:', error);
      });
    } catch (error) {
      this.logger.error('Initialization failed:', error);
      throw error;
    }
  }

  private async handleVanityAvailable(vanity: string): Promise<void> {
    if (this.snipedVanities.has(vanity)) {
      return; // Already sniped
    }

    this.logger.info(`🎯 Vanity available: ${vanity}`);
    
    for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
      try {
        const success = await this.api.claimVanity(vanity);
        if (success) {
          this.snipedVanities.add(vanity);
          this.logger.info(`✅ Successfully sniped: ${vanity}`);
          this.emit('sniped', { vanity, timestamp: Date.now() });
          return;
        }
      } catch (error) {
        this.logger.warn(`Attempt ${attempt + 1} failed for ${vanity}:`, error);
        // Exponential backoff: 10ms, 20ms, 40ms, etc.
        await this.sleep(Math.pow(2, attempt) * 10);
      }
    }
    
    this.logger.warn(`❌ Failed to snipe ${vanity} after ${this.config.maxRetries} attempts`);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    this.monitor.stop();
    this.logger.info('Sniper stopped');
  }

  getVanityCount(): number {
    return this.config.vanities.filter(v => v).length;
  }

  getCheckInterval(): number {
    return this.config.checkInterval;
  }

  isActive(): boolean {
    return this.isRunning;
  }

  getSnipedVanities(): string[] {
    return Array.from(this.snipedVanities);
  }
}
