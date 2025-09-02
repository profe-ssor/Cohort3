const fs = require('fs');
const path = require('path');

const baseUrl = 'https://nss-dems.vercel.app';
const currentDate = new Date().toISOString().split('T')[0];

// Define your public routes
const publicRoutes = [
  {
    url: '/',
    changefreq: 'weekly',
    priority: '1.0'
  },
  {
    url: '/login',
    changefreq: 'monthly',
    priority: '0.9'
  },
  {
    url: '/signup',
    changefreq: 'monthly',
    priority: '0.8'
  },
  {
    url: '/password-reset',
    changefreq: 'monthly',
    priority: '0.6'
  },
  {
    url: '/nssdb',
    changefreq: 'weekly',
    priority: '0.7'
  }
];

// Routes to exclude (protected/private routes)
const excludedRoutes = [
  '/admin-dashboard',
  '/supervisor-dashboard', 
  '/personnel',
  '/otp-verify',
  '/resend-otp',
  '/change-password',
  '/received-messages',
  '/message-detail',
  '/admin'
];

function generateSitemap() {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  publicRoutes.forEach(route => {
    xml += `
  <url>
    <loc>${baseUrl}${route.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`;
  });

  xml += `
</urlset>`;

  return xml;
}

function generateRobotsTxt() {
  return `User-agent: *

# Allow public pages
Allow: /
Allow: /login
Allow: /signup
Allow: /password-reset
Allow: /nssdb

# Block protected/private areas
${excludedRoutes.map(route => `Disallow: ${route}`).join('\n')}

# Block sensitive files
Disallow: /*.json$
Disallow: /assets/config/

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml`;
}

function writeFiles() {
  const publicDir = path.join(__dirname, 'public');
  
  // Create public directory if it doesn't exist
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
    console.log('📁 Created public directory');
  }

  // Generate and write sitemap.xml
  const sitemapXML = generateSitemap();
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapXML);
  
  // Generate and write robots.txt
  const robotsTxt = generateRobotsTxt();
  fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt);

  console.log('✅ Sitemap generated: public/sitemap.xml');
  console.log('✅ Robots.txt generated: public/robots.txt');
  console.log(`📍 Sitemap URL: ${baseUrl}/sitemap.xml`);
  console.log(`🤖 Robots URL: ${baseUrl}/robots.txt`);
}

// Run the generator
console.log('🚀 Generating sitemap and robots.txt...');
writeFiles();