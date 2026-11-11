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

function parseIssueBody(body) {
    const name = extractField(body, 'Resource Name');
    const url = extractField(body, 'URL');
    const categorySelection = extractField(body, 'Category / Section');
    const description = extractField(body, 'Description');
    const tagsRaw = extractField(body, 'Tags');

    if (!name || !url || !categorySelection) {
        throw new Error('Missing required fields: Resource Name, URL, or Category / Section.');
    }

    if (!/^https?:\/\//i.test(url)) {
        throw new Error(`Invalid URL format: "${url}". Must start with http:// or https://`);
    }

    const tags = tagsRaw
        ? tagsRaw
            .split(',')
            .map(t => t.trim().toLowerCase().replace(/[^a-z0-9_-]/g, ''))
            .filter(Boolean)
        : [];

    return { name, url, categorySelection, description, tags };
}

function mapCategory(selection) {
    const map = {
        'Reading - Ebooks': { catId: 'reading', subId: 'ebooks' },
        'Reading - Manga': { catId: 'reading', subId: 'manga' },
        'Reading - Novels': { catId: 'reading', subId: 'novels' },
        'Streaming - Anime': { catId: 'streaming', subId: 'anime' },
        'Streaming - Movies': { catId: 'streaming', subId: 'movies' },
        'Streaming - Sports': { catId: 'streaming', subId: 'sports' },
        'Streaming - IPTV': { catId: 'streaming', subId: 'iptv' },
        'Software': { catId: 'software', subId: null },
        'Games - Cracked': { catId: 'games', subId: 'cracked' },
        'Games - Tools': { catId: 'games', subId: 'tools' },
        'Domains': { catId: 'domains', subId: null },
        'Domains - Offers': { catId: 'domains', subId: null },
        'Domains - Subdomains': { catId: 'domains', subId: null },
        'Communities - Reddit': { catId: 'communities', subId: 'reddit' },
        'Communities - Discord': { catId: 'communities', subId: 'discord' },
        'Directories': { catId: 'directories', subId: null },
    };

    // Attempt exact match
    if (map[selection]) return map[selection];

    // Attempt fuzzy match
    for (const [key, val] of Object.entries(map)) {
        if (selection.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(selection.toLowerCase())) {
            return val;
        }
    }

    // Default fallback to directories if unrecognized
    return { catId: 'directories', subId: null };
}

function main() {
    const issueBody = process.env.ISSUE_BODY;
    if (!issueBody) {
        console.error('ERROR: ISSUE_BODY environment variable is empty.');
        process.exit(1);
    }

    const { name, url, categorySelection, description, tags } = parseIssueBody(issueBody);
    const { catId, subId } = mapCategory(categorySelection);

    const rawData = fs.readFileSync(LINKS_FILE, 'utf8');
    const parsed = JSON.parse(rawData);
    const isRootArray = Array.isArray(parsed);
    const linksData = isRootArray ? parsed : (parsed.categories || []);

    // Check for duplicate URL across all items
    let duplicate = null;
    for (const cat of linksData) {
        if (cat.links) {
            duplicate = cat.links.find(l => (l.url && l.url.toLowerCase() === url.toLowerCase()) || (l.urls && l.urls.map(u => u.toLowerCase()).includes(url.toLowerCase())));
        }
        if (!duplicate && cat.subcategories) {
            for (const sub of cat.subcategories) {
                duplicate = sub.links.find(l => (l.url && l.url.toLowerCase() === url.toLowerCase()) || (l.urls && l.urls.map(u => u.toLowerCase()).includes(url.toLowerCase())));
                if (duplicate) break;
            }
        }
        if (duplicate) break;
    }

    if (duplicate) {
        console.log(`Resource URL already exists: "${duplicate.name}" (${url}).`);
        // If duplicate, output message and exit without failure
        if (process.env.GITHUB_OUTPUT) {
            fs.appendFileSync(process.env.GITHUB_OUTPUT, `status=duplicate\nname=${name}\nurl=${url}\n`);
        }
        return;
    }

    const newLink = {
        name,
        url,
        tags,
        description,
    };

    // Find category
    let targetCat = linksData.find(c => c.id === catId);
    if (!targetCat) {
        targetCat = linksData[0]; // fallback
    }

    if (subId && targetCat.subcategories) {
        let targetSub = targetCat.subcategories.find(s => s.id === subId);
        if (!targetSub) {
            targetSub = targetCat.subcategories[0];
        }
        targetSub.links.push(newLink);
        console.log(`Added "${name}" to ${targetCat.category} -> ${targetSub.label}`);
    } else {
        if (!targetCat.links) targetCat.links = [];
        targetCat.links.push(newLink);
        console.log(`Added "${name}" to ${targetCat.category}`);
    }

    const outputData = isRootArray ? linksData : { ...parsed, categories: linksData };
    fs.writeFileSync(LINKS_FILE, JSON.stringify(outputData, null, 2) + '\n');
    console.log(`Successfully updated ${LINKS_FILE}`);

    if (process.env.GITHUB_OUTPUT) {
        fs.appendFileSync(process.env.GITHUB_OUTPUT, `status=added\nname=${name}\nurl=${url}\ncat=${targetCat.category}\n`);
    }
}

try {
    main();
} catch (err) {
    console.error(`ERROR: ${err.message}`);
    process.exit(1);
}
