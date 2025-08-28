# Discord Bot Service Implementation

This document describes the comprehensive Discord bot service implementation that replaces the mock DiscordService with real Discord API integration using discord.js.

## 🏗️ Architecture Overview

The Discord bot service follows the same architectural pattern as the Authentik service:

```
DiscordService (API Layer)
    ↓
DiscordBotService (Core Implementation)
    ↓
discord.js (Discord API Client)
```

## 📁 File Structure

- `src/services/discordBotService.ts` - Core Discord bot implementation
- `src/services/discordBotServiceFactory.ts` - Service factory with validation
- `src/services/discordConfigValidator.ts` - Configuration validation
- `src/services/discordService.ts` - Updated API service (now uses DiscordBotService)
- `scripts/testDiscordBotService.ts` - Comprehensive test suite
- `src/pages/api/health/discord.ts` - Health check endpoint

## 🔧 Configuration

### Environment Variables

```bash
# Required
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_GUILD_ID=your_server_id_here
DISCORD_CATEGORY_ID=your_category_id_here
```

### Bot Token Format
Discord bot tokens follow this pattern:
```
[A-Za-z0-9_-]{23,28}.[A-Za-z0-9_-]{6,7}.[A-Za-z0-9_-]{27}
```

### Discord ID Format
Discord IDs are 17-19 digit numbers.

## 🚀 Setup Instructions

### 1. Create Discord Application
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to the "Bot" section and click "Add Bot"
4. Copy the bot token

### 2. Set Environment Variables
```bash
export DISCORD_BOT_TOKEN=your_bot_token_here
export DISCORD_GUILD_ID=your_server_id_here
export DISCORD_CATEGORY_ID=your_category_id_here
```

### 3. Bot Permissions
The bot needs these permissions:
- Manage Channels
- Manage Roles
- View Channels
- Send Messages
- Read Message History
- Attach Files
- Embed Links
- Use External Emojis
- Add Reactions

### 4. Invite Bot to Server
1. Go to OAuth2 > URL Generator in your Discord app
2. Select "bot" scope and the required permissions
3. Use the generated URL to invite the bot to your server

### 5. Get Server and Category IDs
1. Enable Developer Mode in Discord (User Settings > Advanced)
2. Right-click on your server name and "Copy Server ID"
3. Right-click on a category and "Copy ID"

## 🧪 Testing

### Run Test Suite
```bash
npm run test:discord
```

### Health Check
```bash
curl http://localhost:3000/api/health/discord
```

## 🔍 API Functions

The Discord bot service implements all functions from the original DiscordService:

### Channel Management
- `createChannel(name, categoryId?)` - Create text channel
- `updateChannel(channelId, updates)` - Update channel properties
- `deleteChannel(channelId)` - Delete channel
- `getChannel(channelId)` - Get channel details
- `channelExists(name)` - Check if channel exists
- `moveChannelToCategory(channelId, categoryId)` - Move channel to category

### Role Management
- `createRole(name, permissions)` - Create role with permissions
- `updateRole(roleId, updates)` - Update role properties
- `deleteRole(roleId)` - Delete role
- `getRole(roleId)` - Get role details
- `roleExists(name)` - Check if role exists

### Permission Management
- `setChannelPermissions(channelId, permissions)` - Set channel permissions
- `assignRoleToUsers(roleId, userIds)` - Assign role to users
- `removeRoleFromUsers(roleId, userIds)` - Remove role from users

### Category Management
- `createCategory(name)` - Create new category

## 🔐 Permission System

### Supported Permissions
- `view_channel` - View channel
- `send_messages` - Send messages
- `read_message_history` - Read message history
- `attach_files` - Attach files
- `embed_links` - Embed links
- `use_external_emojis` - Use external emojis
- `add_reactions` - Add reactions
- `manage_messages` - Manage messages
- `manage_channels` - Manage channels
- `manage_roles` - Manage roles
- `administrator` - Administrator

### Permission Conversion
The service automatically converts between:
- String-based permissions (internal format)
- Discord.js permission flags (API format)

## 🏥 Health Monitoring

### Health Check Endpoint
`GET /api/health/discord`

Returns:
- Service status (healthy/unhealthy)
- Environment configuration status
- Service health validation
- Production readiness check
- Setup instructions

### Health Status
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": {
    "botToken": "configured",
    "guildId": "configured",
    "categoryId": "configured",
    "overall": "ready"
  },
  "service": {
    "health": true,
    "error": null
  },
  "production": {
    "ready": true
  }
}
```

## 🚨 Error Handling

### Comprehensive Error Handling
- Connection failures
- API rate limiting
- Permission errors
- Invalid IDs
- Network timeouts

### Error Logging
All errors are logged with:
- Error context
- Stack traces
- User-friendly messages
- Recovery suggestions

## 🔄 Connection Management

### Automatic Connection
- Service connects to Discord on first operation
- Connection state is maintained
- Automatic reconnection on failures
- Graceful disconnection on shutdown

### Connection States
- `disconnected` - Not connected
- `connecting` - Connection in progress
- `connected` - Successfully connected
- `error` - Connection failed

## 🏭 Service Factory

### Factory Methods
- `createService(config)` - Create service with config
- `createServiceFromEnv()` - Create service from environment
- `createMockService()` - Create mock service for development

### Configuration Validation
- Required field validation
- Format validation
- Production readiness check
- Environment status reporting

## 📊 Monitoring & Logging

### Logging Levels
- `info` - Normal operations
- `warn` - Warning conditions
- `error` - Error conditions
- `debug` - Debug information

### Metrics
- Operation success/failure rates
- Response times
- Connection status
- Resource usage

## 🚀 Production Deployment

### Requirements
- Valid Discord bot token
- Valid guild ID
- Valid category ID
- Proper bot permissions
- Network access to Discord API

### Health Checks
- Regular health check monitoring
- Alerting on failures
- Automatic recovery attempts
- Performance monitoring

### Security
- Bot token stored securely
- Minimal required permissions
- Rate limiting compliance
- Audit logging

## 🔧 Troubleshooting

### Common Issues

#### Bot Not Connecting
- Check bot token validity
- Verify bot is invited to server
- Check network connectivity
- Verify bot permissions

#### Permission Errors
- Ensure bot has required permissions
- Check role hierarchy
- Verify channel permissions
- Check bot's own permissions

#### Rate Limiting
- Implement exponential backoff
- Reduce operation frequency
- Monitor API usage
- Respect Discord limits

### Debug Mode
Enable debug logging:
```typescript
// Set log level to debug
logger.setLevel('debug');
```

## 📚 Additional Resources

- [Discord.js Documentation](https://discord.js.org/)
- [Discord Developer Portal](https://discord.com/developers/docs)
- [Discord API Documentation](https://discord.com/developers/docs/reference)
- [Bot Permissions Guide](https://discord.com/developers/docs/topics/permissions)

## 🤝 Contributing

When contributing to the Discord bot service:

1. Follow the existing code patterns
2. Add comprehensive error handling
3. Include proper logging
4. Write tests for new functionality
5. Update this documentation
6. Follow Discord API best practices

## 📄 License

This implementation follows the same license as the main project.
