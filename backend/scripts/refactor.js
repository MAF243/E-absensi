const fs = require('fs');
const path = require('path');

const controllersDir = path.join(__dirname, '../controllers');
const files = fs.readdirSync(controllersDir).filter(f => f.endsWith('.js'));

files.forEach(file => {
  const filePath = path.join(controllersDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Add AppError import if not present
  if (!content.includes('AppError')) {
    content = "const AppError = require('../utils/AppError');\n" + content;
  }

  // Replace `try {\n` or `try {` with empty
  // Replace `} catch (err) { next(err); }` with empty
  // Replace `} catch(err) { next(err); }` with empty
  // Replace `} catch (error) { next(error); }` with empty
  // Also we need to un-indent the block if we want it to be clean, but just removing try/catch is fine for now, we can format later.
  
  // Actually, we can use regex to remove try/catch
  content = content.replace(/try\s*\{\s*/g, '');
  content = content.replace(/\}\s*catch\s*\([a-zA-Z0-9_]+\)\s*\{\s*next\([a-zA-Z0-9_]+\);\s*\}/g, '');
  
  // Replace `return res.status(400).json({ success: false, message: "something" });`
  // or `return res.status(400).json({ success: false, message: 'something' })`
  // with `throw new AppError("something", 400);`
  content = content.replace(/return\s+res\.status\(([0-9]+)\)\.json\(\{\s*success:\s*false,\s*message:\s*(['"`].*?['"`])\s*\}\);?/g, (match, status, message) => {
    return `throw new AppError(${message}, ${status});`;
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Refactored ${file}`);
  }
});
