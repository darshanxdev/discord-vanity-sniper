import dotenv from 'dotenv';
import { VanitySniper } from './core/sniper';
import { Logger } from './utils/logger';

dotenv.config();

const logger = new Logger('Main');

async function bootstrap() {
  try {
    logger.info('🚀 Starting Discord Vanity Sniper...');
    
    const sniper = new VanitySniper({
      token: process.env.DISCORD_TOKEN || '',
      vanities: (process.env.TARGET_VANITIES || '').split(',').map(v => v.trim()),
      checkInterval: parseInt(process.env.CHECK_INTERVAL || '100', 10),
      maxRetries: parseInt(process.env.MAX_RETRIES || '5', 10),
    });
    
    await sniper.initialize();
    logger.info('✅ Sniper initialized and ready');
    logger.info(`⚡ Monitoring ${sniper.getVanityCount()} vanities at ${sniper.getCheckInterval()}ms intervals`);
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      logger.info('\n🛑 Shutting down...');
      await sniper.stop();
      process.exit(0);
    });
    
  } catch (error) {
    logger.error('Failed to start sniper:', error);
    process.exit(1);
  }
}

bootstrap();
