const fs = require('fs');
const path = require('path');

function findAndReplace(dir, searchStr, replaceStr) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') {
                findAndReplace(filePath, searchStr, replaceStr);
            }
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
            let content = fs.readFileSync(filePath, 'utf8');
            if (content.includes(searchStr)) {
                content = content.replaceAll(searchStr, replaceStr);
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`Updated ${filePath}`);
            }
        }
    });
}

const targetDir = path.join(__dirname, 'main-featureGlucare');
findAndReplace(targetDir, 'http://43.156.16.175:5000', 'https://nusahealth.infinitelearningstudent.id');
console.log('Selesai!');
