# SlotBot

SlotBot is a Discord bot designed to manage seller slots in a marketplace server. It helps you create, manage, and monitor time-limited channels for sellers with customizable ping permissions and automatic expiration.

## Features

- 🔄 Create time-limited seller slots with customizable durations
- 🔔 Manage ping permissions (@here, @everyone) with usage limits
- 🔑 Secure restore codes for slot recovery
- 📊 Automatic tracking of slot expiration
- 🛡️ Permission management for seller channels
- 📝 Automated logging of bot actions

## Table of Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Command Usage](#command-usage)
- [Self-Hosting](#self-hosting)
- [Cloud Hosting](#cloud-hosting)
- [Contributing](#contributing)
- [License](#license)
- [Developer Information](#developer-information)

## Requirements

- Node.js v16.9.0 or higher
- Discord.js v14
- A Discord bot token
- Discord server with proper permissions set up

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/slotbot.git
   cd slotbot
   ```

2. Install dependencies:
   ```bash
   npm install
   # or with pnpm (recommended)
   pnpm install
   ```

3. Configure your bot (see [Configuration](#configuration) section).

4. Build the TypeScript files:
   ```bash
   npm run build
   # or with pnpm
   pnpm run build
   ```

5. Start the bot:
   ```bash
   npm start
   # or with pnpm
   pnpm start
   ```

## Configuration

All bot configuration is stored in the `config.json` file. Here's a breakdown of what each setting means:

### Bot Configuration

```json
{
  "bot": {
    "token": "YOUR_BOT_TOKEN_HERE",
    "prefix": "!",
    "owners": ["YOUR_DISCORD_USER_ID"]
  }
}
```

- `token`: Your Discord bot token (get it from [Discord Developer Portal](https://discord.com/developers/applications))
- `prefix`: Command prefix for the bot (default: `!`)
- `owners`: Array of Discord user IDs who have full access to admin commands

### Slot Configuration

```json
{
  "slot": {
    "categories": {
      "1": "CATEGORY_ID_1",
      "2": "CATEGORY_ID_2",
      "3": "CATEGORY_ID_3"
    },
    "sellerRole": "SELLER_ROLE_ID",
    "logChannel": "LOG_CHANNEL_ID",
    "embedColor": "#3498db",
    "footerText": "SlotBot by DevAnik",
    "templates": {
      "daily": {
        "duration": 1,
        "pings": {
          "here": 1,
          "everyone": 0
        }
      },
      "weekly": {
        "duration": 7,
        "pings": {
          "here": 2,
          "everyone": 1
        }
      },
      "monthly": {
        "duration": 30,
        "pings": {
          "here": 3,
          "everyone": 1
        }
      },
      "lifetime": {
        "duration": -1,
        "pings": {
          "here": 4,
          "everyone": 3
        }
      }
    }
  }
}
```

- `categories`: Discord category IDs where slot channels will be created (numbered for easy reference)
- `sellerRole`: Role ID that will be assigned to sellers
- `logChannel`: Channel ID where bot actions will be logged
- `embedColor`: Color for bot embeds (hex code)
- `footerText`: Text shown in the footer of embeds
- `templates`: Predefined slot types with their settings:
  - `duration`: Number of days before slot expiration (-1 for lifetime)
  - `pings`: Allowed number of @here and @everyone pings per slot

## Command Usage

All commands use the prefix defined in your `config.json` (default: `!`).

### Admin Commands

| Command | Description | Usage |
|---------|-------------|-------|
| `create-slot` | Creates a new slot for a user | `!create-slot @user <category> <type>` |
| `autoconfig` | Automatically configures the server | `!autoconfig` |
| `help` | Shows all available commands | `!help [command]` |

#### Command Details:

- **create-slot** (aliases: `create`, `new-slot`, `cs`)
  - Creates a new slot channel for a user
  - `@user`: Mention the user who will own the slot
  - `category`: Category number (1, 2, 3, etc.) from your config
  - `type`: Slot type (daily, weekly, monthly, lifetime)
  - Example: `!create-slot @DevAnik 1 weekly`

- **autoconfig**
  - Automatically sets up your server with the necessary channels and roles
  - Requires admin permissions
  - Example: `!autoconfig`

- **help**
  - Shows a list of all commands or details about a specific command
  - Example: `!help create-slot`

### Slot Owner Commands

These commands are available to users within their own slots:

- Slot owners can use @here and @everyone mentions based on their slot's allowance
- The bot automatically tracks and limits ping usage
- Messages sent in slot channels by the owner are monitored

## Self-Hosting

### Requirements for Self-Hosting

1. A computer or VPS with Node.js installed
2. Reliable internet connection
3. A Discord bot token

### Setting Up on Linux/macOS

1. Install Node.js and npm/pnpm
2. Clone the repository
3. Install dependencies with `pnpm install` or `npm install`
4. Edit the `config.json` file with your bot token and server details
5. Start with `pnpm start` or `npm start`
6. Consider using PM2 for keeping the bot running:
   ```bash
   npm install -g pm2
   pm2 start src/index.js --name slotbot
   pm2 save
   pm2 startup
   ```

### Setting Up on Windows

1. Install Node.js from the official website
2. Follow the same steps as Linux/macOS
3. For keeping the bot running, you can use PM2 or create a Windows service

## Cloud Hosting

### Hosting on Railway

1. Fork this repository to your GitHub account
2. Create a Railway account and connect it with GitHub
3. Create a new project in Railway and select the forked repository
4. Add the `config.json` as an environment variable (convert to JSON string) or deploy it with your code
5. Deploy the project

### Hosting on Heroku

1. Create a Heroku account and install the Heroku CLI
2. Clone this repository
3. Create a new Heroku app: `heroku create your-app-name`
4. Add configuration details: `heroku config:set BOT_TOKEN=your_token` etc.
5. Deploy to Heroku: `git push heroku main`

### Hosting on Replit

1. Create a Replit account
2. Create a new Repl, importing from GitHub
3. Install dependencies with `npm install`
4. Configure the bot using the Replit secrets for storing sensitive data
5. Run the bot and set up Replit's "Always On" feature

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Developer Information

### About the Developer

- **Developer:** Asbron (Anik Hossin)
- **Website:** [https://anikhossin.info](https://anikhossin.info)

### Contact

- **Discord:** [@dev_anik](https://discord.com/users/dev_anik)
- **Telegram:** [@dev_anik](https://t.me/dev_anik)

### Support Development

If you'd like to support the development of this project, you can:

- **Buy me a coffee:** Send Litecoin to `LVGVZpyTUxaPXf7z71U3aF7ocBWXLHG9gG`
- **Hire me:** For more advanced custom projects, please contact me through Discord or Telegram.

---

Made with ❤️ by DevAnik