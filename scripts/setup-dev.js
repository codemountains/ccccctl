#!/usr/bin/env node

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { load as yamlLoad, dump as yamlDump } from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const REGISTRY_REPO_RAW_URL = 'https://raw.githubusercontent.com/codemountains/ccccctl-registry/main';
const ROOT_DIR = join(__dirname, '..');
const REGISTRY_DIR = join(ROOT_DIR, '.registry');

async function downloadFile(url, outputPath) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ccccctl-setup'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const content = await response.text();
    const dir = dirname(outputPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(outputPath, content, 'utf-8');
    return content;
  } catch (error) {
    console.error(`Failed to download ${url}:`, error.message);
    return null;
  }
}

function generateCommandYml(command) {
  const yamlContent = {
    commands: [command]
  };
  return yamlDump(yamlContent);
}

async function setupRegistry() {
  console.log('Setting up development registry...');
  
  // Check if .registry already exists
  if (existsSync(REGISTRY_DIR)) {
    console.log('[WARN] .registry directory already exists');
    console.log('   Run "npm run reset:dev" first to clean up, or remove .registry manually');
    return;
  }
  
  // Create .registry directory
  mkdirSync(REGISTRY_DIR, { recursive: true });
  
  // Download registry.yml
  console.log('[DOWNLOAD] Downloading registry.yml...');
  const registryYmlPath = join(REGISTRY_DIR, 'registry.yml');
  const registryContent = await downloadFile(
    `${REGISTRY_REPO_RAW_URL}/registry.yml`,
    registryYmlPath
  );
  
  if (!registryContent) {
    console.error('[ERROR] Failed to download registry.yml');
    return;
  }
  
  // Parse registry to get all commands
  let registry;
  let allCommands = [];
  
  try {
    registry = yamlLoad(registryContent);
    allCommands = registry.commands || [];
  } catch (error) {
    console.error('[ERROR] Failed to parse registry.yml:', error.message);
    return;
  }
  
  // Create commands directory
  const commandsDir = join(REGISTRY_DIR, 'commands');
  mkdirSync(commandsDir, { recursive: true });
  
  // Download all commands from registry
  console.log('[DOWNLOAD] Downloading commands...');
  let successCount = 0;
  
  for (const command of allCommands) {
    const commandDir = join(commandsDir, command.name);
    mkdirSync(commandDir, { recursive: true });
    
    if (command.type === 'ccccctl_registry') {
      // Download existing command.yml and .md files
      const commandYmlPath = join(commandDir, 'command.yml');
      const ymlContent = await downloadFile(
        `${REGISTRY_REPO_RAW_URL}/commands/${command.name}/command.yml`,
        commandYmlPath
      );
      
      const commandMdPath = join(commandDir, `${command.name}.md`);
      const mdContent = await downloadFile(
        `${REGISTRY_REPO_RAW_URL}/commands/${command.name}/${command.name}.md`,
        commandMdPath
      );
      
      if (ymlContent && mdContent) {
        successCount++;
        console.log(`  [SUCCESS] ${command.name} (ccccctl_registry)`);
      } else {
        console.log(`  [ERROR] ${command.name} (ccccctl_registry)`);
      }
    } else if (command.type === 'github') {
      // Generate command.yml for github type commands (no .md file needed)
      const commandYmlPath = join(commandDir, 'command.yml');
      const yamlContent = generateCommandYml(command);
      
      try {
        writeFileSync(commandYmlPath, yamlContent, 'utf-8');
        successCount++;
        console.log(`  [SUCCESS] ${command.name} (github)`);
      } catch (error) {
        console.error(`  [ERROR] ${command.name} (github) - failed to generate command.yml:`, error.message);
      }
    } else {
      console.log(`  [WARN] ${command.name} - unsupported type: ${command.type}`);
    }
  }
  
  console.log(`\n[COMPLETE] Development registry setup complete!`);
  console.log(`   Downloaded ${successCount}/${allCommands.length} commands`);
  console.log(`   Registry location: ${REGISTRY_DIR}`);
  console.log(`\n[INFO] You can now run "ccccctl list" to see available commands`);
}

setupRegistry().catch(error => {
  console.error('Setup failed:', error);
  process.exit(1);
});