# SlotBot

SlotBot is a Discord bot designed to manage seller slots in a marketplace server. It helps you create, manage, and monitor time-limited channels for sellers with customizable ping permissions and automatic expiration.

> **Note:** SlotBot is a spare-time project and bugs may be present. Please report any issues you encounter to help improve the bot. 

## Features

- 🔄 Create time-limited seller slots with customizable durations
- 🔔 Manage ping permissions (@here, @everyone) with usage limits and auto-reset
- 🔑 Secure restore codes for slot recovery
- 📊 Automatic tracking of slot expiration and cleanup
- 🛡️ Permission management for seller channels
- 📝 Automated logging of bot actions
- 🚨 Automatic revocation when ping limits are exceeded

## Table of Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Command Guide](#command-guide)
  - [Admin Commands](#admin-commands)
  - [Seller Commands](#seller-commands)
  - [Utility Commands](#utility-commands)
- [Slot Management System](#slot-management-system)
- [Ping System](#ping-system)
- [Troubleshooting](#troubleshooting)
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

All bot configuration is stored in the `config.json` file. Here's a detailed breakdown of what each setting means:

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
    "pingResetTime": {
      "timezone": "Asia/Dhaka",
      "time": "15:15"
    },
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

- `pingResetTime`: When ping counters are reset
  - `timezone`: The timezone to use for ping resets (e.g., "Asia/Dhaka", "America/New_York")
  - `time`: The time to reset pings in 24-hour format (HH:MM)
- `categories`: Discord category IDs where slot channels will be created (numbered for easy reference)
- `sellerRole`: Role ID that will be assigned to sellers
- `logChannel`: Channel ID where bot actions will be logged
- `embedColor`: Color for bot embeds (hex code)
- `footerText`: Text shown in the footer of embeds
- `templates`: Predefined slot types with their settings:
  - `duration`: Number of days before slot expiration (-1 for lifetime)
  - `pings`: Allowed number of @here and @everyone pings per slot

## Command Guide

All commands use the prefix defined in your `config.json` (default: `!`). Here is a comprehensive guide to all available commands organized by category.

### Admin Commands

Commands that can only be used by administrators with proper permissions.

| Command | Description | Usage | Aliases |
|---------|-------------|-------|---------|
| `create-slot` | Creates a new slot for a user | `!create-slot @user <category> <type>` | `create`, `new-slot`, `cs` |
| `delete` | Deletes a user's slot | `!delete @user` | `del` |
| `revoke` | Revokes a user's ability to send messages in their slot | `!revoke @user [reason]` | `rv` |
| `unrevoke` | Restores a previously revoked user's ability to send messages | `!unrevoke @user [reason]` | `urv` |
| `expand` | Extends the duration of a user's slot | `!expand @user <days>` | `ex` |
| `autoconfig` | Automatically configures the server | `!autoconfig` | `setup`, `configure` |

#### Command Details:

**Create Slot Command**
- **Usage**: `!create-slot @user <category> <type>`
- **Aliases**: `create`, `new-slot`, `cs`
- **Description**: Creates a new slot channel for a user
- **Parameters**:
  - `@user`: Mention the user who will own the slot
  - `category`: Category number (1, 2, 3, etc.) from your config
  - `type`: Slot type (daily, weekly, monthly, lifetime)
- **Example**: `!create-slot @DevAnik 1 weekly`
- **What it does**:
  - Creates a new text channel in the specified category
  - Names it after the user
  - Sets permissions so only the user can send messages
  - Assigns the seller role to the user
  - Sends a DM to the user with their restore code
  - Logs the action in the log channel

**Delete Command**
- **Usage**: `!delete @user`
- **Aliases**: `del`
- **Description**: Completely deletes a user's slot
- **Example**: `!delete @DevAnik`
- **What it does**:
  - Deletes the channel
  - Removes the seller role from the user
  - Removes the slot from the database
  - Logs the action

**Revoke Command**
- **Usage**: `!revoke @user [reason]`
- **Aliases**: `rv`
- **Description**: Revokes a user's ability to send messages in their slot without deleting it
- **Example**: `!revoke @DevAnik Violated server rules`
- **What it does**:
  - Updates permissions to prevent the user from sending messages
  - Changes the slot status to "revoked" in the database
  - Notifies the user with the reason
  - Logs the action

**Unrevoke Command**
- **Usage**: `!unrevoke @user [reason]`
- **Aliases**: `urv`
- **Description**: Restores a previously revoked user's ability to send messages
- **Example**: `!unrevoke @DevAnik Issue resolved`
- **What it does**:
  - Updates permissions to allow the user to send messages again
  - Changes the slot status back to "active"
  - Notifies the user with the reason
  - Logs the action

**Expand Command**
- **Usage**: `!expand @user <days>`
- **Aliases**: `ex`
- **Description**: Extends the duration of a user's slot by the specified number of days
- **Example**: `!expand @DevAnik 7`
- **What it does**:
  - Adds days to the slot's expiration date
  - Updates the slot in the database
  - Notifies the user of the extension
  - Logs the action

**Autoconfig Command**
- **Usage**: `!autoconfig`
- **Aliases**: `setup`, `configure`
- **Description**: Automatically sets up your server with the necessary channels and roles
- **Example**: `!autoconfig`
- **What it does**:
  - Creates the Seller role if it doesn't exist
  - Creates a log channel if it doesn't exist
  - Creates slot categories if they don't exist
  - Updates the config file with the new IDs
  - Requires a restart to apply changes

### Seller Commands

Commands that can be used by slot owners within their own slots.

| Command | Description | Usage | Aliases |
|---------|-------------|-------|---------|
| `myslot` | Shows information about your slot | `!myslot` | `p` |
| `nuke` | Deletes and recreates your slot channel | `!nuke` | None |

#### Command Details:

**MySlot Command**
- **Usage**: `!myslot`
- **Aliases**: `p`
- **Description**: Shows detailed information about your slot
- **Example**: `!myslot`
- **What it shows**:
  - Channel reference
  - Current status
  - Expiration date/time
  - Remaining ping allowances (@here and @everyone)

**Nuke Command**
- **Usage**: `!nuke`
- **Description**: Deletes and recreates your slot channel (useful for clearing chat history)
- **Example**: `!nuke`
- **What it does**:
  - Deletes the current channel
  - Creates a new channel with the same name and permissions
  - Updates the slot database with the new channel ID
  - Has a 2-hour cooldown to prevent abuse

### Utility Commands

General utility commands available to everyone.

| Command | Description | Usage | Aliases |
|---------|-------------|-------|---------|
| `help` | Shows available commands | `!help [command]` | `commands`, `h` |

#### Command Details:

**Help Command**
- **Usage**: `!help [command]`
- **Aliases**: `commands`, `h`
- **Description**: Shows all available commands or information about a specific command
- **Example**: `!help` or `!help create-slot`
- **What it shows**:
  - Without arguments: Interactive dropdown menu of command categories
  - With command name: Detailed information about that specific command

## Slot Management System

SlotBot uses a comprehensive slot management system that handles the entire lifecycle of a seller slot.

### Slot Creation

When an admin creates a slot:
1. A channel is created for the seller
2. The seller is assigned the seller role
3. The seller receives a restore code via DM
4. The slot information is saved in the database

### Slot Types

SlotBot supports multiple slot types with different durations and ping allowances:

- **Daily**: 1-day duration with 1 @here ping and 0 @everyone pings
- **Weekly**: 7-day duration with 2 @here pings and 1 @everyone ping
- **Monthly**: 30-day duration with 3 @here pings and 1 @everyone ping
- **Lifetime**: Never expires with 4 @here pings and 3 @everyone pings

### Slot Status

Slots can have the following statuses:

- **Active**: The slot is fully functional
- **Revoked**: The seller cannot send messages but the slot still exists
- **About to Expire**: The slot will expire soon
- **Expired**: The slot has reached its end date and will be deleted

### Slot Expiration

The bot automatically checks for expired slots every minute and:
1. Deletes the channel
2. Removes the slot from the database
3. Logs the expiration

## Ping System

SlotBot features a sophisticated ping management system that:

1. **Monitors Messages**: Tracks when sellers use @here and @everyone mentions
2. **Enforces Limits**: Prevents sellers from exceeding their allocated pings
3. **Auto-Revocation**: Automatically revokes slots when ping limits are exceeded
4. **Daily Reset**: Resets ping counters at the configured time every day

### How Pings Work

- Each slot type has a set number of allowed @here and @everyone pings
- When a seller uses a ping, the counter increases
- If a seller exceeds their limit, their slot is automatically revoked
- Ping counters reset daily at the configured time
- Sellers are notified of their remaining pings after each use

## Troubleshooting

### Common Issues and Solutions

**The bot isn't responding to commands**
- Check if the bot is online and has the correct permissions
- Verify that you're using the correct prefix
- Ensure the command syntax is correct
- Check the console logs for errors

**Slot creation fails**
- Ensure the category IDs in the config are correct
- Verify that the bot has permission to create channels in those categories
- Make sure the categories aren't full (Discord limit is 50 channels per category)

**Ping monitoring doesn't work**
- Check that the bot has permission to read messages in the slot channels
- Verify that the slot is properly registered in the database
- Make sure the user sending the message is the slot owner

**Automatic expiration doesn't happen**
- Check that the bot is running continuously
- Verify that the timezone settings are correct
- Make sure the slots have proper expiration dates in the database

### Reporting Bugs

If you encounter a bug:

1. **Describe the issue**: What happened? What did you expect to happen?
2. **Steps to reproduce**: How can someone else recreate this issue?
3. **Screenshots**: If applicable, provide screenshots showing the problem
4. **Bot logs**: Share any relevant error messages from the console

Submit bug reports by:
- Creating an issue on the GitHub repository
- Contacting the developer directly via Discord or Telegram (see [Developer Information](#developer-information))

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
5. Build the TypeScript files: `pnpm run build` or `npm run build`
6. Start with `pnpm start` or `npm start`
7. Consider using PM2 for keeping the bot running:
   ```bash
   npm install -g pm2
   pm2 start dist/index.js --name slotbot
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

This project is licensed under the MIT License - see the LICENSE file for details.

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

> **Note:** This bot is a spare-time project. While I strive to make it as bug-free as possible, issues may occur. Please report any bugs you encounter to help improve the bot for everyone.

Made with ❤️ by DevAnik