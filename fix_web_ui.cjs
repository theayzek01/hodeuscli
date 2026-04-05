const fs = require('fs');
const path = require('path');

const webUiSrc = path.join(process.cwd(), 'packages', 'web-ui', 'src');

function walk(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(filePath));
        } else {
            if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
                results.push(filePath);
            }
        }
    });
    return results;
}

const allFiles = walk(webUiSrc);
console.log(`Scanning ${allFiles.length} files...`);

allFiles.forEach(filePath => {
    const buffer = fs.readFileSync(filePath);
    let content = buffer.toString('utf8');
    let original = content;

    // 1. Fix character corruption (Global)
    content = content.replace(/├ó┼ôÔÇö/g, '✗');
    content = content.replace(/âœ—/g, '✗');
    content = content.replace(/âœ“/g, '✓');
    content = content.replace(/â€¢/g, '•');
    content = content.replace(/Ô£ô/g, '✓');

    // 2. Fix artifact paths (Double Quote and Generic)
    const normalizedPath = filePath.replace(/\\/g, '/');
    if (normalizedPath.includes('/tools/artifacts/')) {
        // Change "../vendor/..." to "../../vendor/..." for all quote types
        const needsFix = /['"]\.\.\/vendor\/mini-lit\/dist\//.test(content);
        if (needsFix) {
            console.log(`[PATH FIXING] ${normalizedPath}`);
            // Replace both single and double quotes
            content = content.replace(/(['"])\.\.\/vendor\/mini-lit\/dist\//g, "$1../../vendor/mini-lit/dist/");
        }
    }

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`[PATCHED] ${normalizedPath}`);
    }
});

console.log('Final patch complete.');
