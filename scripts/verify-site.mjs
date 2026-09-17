import fs from 'node:fs';

const files = ['index.html', ...fs.readdirSync('src/components').filter((file) => file.endsWith('.tsx')).map((file) => `src/components/${file}`)];
const source = files.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
const html = fs.readFileSync('index.html', 'utf8');

for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) JSON.parse(match[1]);

const ids = new Set([...source.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
const missingAnchors = [...source.matchAll(/href="#([^"]+)"/g)].map((match) => match[1]).filter((id) => !ids.has(id));
const assets = [...source.matchAll(/["'](\/(?:event|sponsors)\/[^"'?]+|\/christ-exterior\.webp)/g)].map((match) => match[1]);
const missingAssets = assets.filter((asset) => !fs.existsSync(`public${asset}`));

if (missingAnchors.length || missingAssets.length) {
  console.error({ missingAnchors, missingAssets });
  process.exit(1);
}

console.log(`Verified JSON-LD, ${ids.size} section IDs, ${assets.length} local asset references.`);
