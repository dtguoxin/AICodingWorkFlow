/**
 * Core installation logic for skills-cli
 */

const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');
const registry = require('./registry');
const utils = require('./utils');

const TEMP_PREFIX = 'skills-cli-';

/**
 * Determine target installation directory
 */
function getTargetDir(options) {
  if (options.local) {
    const projectRoot = utils.findProjectRoot(process.cwd());
    if (!projectRoot) {
      throw new Error(
        'No .qoder directory found in current project. ' +
        'Run this command inside a project with ai-workspace initialized, ' +
        'or use --global to install globally.'
      );
    }
    return path.join(projectRoot, '.qoder', 'skills');
  }
  // Default: global
  const homeDir = os.homedir();
  return path.join(homeDir, '.qoder-cn', 'skills');
}

/**
 * Download source repository to temp directory
 */
async function downloadSource(source, tempDir) {
  if (source.startsWith('http://') || source.startsWith('https://')) {
    console.log(`⬇️  Cloning from ${source} ...`);
    try {
      execSync(`git clone --depth 1 "${source}" "${tempDir}"`, {
        stdio: 'pipe',
        timeout: 120000
      });
    } catch (err) {
      throw new Error(`Failed to clone repository: ${err.message}`);
    }
  } else if (await fs.pathExists(source)) {
    const absSource = path.resolve(source);
    console.log(`📁 Copying from local path: ${absSource}`);
    const entries = await fs.readdir(absSource);
    for (const entry of entries) {
      const src = path.join(absSource, entry);
      const dest = path.join(tempDir, entry);
      await fs.copy(src, dest);
    }
  } else {
    throw new Error(
      `Unsupported source: ${source}. ` +
      `Use a Git URL (https://github.com/...) or a local file path.`
    );
  }
}

/**
 * Main install command handler
 */
async function run(source, options) {
  const isGlobal = !options.local;
  const targetDir = getTargetDir(options);

  console.log(`📦 Qoder Skills CLI v1.0.0`);
  console.log(`   Source: ${source}`);
  console.log(`   Target: ${targetDir} (${isGlobal ? 'global' : 'local'})`);
  console.log('');

  // 1. Ensure target directory exists
  await fs.ensureDir(targetDir);

  // 2. Create temp directory
  const tempDir = path.join(os.tmpdir(), `${TEMP_PREFIX}${Date.now()}`);
  await fs.ensureDir(tempDir);

  try {
    // 3. Download / clone source
    await downloadSource(source, tempDir);

    // 4. Load manifest
    const manifest = await registry.loadManifest(tempDir);

    console.log(`📋 Found ${manifest.skills.length} skill(s) in "${manifest.name}" v${manifest.version}`);
    if (manifest.description) {
      console.log(`   ${manifest.description}`);
    }
    console.log('');

    // 5. Determine skills to install
    const skillsToInstall = options.skill
      ? manifest.skills.filter(s => s.name === options.skill)
      : manifest.skills;

    if (skillsToInstall.length === 0) {
      if (options.skill) {
        const available = manifest.skills.map(s => s.name).join(', ');
        throw new Error(
          `Skill "${options.skill}" not found in manifest. ` +
          `Available: ${available}`
        );
      }
      throw new Error('No skills found in manifest.');
    }

    // 6. Install each skill
    let installed = 0;
    let skipped = 0;

    for (const skill of skillsToInstall) {
      const srcPath = path.join(tempDir, skill.path);
      const destPath = path.join(targetDir, skill.name);

      // Check source exists
      if (!await fs.pathExists(srcPath)) {
        console.log(`⚠️  Skip: ${skill.name} (source path not found: ${skill.path})`);
        skipped++;
        continue;
      }

      // Check destination exists
      if (await fs.pathExists(destPath)) {
        if (!options.force) {
          console.log(`⏭️  Skip: ${skill.name} (already exists, use --force to overwrite)`);
          skipped++;
          continue;
        }
        console.log(`🔄 Overwriting: ${skill.name}`);
        await fs.remove(destPath);
      }

      // Copy
      await fs.copy(srcPath, destPath);
      console.log(`✅ Installed: ${skill.name}`);
      installed++;
    }

    console.log('');
    console.log(`🎉 Done! ${installed} installed, ${skipped} skipped.`);
    console.log(`   Location: ${targetDir}`);

  } finally {
    // 7. Cleanup temp directory
    await fs.remove(tempDir).catch(() => {});
  }
}

/**
 * List command handler - preview without installing
 */
async function list(source) {
  const tempDir = path.join(os.tmpdir(), `${TEMP_PREFIX}list-${Date.now()}`);
  await fs.ensureDir(tempDir);

  try {
    await downloadSource(source, tempDir);
    const manifest = await registry.loadManifest(tempDir);

    console.log(`📋 Skills in "${manifest.name}" v${manifest.version}`);
    if (manifest.description) {
      console.log(`   ${manifest.description}`);
    }
    console.log('');

    const maxNameLen = Math.max(...manifest.skills.map(s => s.name.length));

    manifest.skills.forEach((skill, i) => {
      const paddedName = skill.name.padEnd(maxNameLen);
      console.log(`   ${i + 1}. ${paddedName}  ${skill.description || ''}`);
    });

    console.log('');
    console.log(`   Total: ${manifest.skills.length} skill(s)`);

  } finally {
    await fs.remove(tempDir).catch(() => {});
  }
}

module.exports = {
  run,
  list
};
