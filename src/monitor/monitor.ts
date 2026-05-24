import { EventEmitter } from 'events';
import { DiscordAPI } from '../api/discord';
import { Cache } from '../utils/cache';
import { Logger } from '../utils/logger';

export class VanityMonitor extends EventEmitter {
  private api: DiscordAPI;
  private checkInterval: number;
  private cache: Cache;
  private logger: Logger;
  private isMonitoring: boolean = false;
  private monitorInterval: NodeJS.Timeout | null = null;
  private checkCount: number = 0;

  constructor(api: DiscordAPI, checkInterval: number, cache: Cache) {
    super();
    this.api = api;
    this.checkInterval = checkInterval;
    this.cache = cache;
    this.logger = new Logger('VanityMonitor');
  }

  start(vanities: string[]): void {
    if (this.isMonitoring) {
      this.logger.warn('Monitor already running');
      return;
    }

    this.isMonitoring = true;
    this.logger.info(`Starting to monitor ${vanities.length} vanities at ${this.checkInterval}ms intervals`);

    // Initial check
    this.checkVanities(vanities);

    // Periodic checks
    this.monitorInterval = setInterval(() => {
      this.checkVanities(vanities);
    }, this.checkInterval);
  }

  private async checkVanities(vanities: string[]): Promise<void> {
    this.checkCount++;
    const promises = vanities.map((vanity) => this.checkSingleVanity(vanity));
    
    try {
      await Promise.all(promises);
    } catch (error) {
      this.emit('error', error);
    }
  }

  private async checkSingleVanity(vanity: string): Promise<void> {
    try {
      const exists = await this.api.checkVanity(vanity);
      
      if (!exists) {
        this.logger.info(`[ALERT] 🔥 ${vanity} is AVAILABLE!`);
        this.emit('available', vanity);
      }
    } catch (error) {
      this.logger.error(`Error checking ${vanity}:`, error);
    }
  }

  stop(): void {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
    }
    this.isMonitoring = false;
    this.logger.info(`Monitor stopped after ${this.checkCount} check cycles`);
  }

  getCheckCount(): number {
    return this.checkCount;
  }
}
