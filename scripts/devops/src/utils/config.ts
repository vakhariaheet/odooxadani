import { config } from 'dotenv';
import { existsSync, readFileSync } from 'fs';
import { join, resolve } from 'path';
import type { Config } from '../types/index.js';

export class ConfigManager {
  private static instance: ConfigManager;
  private config: Config;

  private constructor() {
    this.config = this.loadConfig();
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  private findGitRoot(): string {
    let currentDir = process.cwd();
    while (currentDir !== '/') {
      if (existsSync(join(currentDir, '.git'))) {
        return currentDir;
      }
      currentDir = resolve(currentDir, '..');
    }
    throw new Error('Not in a git repository');
  }

  private loadConfig(): Config {
    const gitRoot = this.findGitRoot();

    // Load environment variables from multiple sources
    // Try to find the devops .env file
    const devopsEnvPath = join(gitRoot, 'scripts/devops/.env');
    if (existsSync(devopsEnvPath)) {
      config({ path: devopsEnvPath });
    }

    // Also load backend .env
    const backendEnvPath = join(gitRoot, 'backend/.env');
    if (existsSync(backendEnvPath)) {
      config({ path: backendEnvPath });
    }

    // Resolve paths relative to git root
    const backendPath = process.env.BACKEND_PATH
      ? resolve(gitRoot, process.env.BACKEND_PATH.replace(/^\.\.\/\.\.\//, ''))
      : join(gitRoot, 'backend');

    const modulesPath = process.env.MODULES_PATH
      ? resolve(gitRoot, process.env.MODULES_PATH.replace(/^\.\.\/\.\.\//, ''))
      : join(gitRoot, 'backend/src/modules');

    return {
      epicBranch: process.env.EPIC_BRANCH || 'main',
      stage: process.env.SERVERLESS_STAGE || 'dev',
      awsProfile: process.env.DEVOPS_AWS_PROFILE || 'default',
      defaultCommitPrefix: process.env.DEFAULT_COMMIT_MESSAGE_PREFIX || 'feat:',
      gitRoot,
      backendPath,
      modulesPath,
    };
  }

  public getConfig(): Config {
    return { ...this.config };
  }

  public updateConfig(updates: Partial<Config>): void {
    this.config = { ...this.config, ...updates };
  }
}
