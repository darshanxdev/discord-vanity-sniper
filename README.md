# Discord Vanity Sniper ⚡

A superfast, lightning-speed Discord vanity URL sniper built for maximum performance and reliability.

## Features

- ⚡ **Lightning-Fast**: Optimized async architecture with sub-100ms check intervals
- 🎯 **Accurate Sniping**: Real-time monitoring with intelligent caching
- 🔐 **Secure**: Token-based authentication with rate-limit handling
- 📊 **Smart Caching**: Efficient vanity URL monitoring and prediction
- 🚀 **Scalable**: Parallel request processing for maximum throughput
- 📱 **Real-time Notifications**: Instant alerts when targets become available

## Installation

```bash
git clone https://github.com/darshanxdev/discord-vanity-sniper.git
cd discord-vanity-sniper
npm install
```

## Configuration

1. Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

2. Edit `.env` and add your:
   - Discord token
   - Target vanities (comma-separated)
   - Check interval (default: 100ms)

## Usage

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## Performance Specs

- **Check Interval**: 100ms (highly configurable)
- **Latency**: <50ms average response time
- **Concurrency**: Unlimited parallel vanity checks
- **Memory**: Optimized with intelligent caching
- **Retry Logic**: Exponential backoff with configurable max attempts

## Architecture

```
├── src/
│   ├── core/          # Core sniping engine
│   ├── api/           # Discord API wrapper with rate-limiting
│   ├── monitor/       # Real-time vanity monitoring
│   └── utils/         # Logger, cache, helpers
├── config/            # Configuration files
└── dist/              # Compiled output
```

## How It Works

1. **Validation**: Validates your Discord token on startup
2. **Monitoring**: Continuously checks target vanities at configured intervals
3. **Detection**: Instantly detects when a vanity becomes available
4. **Claiming**: Automatically attempts to claim the vanity with retry logic
5. **Notification**: Logs success/failure for each snipe attempt

## Advanced Configuration

```env
# Ultra-fast mode (50ms checks)
CHECK_INTERVAL=50

# Normal mode (100ms checks) - Recommended
CHECK_INTERVAL=100

# Conservative mode (500ms checks) - Easier on rate limits
CHECK_INTERVAL=500
```

## ⚠️ Legal Notice

This tool is for educational purposes. Ensure you comply with:
- Discord's Terms of Service
- Local laws and regulations
- Rate limiting and API usage policies

## License

MIT
