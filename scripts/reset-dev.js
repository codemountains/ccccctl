#!/usr/bin/env node

import { existsSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROOT_DIR = join(__dirname, '..');
const REGISTRY_DIR = join(ROOT_DIR, '.registry');

function resetRegistry() {
  console.log('Resetting development registry...');
  
  if (!existsSync(REGISTRY_DIR)) {
    console.log('[INFO] No .registry directory found - nothing to reset');
    return;
  }
  
  try {
    rmSync(REGISTRY_DIR, { recursive: true, force: true });
    console.log('[DELETE] Removed .registry directory');
    console.log('[SUCCESS] Development registry reset complete');
    console.log('\n[INFO] Run "npm run setup:dev" to set up the development registry again');
  } catch (error) {
    console.error('[ERROR] Failed to remove .registry directory:', error.message);
    process.exit(1);
  }
}

resetRegistry();