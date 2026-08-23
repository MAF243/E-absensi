const fs = require('fs');
const path = require('path');

const dir = 'c:/laragon/www/E-absensi/frontend/src/';

const files = [
  'pages/dosen/DosenDashboard.jsx',
  'pages/dosen/RiwayatMengajar.jsx',
  'components/dosen/DosenClassCard.jsx',
  'components/dosen/OpenSessionModal.jsx'
];

files.forEach(file => {
  const filePath = path.join(dir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace hardcoded dark indigo with blue-900
    content = content.replace(/bg-\[#1e1b4b\]/g, 'bg-blue-900');
    
    // Replace indigo with blue for Tailwind classes
    content = content.replace(/indigo-/g, 'blue-');
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file} to match Academic Blue.`);
  }
});
