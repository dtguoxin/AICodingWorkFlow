/**
 * Utility functions for skills-cli
 */

const fs = require('fs-extra');
const path = require('path');

/**
 * Check if a path exists and is a directory
 */
async function isDirectory(dirPath) {
  try {
    const stat = await fs.stat(dirPath);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Find project root by looking for .qoder directory
 */
async function findProjectRoot(startDir = process.cwd()) {
  let current = path.resolve(startDir);
  const root = path.parse(current).root;

  while (current !== root) {
    if (await fs.pathExists(path.join(current, '.qoder'))) {
      return current;
    }
    current = path.dirname(current);
  }

  return null;
}

module.exports = {
  isDirectory,
  findProjectRoot
};
