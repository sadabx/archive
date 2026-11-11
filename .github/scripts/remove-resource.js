#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const LINKS_FILE = path.join(__dirname, '../../src/data/links.json');

function extractField(body, header) {
    const escaped = header.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`###\\s+${escaped}\\s*\\n+([\\s\\S]*?)(?=\\n###|$)`, 'i');
    const match = body.match(regex);
    if (!match) return '';
    return match[1].trim();
}

function normalizeUrl(url) {
    return (url || '').trim().toLowerCase().replace(/\/+$/, '').replace(/^https?:\/\//, '');
}

function main() {
    const issueBody = process.env.ISSUE_BODY;
    if (!issueBody) {
        console.error('ERROR: ISSUE_BODY environment variable is empty.');
        process.exit(1);
    }

    const name = extractField(issueBody, 'Resource Name');
    const url = extractField(issueBody, 'Resource URL');

    if (!name && !url) {
        console.error('ERROR: Could not find Resource Name or Resource URL in issue body.');
        process.exit(1);
    }

    const targetNormUrl = normalizeUrl(url);
    const targetName = name.trim().toLowerCase();

    const rawData = fs.readFileSync(LINKS_FILE, 'utf8');
    const parsed = JSON.parse(rawData);
    const isRootArray = Array.isArray(parsed);
    const linksData = isRootArray ? parsed : (parsed.categories || []);

    let removedItem = null;

    function matches(link) {
        if (targetNormUrl) {
            if (link.url && normalizeUrl(link.url) === targetNormUrl) return true;
            if (link.urls && link.urls.some(u => normalizeUrl(u) === targetNormUrl)) return true;
        }
        if (targetName && link.name && link.name.trim().toLowerCase() === targetName) {
            return true;
        }
        return false;
    }

    for (const cat of linksData) {
        if (cat.links) {
            const initialLen = cat.links.length;
            const found = cat.links.find(matches);
            if (found) {
                removedItem = found;
                cat.links = cat.links.filter(l => !matches(l));
                console.log(`Removed "${removedItem.name}" from ${cat.category}`);
                break;
            }
        }
        if (cat.subcategories) {
            for (const sub of cat.subcategories) {
                const found = sub.links.find(matches);
                if (found) {
                    removedItem = found;
                    sub.links = sub.links.filter(l => !matches(l));
                    console.log(`Removed "${removedItem.name}" from ${cat.category} -> ${sub.label}`);
                    break;
                }
            }
            if (removedItem) break;
        }
    }

    if (!removedItem) {
        console.log(`No resource matched Name="${name}" or URL="${url}".`);
        if (process.env.GITHUB_OUTPUT) {
            fs.appendFileSync(process.env.GITHUB_OUTPUT, `status=not_found\n`);
        }
        return;
    }

    const outputData = isRootArray ? linksData : { ...parsed, categories: linksData };
    fs.writeFileSync(LINKS_FILE, JSON.stringify(outputData, null, 2) + '\n');
    console.log(`Successfully updated ${LINKS_FILE}`);

    if (process.env.GITHUB_OUTPUT) {
        fs.appendFileSync(process.env.GITHUB_OUTPUT, `status=removed\nname=${removedItem.name}\nurl=${url || removedItem.url}\n`);
    }
}

try {
    main();
} catch (err) {
    console.error(`ERROR: ${err.message}`);
    process.exit(1);
}
