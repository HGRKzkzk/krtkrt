#!/usr/bin/env node
/**
 * PR documentation guard: an application source change must include an update
 * to at least one current project contract, unless a maintainer applies an
 * explicit docs-not-needed label after reviewing the justification.
 *
 * Runs with fetch-depth: 0 and pull_request event data. No external packages.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const docs = ['README.md', 'PRODUCT.md', 'ARCHITECTURE.md'];
const needsDocs = (path) => path.startsWith('src/') || path === 'package.json';

const base = process.env.PR_BASE_SHA;
const head = process.env.PR_HEAD_SHA;
const eventPath = process.env.GITHUB_EVENT_PATH;
if (!base || !head || !eventPath) {
  console.error('Documentatiecontrole: PR_BASE_SHA, PR_HEAD_SHA of GITHUB_EVENT_PATH ontbreekt.');
  process.exit(2);
}

let files, event;
try {
  files = execFileSync('git', ['diff', '--name-only', base + '...' + head], { encoding: 'utf8' })
    .split('\n').filter(Boolean);
  event = JSON.parse(readFileSync(eventPath, 'utf8'));
} catch (error) {
  console.error('Documentatiecontrole kan de PR-wijzigingen niet lezen:', error.message);
  process.exit(2);
}

const applicationFiles = files.filter(needsDocs);
const updatedDocs = files.filter((file) => docs.includes(file));
const labels = event.pull_request?.labels ?? [];
const exempt = labels.some((label) => label.name === 'docs-not-needed');

if (applicationFiles.length === 0) {
  console.log('Documentatiecontrole: geen applicatiebron gewijzigd.');
} else if (updatedDocs.length) {
  console.log('Documentatiecontrole: bijgewerkt:', updatedDocs.join(', '));
} else if (exempt) {
  const body = event.pull_request?.body || '';
  if (!/documentatie|docs|readme|architecture|product/i.test(body)) {
    console.error('Label docs-not-needed vereist een documentatiemotivatie in de PR-beschrijving.');
    process.exit(1);
  }
  console.log('Documentatiecontrole: expliciete uitzondering docs-not-needed met motivatie.');
} else {
  console.error('Documentatiecontrole mislukt: de PR wijzigt applicatiebron zonder README.md, PRODUCT.md of ARCHITECTURE.md.');
  console.error('Gewijzigde bronbestanden:', applicationFiles.join(', '));
  console.error('Werk relevante documentatie bij, of vraag na inhoudelijke review de label docs-not-needed aan en motiveer die in de PR.');
  process.exit(1);
}
