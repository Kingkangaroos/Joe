#!/usr/bin/env node
/* Website Ventures Batch 5 promotion gate — ChatGPT (OpenAI), 2026-09-08 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const MANIFEST_FILE = 'WEBSITE-VENTURES-ASSET-IMPORT-MANIFEST.json';
const REGISTRY_FILE = 'WEBSITE-VENTURES-SELECTED-ASSETS.json';
const DESKTOP_JOBS = new Set([
  'AG-HERO-TRANSFORM-001',
  'AG-HERO-PRODUCT-001',
  'AG-HERO-MATERIAL-001'
]);
const MOBILE_JOB = 'AG-HERO-MOBILE-001';
const ALLOWED_JOBS = new Set([...DESKTOP_JOBS, MOBILE_JOB]);

function fail (message) {
  throw new Error(message);
}

function readJson (root, file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
}

function safeRepoPath (root, relative) {
  if (!relative || path.isAbsolute(relative)) fail('Asset path must be repository-relative.');
  const normalized = path.normalize(relative);
  if (normalized.startsWith('..' + path.sep) || normalized === '..') fail('Asset path escapes the repository.');
  if (!normalized.startsWith('website-ventures-assets' + path.sep)) fail('Asset path must stay inside website-ventures-assets/.');
  return path.join(root, normalized);
}

function pngDimensions (file) {
  const fd = fs.openSync(file, 'r');
  try {
    const header = Buffer.alloc(24);
    if (fs.readSync(fd, header, 0, header.length, 0) !== header.length) fail('Candidate is too small to be a PNG.');
    const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    if (!header.subarray(0, 8).equals(signature) || header.toString('ascii', 12, 16) !== 'IHDR') {
      fail('Candidate must be a real PNG matching its manifest path.');
    }
    const width = header.readUInt32BE(16);
    const height = header.readUInt32BE(20);
    if (!width || !height) fail('Candidate PNG has invalid dimensions.');
    return { width, height };
  } finally {
    fs.closeSync(fd);
  }
}

function validateAspect (jobId, dimensions) {
  const expected = jobId === MOBILE_JOB ? 4 / 5 : 16 / 9;
  const actual = dimensions.width / dimensions.height;
  const drift = Math.abs(actual - expected) / expected;
  if (drift > 0.03) {
    fail(`${jobId} must be ${jobId === MOBILE_JOB ? '4:5' : '16:9'}; received ${dimensions.width}x${dimensions.height}.`);
  }
}

function variantIndex (value) {
  const label = String(value || '').trim().toUpperCase();
  if (!/^[A-Z]$/.test(label)) fail('Variant must be a letter such as A, B or C.');
  return { label, index: label.charCodeAt(0) - 65 };
}

function writeJsonAtomic (file, value) {
  const temp = `${file}.tmp-${process.pid}`;
  fs.writeFileSync(temp, JSON.stringify(value, null, 2) + '\n');
  fs.renameSync(temp, file);
}

function promote (options) {
  const root = path.resolve(options.root || path.join(__dirname, '..'));
  const jobId = String(options.jobId || '').trim().toUpperCase();
  const generationId = String(options.generationId || '').trim();
  if (!ALLOWED_JOBS.has(jobId)) fail('This gate only promotes required Batch 5 agency hero jobs.');
  if (!generationId) fail('A Higgsfield generation URL or ID is required for provenance.');

  const { label, index } = variantIndex(options.variant);
  const manifest = readJson(root, MANIFEST_FILE);
  const registry = readJson(root, REGISTRY_FILE);
  const asset = (manifest.assets || []).find(item => item.jobId === jobId);
  if (!asset) fail(`${jobId} is missing from the import manifest.`);
  if (!Array.isArray(asset.candidatePaths) || !asset.candidatePaths[index]) {
    fail(`Variant ${label} is not defined for ${jobId}.`);
  }

  const candidatePath = asset.candidatePaths[index];
  const candidateFile = safeRepoPath(root, candidatePath);
  const targetFile = safeRepoPath(root, asset.targetPath);
  if (!fs.existsSync(candidateFile) || !fs.statSync(candidateFile).isFile()) {
    fail(`Candidate is missing: ${candidatePath}`);
  }
  const realCandidate = fs.realpathSync(candidateFile);
  if (!realCandidate.startsWith(root + path.sep)) fail('Candidate symlink escapes the repository.');
  const dimensions = pngDimensions(candidateFile);
  validateAspect(jobId, dimensions);

  const slotKey = jobId === MOBILE_JOB ? 'agency.hero.mobile' : 'agency.hero.desktop';
  const slot = registry.slots && registry.slots[slotKey];
  if (!slot) fail(`Registry slot ${slotKey} is missing.`);
  if (jobId === MOBILE_JOB) {
    const desktop = registry.slots['agency.hero.desktop'];
    if (!desktop || desktop.status !== 'selected' || !desktop.selectedPath) {
      fail('Mobile promotion is blocked until the Batch 5 desktop winner is selected.');
    }
  }
  const replacing = slot.status === 'selected' || fs.existsSync(targetFile);
  if (replacing && !options.replace) fail(`Promotion would replace ${slotKey}; rerun with --replace after deliberate approval.`);

  const now = new Date().toISOString();
  const result = {
    jobId,
    variant: label,
    generationId,
    candidatePath,
    targetPath: asset.targetPath,
    slotKey,
    dimensions,
    dryRun: !!options.dryRun,
    replacing
  };
  if (options.dryRun) return result;

  fs.mkdirSync(path.dirname(targetFile), { recursive: true });
  const tempTarget = `${targetFile}.tmp-${process.pid}`;
  fs.copyFileSync(candidateFile, tempTarget);
  fs.renameSync(tempTarget, targetFile);

  slot.status = 'selected';
  slot.selectedJobId = jobId;
  slot.selectedGenerationId = generationId;
  slot.selectedPath = asset.targetPath;
  slot.selectedCandidatePath = candidatePath;
  slot.selectedVariant = label;
  slot.selectedAt = now;
  registry.updatedAt = now.slice(0, 10);
  registry.status = 'active-with-selected-assets';

  if (DESKTOP_JOBS.has(jobId)) {
    for (const item of manifest.assets || []) {
      if (DESKTOP_JOBS.has(item.jobId) && item.jobId !== jobId && item.status === 'selected') {
        item.status = 'reviewed-not-selected';
        delete item.selectedCandidatePath;
        delete item.selectedVariant;
        delete item.selectedGenerationId;
        delete item.selectedAt;
      }
    }
  }
  asset.status = 'selected';
  asset.selectedCandidatePath = candidatePath;
  asset.selectedVariant = label;
  asset.selectedGenerationId = generationId;
  asset.selectedAt = now;
  manifest.updatedAt = now.slice(0, 10);

  writeJsonAtomic(path.join(root, REGISTRY_FILE), registry);
  writeJsonAtomic(path.join(root, MANIFEST_FILE), manifest);
  return result;
}

function parseArgs (argv) {
  const options = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--replace') options.replace = true;
    else if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--job') options.jobId = argv[++i];
    else if (arg === '--variant') options.variant = argv[++i];
    else if (arg === '--generation-id') options.generationId = argv[++i];
    else fail(`Unknown argument: ${arg}`);
  }
  return options;
}

function printResult (result) {
  console.log(result.dryRun ? 'BATCH 5 PROMOTION PREFLIGHT PASSED' : 'BATCH 5 ASSET PROMOTED');
  console.log(`Job: ${result.jobId} · variant ${result.variant} · ${result.dimensions.width}x${result.dimensions.height}`);
  console.log(`Source: ${result.candidatePath}`);
  console.log(`Target: ${result.targetPath}`);
  console.log(`Registry slot: ${result.slotKey}`);
  if (result.dryRun) console.log('No files or registries were changed.');
}

if (require.main === module) {
  try {
    printResult(promote(parseArgs(process.argv.slice(2))));
  } catch (error) {
    console.error(`Batch 5 promotion blocked: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = { promote, pngDimensions, validateAspect };
