const fs = require('fs');
const path = require('path');

function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walkDir(file));
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
            results.push(file);
        }
    });
    return results;
}

const srcDir = path.join(__dirname, 'main-featureGlucare', 'src');
const apiFile = path.join(srcDir, 'api.js');
const files = walkDir(srcDir);

files.forEach(file => {
    // Skip api.js and glucareAI.js (glucareAI uses its own axios instance)
    if (file === apiFile || file.includes('glucareAI.js')) return;
    
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    // 1. Replace imports
    if (content.includes("import axios from")) {
        let relativePath = path.relative(path.dirname(file), apiFile).replace(/\\/g, '/');
        if (!relativePath.startsWith('.')) relativePath = './' + relativePath;
        relativePath = relativePath.replace('.js', '');
        
        content = content.replace(/import\s+axios\s+from\s+['"]axios['"];?/g, `import api from "${relativePath}";`);
        changed = true;
    }

    // 2. Replace axios. to api.
    if (content.match(/axios\.(get|post|put|delete)/)) {
        content = content.replace(/axios\.(get|post|put|delete)/g, 'api.$1');
        changed = true;
    }

    // 3. Remove ${import.meta.env.VITE_API_URL}
    if (content.includes("${import.meta.env.VITE_API_URL}")) {
        content = content.replace(/\$\{import\.meta\.env\.VITE_API_URL\}/g, '');
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Refactored ${file}`);
    }
});

console.log("Refactoring complete!");
