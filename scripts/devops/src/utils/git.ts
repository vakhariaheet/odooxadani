import simpleGit, { SimpleGit } from 'simple-git';
import chalk from 'chalk';
import ora from 'ora';
import type { GitStatus, ConflictInfo } from '../types/index.js';

export class GitManager {
  private git: SimpleGit;
  private gitRoot: string;

  constructor(gitRoot: string) {
    this.gitRoot = gitRoot;
    this.git = simpleGit(gitRoot);
  }

  async getStatus(): Promise<GitStatus> {
    const status = await this.git.status();

    return {
      isClean: status.files.length === 0,
      staged: status.staged,
      modified: status.modified,
      untracked: status.not_added,
    };
  }

  async getCurrentBranch(): Promise<string> {
    const status = await this.git.status();
    return status.current || 'unknown';
  }

  async checkoutBranch(branch: string, create: boolean = false): Promise<void> {
    const spinner = ora(`Checking out ${branch}...`).start();

    try {
      if (create) {
        await this.git.checkoutBranch(branch, 'HEAD');
        spinner.succeed(`Created and checked out branch: ${chalk.cyan(branch)}`);
      } else {
        await this.git.checkout(branch);
        spinner.succeed(`Checked out branch: ${chalk.cyan(branch)}`);
      }
    } catch (error) {
      spinner.fail(`Failed to checkout ${branch}`);
      throw error;
    }
  }

  async pullLatest(branch: string): Promise<void> {
    const spinner = ora(`Pulling latest changes from ${branch}...`).start();

    try {
      await this.git.pull('origin', branch);
      spinner.succeed(`Successfully pulled latest changes from ${chalk.cyan(branch)}`);
    } catch (error) {
      spinner.fail(`Failed to pull from ${branch}`);
      throw error;
    }
  }

  async stashChanges(message: string = 'Auto-stash before operation'): Promise<void> {
    const spinner = ora('Stashing changes...').start();

    try {
      await this.git.stash(['push', '-m', message]);
      spinner.succeed('Changes stashed successfully');
    } catch (error) {
      spinner.fail('Failed to stash changes');
      throw error;
    }
  }

  async discardChanges(): Promise<void> {
    const spinner = ora('Discarding all changes...').start();

    try {
      await this.git.reset(['--hard', 'HEAD']);
      await this.git.clean('f', ['-d']);
      spinner.succeed('All changes discarded');
    } catch (error) {
      spinner.fail('Failed to discard changes');
      throw error;
    }
  }

  async addAndCommit(message: string): Promise<void> {
    const spinner = ora('Committing changes...').start();

    try {
      await this.git.add('.');
      await this.git.commit(message);
      spinner.succeed('Changes committed successfully');
    } catch (error) {
      spinner.fail('Failed to commit changes');
      throw error;
    }
  }

  async rebaseFromBranch(baseBranch: string): Promise<ConflictInfo> {
    const spinner = ora(`Rebasing from ${baseBranch}...`).start();

    try {
      // First, fetch latest changes
      await this.git.fetch();

      // Pull latest changes from base branch
      const currentBranch = await this.getCurrentBranch();
      await this.checkoutBranch(baseBranch);
      await this.pullLatest(baseBranch);
      await this.checkoutBranch(currentBranch);

      // Now rebase
      await this.git.rebase([baseBranch]);
      spinner.succeed('Rebase completed successfully');

      return { files: [], hasConflicts: false };
    } catch (error) {
      spinner.fail('Rebase encountered conflicts');

      // Check for conflicts
      const status = await this.git.status();
      const conflictFiles = status.conflicted || [];

      return {
        files: conflictFiles,
        hasConflicts: conflictFiles.length > 0,
      };
    }
  }

  async continueRebase(): Promise<void> {
    const spinner = ora('Continuing rebase...').start();

    try {
      await this.git.rebase(['--continue']);
      spinner.succeed('Rebase continued successfully');
    } catch (error) {
      spinner.fail('Failed to continue rebase');
      throw error;
    }
  }

  async abortRebase(): Promise<void> {
    const spinner = ora('Aborting rebase...').start();

    try {
      await this.git.rebase(['--abort']);
      spinner.succeed('Rebase aborted');
    } catch (error) {
      spinner.fail('Failed to abort rebase');
      throw error;
    }
  }

  async pushBranch(branch: string, force: boolean = false): Promise<void> {
    const spinner = ora(`Pushing ${branch}...`).start();

    try {
      if (force) {
        await this.git.push('origin', branch, ['--force-with-lease']);
        spinner.succeed('Branch force-pushed successfully');
      } else {
        await this.git.push('origin', branch);
        spinner.succeed('Branch pushed successfully');
      }
    } catch (error) {
      if (!force) {
        spinner.warn('Normal push failed, trying force push...');
        await this.pushBranch(branch, true);
      } else {
        spinner.fail('Failed to push branch');
        throw error;
      }
    }
  }

  async createPullRequest(
    currentBranch: string,
    baseBranch: string,
    title: string,
    description: string
  ): Promise<string | null> {
    const spinner = ora('Creating Pull Request...').start();

    try {
      // Use execa to run gh command
      const { execa } = await import('execa');

      const result = await execa('gh', [
        'pr',
        'create',
        '--base',
        baseBranch,
        '--head',
        currentBranch,
        '--title',
        title,
        '--body',
        description,
      ]);

      const prUrl = result.stdout.match(/https:\/\/github\.com\/[^\s]+/)?.[0];

      if (prUrl) {
        spinner.succeed('Pull Request created successfully!');
        console.log(chalk.cyan(`PR URL: ${prUrl}`));
        return prUrl;
      } else {
        spinner.succeed('Pull Request created successfully!');
        return null;
      }
    } catch (error) {
      spinner.fail('Failed to create Pull Request');
      console.log(chalk.yellow('You can create the PR manually on GitHub'));
      return null;
    }
  }

  async openPRInBrowser(): Promise<void> {
    try {
      const { execa } = await import('execa');
      await execa('gh', ['pr', 'view', '--web']);
      console.log(chalk.green('PR opened in browser'));
    } catch (error) {
      console.log(chalk.yellow('Could not open browser automatically'));
    }
  }
}
