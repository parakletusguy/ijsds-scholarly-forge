const fs = require('fs');

try {
  let code = fs.readFileSync('src/App.tsx', 'utf-8');

  // Add React lazy and Suspense if missing
  if (!code.includes("import React, { lazy, Suspense }")) {
    code = `import React, { lazy, Suspense } from 'react';\n` + code;
  }

  // Find all route imports
  const importRegex = /import\s+({?\s*[a-zA-Z0-9_]+\s*}?)\s+from\s+['"](.\/pages\/.*?|.\/components\/blog\/.*?|.\/components\/partners\/.*?|.\/components\/revisions\/.*?)['"];/g;
  
  let matches;
  let newCode = code;

  while ((matches = importRegex.exec(code)) !== null) {
    const fullStatement = matches[0];
    const importName = matches[1];
    const path = matches[2];
    
    let lazyStatement = '';
    if (importName.includes('{')) {
      const name = importName.replace(/[{}]/g, '').trim();
      lazyStatement = `const ${name} = lazy(() => import('${path}').then(m => ({ default: m.${name} })));`;
    } else {
      lazyStatement = `const ${importName.trim()} = lazy(() => import('${path}'));`;
    }
    
    newCode = newCode.replace(fullStatement, lazyStatement);
  }

  // Wrap Routes in Suspense boundary
  if (!newCode.includes('<Suspense')) {
    newCode = newCode.replace(
      /<Routes>/,
      `<Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>\n              <Routes>`
    );
    newCode = newCode.replace(
      /<\/Routes>/,
      `</Routes>\n              </Suspense>`
    );
  }

  fs.writeFileSync('src/App.tsx', newCode);
  console.log('Successfully transformed App.tsx with React.lazy and Suspense.');
} catch(e) {
  console.error(e);
}
