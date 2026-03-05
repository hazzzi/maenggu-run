/**
 * package.json의 version을 tauri.conf.json과 Cargo.toml에 동기화.
 * package.json이 단일 소스.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf-8'));
const version = pkg.version;

// tauri.conf.json
const tauriConfPath = resolve(root, 'src-tauri/tauri.conf.json');
const tauriConf = JSON.parse(readFileSync(tauriConfPath, 'utf-8'));
if (tauriConf.version !== version) {
  tauriConf.version = version;
  writeFileSync(tauriConfPath, JSON.stringify(tauriConf, null, 2) + '\n');
  console.log(`tauri.conf.json: ${tauriConf.version} → ${version}`);
}

// Cargo.toml
const cargoPath = resolve(root, 'src-tauri/Cargo.toml');
const cargo = readFileSync(cargoPath, 'utf-8');
const updated = cargo.replace(
  /^version\s*=\s*"[^"]*"/m,
  `version = "${version}"`,
);
if (cargo !== updated) {
  writeFileSync(cargoPath, updated);
  console.log(`Cargo.toml: → ${version}`);
}
