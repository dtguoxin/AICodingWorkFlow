/**
 * Skill manifest registry - parses and validates skills.json
 */

const fs = require('fs-extra');
const path = require('path');

const MANIFEST_FILE = 'skills.json';

/**
 * Load and validate skills manifest from a directory
 */
async function loadManifest(dir) {
  const manifestPath = path.join(dir, MANIFEST_FILE);

  if (!await fs.pathExists(manifestPath)) {
    throw new Error(
      `Manifest file not found: ${MANIFEST_FILE}. ` +
      `Make sure the source contains a valid skills.json at its root.`
    );
  }

  let manifest;
  try {
    manifest = await fs.readJson(manifestPath);
  } catch (err) {
    throw new Error(`Failed to parse ${MANIFEST_FILE}: ${err.message}`);
  }

  // Basic validation
  if (!manifest.skills || !Array.isArray(manifest.skills)) {
    throw new Error('Invalid manifest: "skills" array is required.');
  }

  manifest.skills.forEach((skill, i) => {
    if (!skill.name) {
      throw new Error(`Invalid manifest: skill #${i} is missing "name".`);
    }
    if (!skill.path) {
      throw new Error(`Invalid manifest: skill "${skill.name}" is missing "path".`);
    }
  });

  return manifest;
}

module.exports = {
  loadManifest
};
