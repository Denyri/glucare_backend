const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'main-featureGlucare', 'src');

const filesToFix = [
    'pages/Pencapaian.jsx',
    'pages/Dashboard.jsx',
    'components/StatsCard.jsx'
];

filesToFix.forEach(file => {
    const filePath = path.join(srcDir, file);
    if(fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Replace all fetch(`/api/plan/...`) with fetch(`${import.meta.env.VITE_API_URL}/api/plan/...`)
        content = content.replace(/fetch\(\s*`\/api\/plan\//g, 'fetch(`${import.meta.env.VITE_API_URL}/api/plan/');
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed ${file}`);
    }
});
