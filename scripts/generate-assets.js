import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const PUBLIC_DIR = path.join(process.cwd(), 'public');

// Ensure public directory exists
if (!fs.existsSync(PUBLIC_DIR)) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

// Brand colors
const PINK = '#FF2D92';
const DARK_BG = '#0A0A0F';

// Create SVG logo
const createLogoSVG = (size, padding = 0) => {
  const actualSize = size - padding * 2;
  const iconSize = actualSize * 0.6;
  const iconOffset = (size - iconSize) / 2;
  
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="${DARK_BG}"/>
      <rect x="${padding}" y="${padding}" width="${actualSize}" height="${actualSize}" fill="${PINK}"/>
      <g transform="translate(${iconOffset}, ${iconOffset})">
        <path d="M${iconSize/2} ${iconSize*0.083}L${iconSize*0.083} ${iconSize*0.292}v${iconSize*0.417}l${iconSize*0.417} ${iconSize*0.208} ${iconSize*0.417}-${iconSize*0.208}V${iconSize*0.292}L${iconSize/2} ${iconSize*0.083}zm0 ${iconSize*0.091}l${iconSize*0.288} ${iconSize*0.144}L${iconSize/2} ${iconSize*0.462} ${iconSize*0.212} ${iconSize*0.318} ${iconSize/2} ${iconSize*0.174}zM${iconSize*0.167} ${iconSize*0.371}l${iconSize*0.292} ${iconSize*0.146}v${iconSize*0.303}l-${iconSize*0.292}-${iconSize*0.146}V${iconSize*0.371}zm${iconSize*0.375} ${iconSize*0.449}V${iconSize*0.517}l${iconSize*0.292}-${iconSize*0.146}v${iconSize*0.303}l-${iconSize*0.292} ${iconSize*0.146}z" fill="white"/>
      </g>
    </svg>
  `;
};

// Create simple geometric logo for favicons
const createSimpleLogo = (size) => {
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="${PINK}"/>
      <g transform="translate(${size * 0.2}, ${size * 0.2})">
        <path d="M${size*0.3} ${size*0.05}L${size*0.05} ${size*0.175}v${size*0.25}l${size*0.25} ${size*0.125} ${size*0.25}-${size*0.125}V${size*0.175}L${size*0.3} ${size*0.05}zm0 ${size*0.055}l${size*0.173} ${size*0.086}L${size*0.3} ${size*0.277} ${size*0.127} ${size*0.191} ${size*0.3} ${size*0.105}zM${size*0.1} ${size*0.223}l${size*0.175} ${size*0.088}v${size*0.182}l-${size*0.175}-${size*0.088}V${size*0.223}zm${size*0.225} ${size*0.27}V${size*0.31}l${size*0.175}-${size*0.088}v${size*0.182}l-${size*0.175} ${size*0.088}z" fill="white"/>
      </g>
    </svg>
  `;
};

// Create Open Graph image (1200x630)
const createOGImage = () => {
  return `
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0A0A0F"/>
          <stop offset="50%" style="stop-color:#12121A"/>
          <stop offset="100%" style="stop-color:#0A0A0F"/>
        </linearGradient>
        <linearGradient id="pinkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#FF2D92"/>
          <stop offset="100%" style="stop-color:#FF0066"/>
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="1200" height="630" fill="url(#bgGrad)"/>
      
      <!-- Grid pattern -->
      <g opacity="0.03">
        ${Array.from({ length: 20 }, (_, i) => `<line x1="${i * 60}" y1="0" x2="${i * 60}" y2="630" stroke="white" stroke-width="1"/>`).join('')}
        ${Array.from({ length: 11 }, (_, i) => `<line x1="0" y1="${i * 60}" x2="1200" y2="${i * 60}" stroke="white" stroke-width="1"/>`).join('')}
      </g>
      
      <!-- Corner accents -->
      <path d="M0 0 L80 0 L80 3 L3 3 L3 80 L0 80 Z" fill="#00F0FF" opacity="0.3"/>
      <path d="M1200 0 L1120 0 L1120 3 L1197 3 L1197 80 L1200 80 Z" fill="#FF2D92" opacity="0.3"/>
      <path d="M0 630 L80 630 L80 627 L3 627 L3 550 L0 550 Z" fill="#FFE14D" opacity="0.3"/>
      <path d="M1200 630 L1120 630 L1120 627 L1197 627 L1197 550 L1200 550 Z" fill="#00FF94" opacity="0.3"/>
      
      <!-- Logo box -->
      <rect x="100" y="215" width="120" height="120" fill="${PINK}"/>
      <g transform="translate(130, 245)">
        <path d="M30 5L5 17.5v25l25 12.5 25-12.5v-25L30 5zm0 5.45l17.25 8.625L30 27.7l-17.25-8.625L30 10.45zM10 22.3l17.5 8.75v18.2l-17.5-8.75V22.3zm22.5 26.95V31.05l17.5-8.75v18.2l-17.5 8.75z" fill="white"/>
      </g>
      
      <!-- Text -->
      <text x="250" y="260" font-family="system-ui, -apple-system, sans-serif" font-size="72" font-weight="800" fill="white">
        SOL<tspan fill="${PINK}">X</tspan>LOG
      </text>
      <text x="250" y="310" font-family="monospace" font-size="24" fill="#A0A0B0" letter-spacing="0.2em">
        TRANSACTION EXPLORER
      </text>
      
      <!-- Tagline -->
      <text x="100" y="480" font-family="system-ui, -apple-system, sans-serif" font-size="32" fill="#E0E0E0">
        Debug Solana transactions with clarity
      </text>
      
      <!-- Features -->
      <g transform="translate(100, 520)">
        <rect x="0" y="0" width="8" height="8" fill="#00F0FF"/>
        <text x="20" y="8" font-family="monospace" font-size="14" fill="#A0A0B0">PROGRAM CALLS</text>
        
        <rect x="180" y="0" width="8" height="8" fill="#FFE14D"/>
        <text x="200" y="8" font-family="monospace" font-size="14" fill="#A0A0B0">COMPUTE UNITS</text>
        
        <rect x="380" y="0" width="8" height="8" fill="#FF2D92"/>
        <text x="400" y="8" font-family="monospace" font-size="14" fill="#A0A0B0">ERROR TRACKING</text>
        
        <rect x="580" y="0" width="8" height="8" fill="#00FF94"/>
        <text x="600" y="8" font-family="monospace" font-size="14" fill="#A0A0B0">CALL HIERARCHY</text>
      </g>
      
      <!-- URL -->
      <text x="1100" y="590" font-family="monospace" font-size="16" fill="#606070" text-anchor="end">
        solxlog.dev
      </text>
    </svg>
  `;
};

// Create Twitter card image (1200x600)
const createTwitterImage = () => {
  return `
    <svg width="1200" height="600" viewBox="0 0 1200 600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0A0A0F"/>
          <stop offset="100%" style="stop-color:#12121A"/>
        </linearGradient>
      </defs>
      
      <rect width="1200" height="600" fill="url(#bgGrad2)"/>
      
      <!-- Centered content -->
      <g transform="translate(300, 200)">
        <!-- Logo -->
        <rect x="0" y="0" width="100" height="100" fill="${PINK}"/>
        <g transform="translate(25, 25)">
          <path d="M25 4L4 14.5v21l21 10.5 21-10.5v-21L25 4zm0 4.5l14.4 7.2L25 22.9l-14.4-7.2L25 8.5zM8 18.5l14.6 7.3v15.2l-14.6-7.3V18.5zm18.8 22.5V26.8l14.6-7.3v15.2l-14.6 7.3z" fill="white"/>
        </g>
        
        <!-- Text -->
        <text x="130" y="45" font-family="system-ui, sans-serif" font-size="56" font-weight="800" fill="white">
          SOL<tspan fill="${PINK}">X</tspan>LOG
        </text>
        <text x="130" y="85" font-family="monospace" font-size="18" fill="#A0A0B0" letter-spacing="0.15em">
          TRANSACTION EXPLORER
        </text>
      </g>
      
      <text x="600" y="400" font-family="system-ui, sans-serif" font-size="28" fill="#E0E0E0" text-anchor="middle">
        Debug Solana transactions with clarity
      </text>
    </svg>
  `;
};

async function generateAssets() {
  console.log('Generating assets...\n');

  // Generate favicons
  const sizes = [16, 32, 48, 64, 96, 128, 192, 256, 384, 512];
  
  for (const size of sizes) {
    const svg = createSimpleLogo(size);
    await sharp(Buffer.from(svg))
      .png()
      .toFile(path.join(PUBLIC_DIR, `favicon-${size}x${size}.png`));
    console.log(`✓ Generated favicon-${size}x${size}.png`);
  }

  // Generate main favicon.ico (multi-size)
  const favicon32 = await sharp(Buffer.from(createSimpleLogo(32))).png().toBuffer();
  await sharp(favicon32).toFile(path.join(PUBLIC_DIR, 'favicon.ico'));
  console.log('✓ Generated favicon.ico');

  // Generate Apple touch icons
  const appleSizes = [120, 152, 167, 180];
  for (const size of appleSizes) {
    const svg = createSimpleLogo(size);
    await sharp(Buffer.from(svg))
      .png()
      .toFile(path.join(PUBLIC_DIR, `apple-touch-icon-${size}x${size}.png`));
    console.log(`✓ Generated apple-touch-icon-${size}x${size}.png`);
  }

  // Main apple touch icon
  const appleIcon = createSimpleLogo(180);
  await sharp(Buffer.from(appleIcon))
    .png()
    .toFile(path.join(PUBLIC_DIR, 'apple-touch-icon.png'));
  console.log('✓ Generated apple-touch-icon.png');

  // Generate Open Graph image
  const ogSvg = createOGImage();
  await sharp(Buffer.from(ogSvg))
    .png()
    .toFile(path.join(PUBLIC_DIR, 'og-image.png'));
  console.log('✓ Generated og-image.png (1200x630)');

  // Generate Twitter card image
  const twitterSvg = createTwitterImage();
  await sharp(Buffer.from(twitterSvg))
    .png()
    .toFile(path.join(PUBLIC_DIR, 'twitter-image.png'));
  console.log('✓ Generated twitter-image.png (1200x600)');

  // Generate logo variants
  const logoSvg = createLogoSVG(512, 40);
  await sharp(Buffer.from(logoSvg))
    .png()
    .toFile(path.join(PUBLIC_DIR, 'logo-512.png'));
  console.log('✓ Generated logo-512.png');

  const logoSmall = createLogoSVG(192, 16);
  await sharp(Buffer.from(logoSmall))
    .png()
    .toFile(path.join(PUBLIC_DIR, 'logo-192.png'));
  console.log('✓ Generated logo-192.png');

  // Generate maskable icon for PWA
  const maskableSvg = `
    <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <rect width="512" height="512" fill="${PINK}"/>
      <g transform="translate(156, 156)">
        <path d="M100 16L16 58v84l84 42 84-42V58L100 16zm0 18l57.5 28.75L100 91.5l-57.5-28.75L100 34zM33 74l58 29v60.67L33 134V74zm75 89.67V104l58-29v60l-58 29z" fill="white"/>
      </g>
    </svg>
  `;
  await sharp(Buffer.from(maskableSvg))
    .png()
    .toFile(path.join(PUBLIC_DIR, 'maskable-icon-512.png'));
  console.log('✓ Generated maskable-icon-512.png');

  // Update the SVG logo
  const svgLogo = `<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
  <rect width="40" height="40" fill="${PINK}"/>
  <path d="M20 6.67L6.67 13.33v13.34L20 33.33l13.33-6.66V13.33L20 6.67zm0 3l8.88 4.44L20 18.55l-8.88-4.44L20 9.67zM10 15.33l8.67 4.34v8.88L10 24.21v-8.88zm11.33 13.22v-8.88l8.67-4.34v8.88l-8.67 4.34z" fill="white"/>
</svg>`;
  fs.writeFileSync(path.join(PUBLIC_DIR, 'logo.svg'), svgLogo);
  console.log('✓ Generated logo.svg');

  // Generate web manifest
  const manifest = {
    name: 'SOLXLOG - Solana Transaction Explorer',
    short_name: 'SOLXLOG',
    description: 'Debug Solana transactions with clarity. Analyze execution flow, compute usage, and errors in a structured timeline view.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0A0A0F',
    theme_color: '#FF2D92',
    icons: [
      { src: '/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/favicon-512x512.png', sizes: '512x512', type: 'image/png' },
      { src: '/maskable-icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
  fs.writeFileSync(path.join(PUBLIC_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log('✓ Generated manifest.json');

  console.log('\n✅ All assets generated successfully!');
}

generateAssets().catch(console.error);
