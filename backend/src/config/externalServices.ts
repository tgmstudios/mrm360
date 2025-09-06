import { TeamProvisioningConfig } from '@/types';
import { AuthentikConfigValidator, AuthentikConfig } from '@/utils/authentikConfigValidator';
import { NextcloudConfigValidator } from '@/utils/nextcloudConfigValidator';
import { NextcloudConfig } from '@/services/nextcloudServiceFactory';
import { WiretapConfigValidator, WiretapConfig } from '@/utils/wiretapConfigValidator';

// Configuration for external service integrations
export const externalServicesConfig: TeamProvisioningConfig = {
  authentik: {
    baseUrl: process.env.AUTHENTIK_BASE_URL || 'http://localhost:9000',
    token: process.env.AUTHENTIK_TOKEN || 'mock-token',
    parentGroupTemplate: process.env.AUTHENTIK_PARENT_GROUP_TEMPLATE || '{parent_team_type}-team'
  },
  wikijs: {
    baseUrl: process.env.WIKIJS_BASE_URL || 'http://localhost:3000',
    token: process.env.WIKIJS_API_TOKEN || 'mock-token',
    basePath: process.env.WIKIJS_BASE_PATH || '/'
  },
  nextcloud: {
    baseUrl: process.env.NEXTCLOUD_BASE_URL || 'http://localhost:8080',
    username: process.env.NEXTCLOUD_USERNAME || 'admin',
    password: process.env.NEXTCLOUD_PASSWORD || 'password',
    basePath: process.env.NEXTCLOUD_BASE_PATH || '/'
  },
  github: {
    baseUrl: process.env.GITHUB_BASE_URL || 'https://api.github.com',
    token: process.env.GITHUB_TOKEN || 'mock-token',
    organization: process.env.GITHUB_ORGANIZATION || 'your-org',
    parentTeamId: process.env.GITHUB_PARENT_TEAM_ID || 'mock-parent-team-id'
  },
  discord: {
    botToken: process.env.DISCORD_BOT_TOKEN || 'mock-bot-token',
    guildId: process.env.DISCORD_GUILD_ID || 'mock-guild-id',
    categoryId: process.env.DISCORD_CATEGORY_ID || 'mock-category-id'
  },
  wiretap: {
    baseUrl: process.env.WIRETAP_BASE_URL || 'http://localhost:8080',
    token: process.env.WIRETAP_TOKEN || 'mock-token',
    projectTemplate: process.env.WIRETAP_PROJECT_TEMPLATE || '{event_type}-project'
  }
};

// Environment variable documentation
export const requiredEnvVars = {
  AUTHENTIK_BASE_URL: 'Base URL for Authentik instance',
  AUTHENTIK_TOKEN: 'API token for Authentik',
  AUTHENTIK_PARENT_GROUP_TEMPLATE: 'Template for parent group names (should include {parent_team_type})',
  WIRETAP_BASE_URL: 'Base URL for Wiretap instance',
  WIRETAP_TOKEN: 'API token for Wiretap',
  WIRETAP_PROJECT_TEMPLATE: 'Template for project names (should include {event_type})'
};

// Optional environment variables
export const optionalEnvVars = {
  AUTHENTIK_TIMEOUT: 'Timeout for Authentik API calls in milliseconds (default: 30000)',
  AUTHENTIK_RETRY_ATTEMPTS: 'Number of retry attempts for failed API calls (default: 3)',
  AUTHENTIK_RETRY_DELAY: 'Delay between retry attempts in milliseconds (default: 1000)',
  WIRETAP_TIMEOUT: 'Timeout for Wiretap API calls in milliseconds (default: 30000)',
  WIRETAP_RETRY_ATTEMPTS: 'Number of retry attempts for failed API calls (default: 3)',
  WIRETAP_RETRY_DELAY: 'Delay between retry attempts in milliseconds (default: 1000)'
};

// Get validated Authentik configuration
export function getAuthentikConfig(): AuthentikConfig {
  const config: AuthentikConfig = {
    baseUrl: process.env.AUTHENTIK_BASE_URL || 'http://localhost:9000',
    token: process.env.AUTHENTIK_TOKEN || 'mock-token',
    parentGroupTemplate: process.env.AUTHENTIK_PARENT_GROUP_TEMPLATE || '{parent_team_type}'
  };

  // Validate configuration
  const validation = AuthentikConfigValidator.validate(config);
  
  if (!validation.isValid) {
    console.error('Authentik configuration validation failed:', validation.errors);
    console.warn('Authentik configuration warnings:', validation.warnings);
  }

  return config;
}

// Check if Authentik is properly configured
export function isAuthentikConfigured(): boolean {
  const config = getAuthentikConfig();
  const validation = AuthentikConfigValidator.validate(config);
  return validation.isValid;
}

// Check if Authentik is production ready
export function isAuthentikProductionReady(): boolean {
  const config = getAuthentikConfig();
  return AuthentikConfigValidator.isProductionReady(config);
}

// Get configuration summary
export function getAuthentikConfigSummary(): string {
  const config = getAuthentikConfig();
  return AuthentikConfigValidator.getConfigSummary(config);
}

// Get validated Nextcloud configuration
export function getNextcloudConfig(): NextcloudConfig {
  const config: NextcloudConfig = {
    baseUrl: process.env.NEXTCLOUD_BASE_URL || 'http://localhost:8080',
    username: process.env.NEXTCLOUD_USERNAME || 'admin',
    password: process.env.NEXTCLOUD_PASSWORD || 'password',
    basePath: process.env.NEXTCLOUD_BASE_PATH || '/teams'
  };

  // Validate configuration
  const validation = NextcloudConfigValidator.validate(config);
  
  if (!validation.isValid) {
    console.error('Nextcloud configuration validation failed:', validation.errors);
    console.warn('Nextcloud configuration warnings:', validation.warnings);
  }

  return config;
}

// Check if Nextcloud is properly configured
export function isNextcloudConfigured(): boolean {
  const config = getNextcloudConfig();
  const validation = NextcloudConfigValidator.validate(config);
  return validation.isValid;
}

// Check if Nextcloud is production ready
export function isNextcloudProductionReady(): boolean {
  const config = getNextcloudConfig();
  return NextcloudConfigValidator.isProductionReady(config);
}

// Get validated Wiretap configuration
export function getWiretapConfig(): WiretapConfig {
  const config: WiretapConfig = {
    baseUrl: process.env.WIRETAP_BASE_URL || 'http://localhost:8080',
    token: process.env.WIRETAP_TOKEN || 'mock-token',
    projectTemplate: process.env.WIRETAP_PROJECT_TEMPLATE || '{event_type}-project'
  };

  // Validate configuration
  const validation = WiretapConfigValidator.validate(config);
  
  if (!validation.isValid) {
    console.error('Wiretap configuration validation failed:', validation.errors);
    console.warn('Wiretap configuration warnings:', validation.warnings);
  }

  return config;
}

// Check if Wiretap is properly configured
export function isWiretapConfigured(): boolean {
  const config = getWiretapConfig();
  const validation = WiretapConfigValidator.validate(config);
  return validation.isValid;
}

// Check if Wiretap is production ready
export function isWiretapProductionReady(): boolean {
  const config = getWiretapConfig();
  return WiretapConfigValidator.isProductionReady(config);
}

// Get configuration summary
export function getWiretapConfigSummary(): string {
  const config = getWiretapConfig();
  return WiretapConfigValidator.getConfigSummary(config);
}
