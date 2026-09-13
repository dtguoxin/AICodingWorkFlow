#!/usr/bin/env node

const { program } = require('commander');
const install = require('../lib/install');

program
  .name('skills')
  .description('Qoder Skills CLI - Install and manage AI Coding Workflow skills')
  .version('1.0.0');

program
  .command('add <source>')
  .description('Install skills from a Git repository URL or local path')
  .option('-s, --skill <name>', 'Install a specific skill by name')
  .option('-g, --global', 'Install to global skills directory (~/.qoder-cn/skills/)', true)
  .option('-l, --local', 'Install to local project (.qoder/skills/)')
  .option('-f, --force', 'Overwrite existing skills')
  .action(async (source, options) => {
    try {
      await install.run(source, options);
    } catch (err) {
      console.error(`❌ Error: ${err.message}`);
      process.exit(1);
    }
  });

program
  .command('list <source>')
  .description('List available skills from a source without installing')
  .action(async (source) => {
    try {
      await install.list(source);
    } catch (err) {
      console.error(`❌ Error: ${err.message}`);
      process.exit(1);
    }
  });

program.parse();
