const fs = require('fs');
const path = require('path');

const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.html') || file.endsWith('.js')) {
        results.push(file);
      }
    }
  });
  return results;
};

const files = walk(path.join(__dirname, '../frontend'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Replacements
  if (content.includes('companyId?.id')) { content = content.replace(/companyId\?\.id/g, 'CompanyId'); changed = true; }
  if (content.includes('companyId?.companyName')) { content = content.replace(/companyId\?\.companyName/g, 'Company?.companyName'); changed = true; }
  if (content.includes('companyId?.jobRole')) { content = content.replace(/companyId\?\.jobRole/g, 'Company?.jobRole'); changed = true; }
  if (content.includes('companyId?.salaryPackage')) { content = content.replace(/companyId\?\.salaryPackage/g, 'Company?.salaryPackage'); changed = true; }
  if (content.includes('companyId.salaryPackage')) { content = content.replace(/companyId\.salaryPackage/g, 'Company.salaryPackage'); changed = true; }
  
  if (content.includes('studentId?.name')) { content = content.replace(/studentId\?\.name/g, 'Student?.name'); changed = true; }
  if (content.includes('studentId?.cgpa')) { content = content.replace(/studentId\?\.cgpa/g, 'Student?.cgpa'); changed = true; }

  // Admin dashboard uses populated objects?
  if (content.includes('userId?.email')) { content = content.replace(/userId\?\.email/g, 'User?.email'); changed = true; }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
