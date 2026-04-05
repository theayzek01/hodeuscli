const fs = require('fs');
const path = require('path');

const webUiSrc = path.join(process.cwd(), 'packages', 'web-ui', 'src');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const allFiles = walk(webUiSrc);

allFiles.forEach(filePath => {
    // Read as buffer first to avoid encoding issues during read
    const buffer = fs.readFileSync(filePath);
    let content = buffer.toString('utf8');
    let original = content;

    // 1. Fix character corruption - Use very specific regex
    // These are the raw byte sequences for corrupted characters
    content = content.replace(/├ó┼ôÔÇö/g, '✗');
    content = content.replace(/âœ—/g, '✗');
    content = content.replace(/âœ“/g, '✓');
    content = content.replace(/â€¢/g, '•');
    content = content.replace(/Ô£ô/g, '✓');
    
    // Also handle possible double-corruptions or UTF-8 literal mismatches
    content = content.replace(/\u00E2\u0153\u2014/g, '✗');
    content = content.replace(/\u00E2\u0153\u2013/g, '✓');

    // 2. Fix artifact paths
    const normalizedPath = filePath.replace(/\\/g, '/');
    if (normalizedPath.includes('/tools/artifacts/')) {
        if (content.includes("'../vendor/mini-lit/dist/")) {
            console.log(`[PATH FIX] ${normalizedPath}`);
            content = content.replace(/'\.\.\/vendor\/mini-lit\/dist\//g, "'../../vendor/mini-lit/dist/");
        }
    }

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`[PATCHED] ${normalizedPath}`);
    }
});

console.log('Patching complete.');
