export class Logger {
  private context: string;
  private isDev: boolean = process.env.NODE_ENV !== 'production';

  constructor(context: string) {
    this.context = context;
  }

  private getTimestamp(): string {
    return new Date().toISOString().split('T')[1].split('.')[0];
  }

  info(message: string, data?: any): void {
    console.log(`[${this.getTimestamp()}] [${this.context}] ℹ️  ${message}`, data || '');
  }

  warn(message: string, data?: any): void {
    console.warn(`[${this.getTimestamp()}] [${this.context}] ⚠️  ${message}`, data || '');
  }

  error(message: string, error?: any): void {
    console.error(`[${this.getTimestamp()}] [${this.context}] ❌ ${message}`, error || '');
  }

  debug(message: string, data?: any): void {
    if (this.isDev) {
      console.debug(`[${this.getTimestamp()}] [${this.context}] 🐛 ${message}`, data || '');
    }
  }
}
