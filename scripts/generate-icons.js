const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputSvg = path.join(__dirname, '..', 'app', 'icon.svg');
const outputDir = path.join(__dirname, '..', 'public', 'icons');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const sizes = [72, 96, 128, 144, 152, 192, 384, 512, 1024];

// Regular icons
const generateIcons = async () => {
  console.log('Generating PWA icons...\n');

  // Generate standard icons
  for (const size of sizes) {
    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
    await sharp(inputSvg)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`✓ Generated icon-${size}x${size}.png`);
  }

  // Generate maskable icons (with padding for Android safe area)
  // Maskable icons need 80% safe area, so we resize to 80% and add padding
  const maskableSizes = [192, 512];
  for (const size of maskableSizes) {
    const iconSize = Math.round(size * 0.8); // 80% safe area
    const padding = Math.round((size - iconSize) / 2);
    
    const outputPath = path.join(outputDir, `icon-maskable-${size}x${size}.png`);
    await sharp(inputSvg)
      .resize(iconSize, iconSize)
      .extend({
        top: padding,
        bottom: padding,
        left: padding,
        right: padding,
        background: { r: 30, g: 41, b: 59, alpha: 1 } // #1e293b theme color
      })
      .png()
      .toFile(outputPath);
    console.log(`✓ Generated icon-maskable-${size}x${size}.png`);
  }

  // Generate Apple touch icon (180x180)
  const appleTouchPath = path.join(outputDir, 'apple-touch-icon.png');
  await sharp(inputSvg)
    .resize(180, 180)
    .png()
    .toFile(appleTouchPath);
  console.log('✓ Generated apple-touch-icon.png');

  // Generate favicon.ico (32x32)
  const faviconPath = path.join(outputDir, 'favicon-32x32.png');
  await sharp(inputSvg)
    .resize(32, 32)
    .png()
    .toFile(faviconPath);
  console.log('✓ Generated favicon-32x32.png');

  // Generate shortcut icons (simple colored versions for shortcuts)
  // For now, we'll use the same icon with different backgrounds
  const shortcuts = [
    { name: 'sale', color: { r: 34, g: 197, b: 94 } }, // green
    { name: 'expense', color: { r: 239, g: 68, b: 68 } }, // red
    { name: 'dashboard', color: { r: 59, g: 130, b: 246 } }, // blue
  ];

  for (const shortcut of shortcuts) {
    const iconSize = Math.round(192 * 0.6);
    const padding = Math.round((192 - iconSize) / 2);
    
    const outputPath = path.join(outputDir, `shortcut-${shortcut.name}.png`);
    await sharp(inputSvg)
      .resize(iconSize, iconSize)
      .extend({
        top: padding,
        bottom: padding,
        left: padding,
        right: padding,
        background: { ...shortcut.color, alpha: 1 }
      })
      .png()
      .toFile(outputPath);
    console.log(`✓ Generated shortcut-${shortcut.name}.png`);
  }

  console.log('\n✅ All PWA icons generated successfully!');
};

generateIcons().catch(console.error);
