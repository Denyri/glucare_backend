const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'main-featureGlucare', 'src');

const replacements = [
    {
        file: 'pages/SettingAndProfile.jsx',
        from: 'src={profile?.profile_image ? `${profile.profile_image}` : defaultAvatar}',
        to: 'src={profile?.profile_image ? `${import.meta.env.VITE_API_URL}${profile.profile_image}` : defaultAvatar}'
    },
    {
        file: 'pages/Dashboard.jsx',
        from: 'src={currentUser?.profile_image ? `${currentUser.profile_image}` : defaultAvatar}',
        to: 'src={currentUser?.profile_image ? `${import.meta.env.VITE_API_URL}${currentUser.profile_image}` : defaultAvatar}'
    },
    {
        file: 'components/Sidebar.jsx',
        from: 'src={currentUser?.profile_image ? `${currentUser.profile_image}` : defaultProfile}',
        to: 'src={currentUser?.profile_image ? `${import.meta.env.VITE_API_URL}${currentUser.profile_image}` : defaultProfile}'
    },
    {
        file: 'pages/EditProfile.jsx',
        from: 'setPreview(`${user.profile_image}`);',
        to: 'setPreview(user.profile_image.startsWith("http") ? user.profile_image : `${import.meta.env.VITE_API_URL}${user.profile_image}`);'
    }
];

replacements.forEach(r => {
    const filePath = path.join(srcDir, r.file);
    if(fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        content = content.replace(r.from, r.to);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed ${r.file}`);
    }
});
