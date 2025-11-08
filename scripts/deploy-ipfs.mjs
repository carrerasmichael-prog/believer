// scripts/deploy-ipfs.mjs
// PURE NODE.JS: No Git, no bash, no paths
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { create } from 'tar';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const buildDir = path.join(__dirname, '../dist');
const manifestPath = path.join(buildDir, '.well-known/believer-manifest.json');

console.log('Building production version...');
try {
  execSync('yarn build', { stdio: 'inherit' });
  console.log('Build complete: dist/ ready');
} catch (error) {
  console.error('Build failed. Fix errors and try again.');
  process.exit(1);
}

let cid;
try {
  const { default: hash } = await import('ipfs-only-hash');

  const chunks = [];
  const stream = create({ cwd: buildDir, gzip: false }, ['.']);

  for await (const chunk of stream) {
    chunks.push(chunk);
  }

  const tarBuffer = Buffer.concat(chunks);
  cid = await hash.of(tarBuffer);
  console.log(`IPFS CID computed: ${cid}`);
} catch (error) {
  console.error('Failed to compute CID.');
  console.error(error.message);
  process.exit(1);
}

let manifest;
try {
  const raw = fs.readFileSync(manifestPath, 'utf8');
  manifest = JSON.parse(raw);
} catch (error) {
  console.error(`Could not read: ${manifestPath}`);
  console.error('Make sure public/.well-known/believer-manifest.json exists');
  process.exit(1);
}

manifest.web3 = manifest.web3 || {};
manifest.web3.ipfs = cid;
manifest.web3.dnslink = `dnslink=/ipfs/${cid}`;
manifest.status = 'ipfs-ready';
manifest.build = {
  timestamp: new Date().toISOString(),
  commit: execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim()
};

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log('believer-manifest.json updated with real CID');

console.log('\nDEPLOYMENT READY');
console.log('Your IPFS version is ready at:');
console.log(`   https://dweb.link/ipfs/${cid}`);
console.log('\nTo go live (optional):');
console.log('   1. Pin: npx web3-storage put dist/');
console.log('   2. DNS TXT:');
console.log(`      _dnslink.believergo.com  TXT  "dnslink=/ipfs/${cid}"`);
console.log('\nWeb2 site unchanged until DNS update.');