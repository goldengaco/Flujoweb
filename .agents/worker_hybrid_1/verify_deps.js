const fs = require('fs');
const path = require('path');

const htmlPath = path.resolve(__dirname, '../../sistemas/apigee-mulesoft-hybrid/index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

// Check external scripts or stylesheets except fonts.googleapis.com / fonts.gstatic.com
const scriptSrcs = [...html.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)].map(m => m[1]);
const linkHrefs = [...html.matchAll(/<link[^>]+href=["']([^"']+)["']/gi)].map(m => m[1]);

console.log('Script tags with src:', scriptSrcs);
console.log('Link tags with href:', linkHrefs);

const unauthorizedLinks = linkHrefs.filter(href => !href.includes('fonts.googleapis.com') && !href.includes('fonts.gstatic.com'));

if (scriptSrcs.length === 0 && unauthorizedLinks.length === 0) {
  console.log('ZERO DEPENDENCY CHECK PASSED: Only Google Fonts are linked!');
} else {
  console.error('UNAUTHORIZED EXTERNAL DEPENDENCIES FOUND:', { scriptSrcs, unauthorizedLinks });
  process.exit(1);
}
