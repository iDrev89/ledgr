# PWA Testing Guide for Ledgrly

This document provides instructions for testing the Progressive Web App (PWA) implementation of Ledgrly.

## Prerequisites

- **HTTPS Connection**: PWA features only work over HTTPS (or localhost for development)
- **Modern Browser**: Chrome 90+, Safari 16.4+, or Firefox 90+
- **Mobile Devices**: iOS 16.4+ or Android 5.0+

## Local Testing

### 1. Build and Run Production Build

PWA features are disabled in development mode. To test, you need to build and run the production version:

```bash
# Build the application
pnpm build

# Start the production server
pnpm start
```

Access the app at `http://localhost:3000`

### 2. Test with Chrome DevTools

1. Open Chrome DevTools (F12)
2. Go to the **Application** tab
3. Check the following sections:

#### Manifest

- Verify all fields are populated correctly
- Check that icons appear in all sizes
- Confirm theme colors match your brand

#### Service Workers

- Verify the service worker is registered and activated
- Check for any errors in the console
- Test the "Update on reload" option

#### Cache Storage

- Verify workbox caches are created
- Check that assets are being cached
- Test offline functionality by going offline in DevTools

## Testing Checklist

### ✅ Installation

**Desktop (Chrome/Edge)**
- [ ] Click install icon in address bar
- [ ] App installs and opens in standalone window
- [ ] App icon appears in Start Menu/Applications

**Android**
- [ ] Visit site in Chrome
- [ ] Install prompt appears automatically
- [ ] Tap "Install" or use "Add to Home Screen" from menu
- [ ] App icon appears on home screen
- [ ] Opens in fullscreen without browser UI

**iOS (Safari)**
- [ ] Visit site in Safari
- [ ] Tap Share button
- [ ] Select "Add to Home Screen"
- [ ] App icon appears on home screen
- [ ] Opens without Safari UI

### ✅ Offline Functionality

**Test Offline Mode**
- [ ] Open the app while online
- [ ] Browse different pages to cache them
- [ ] Turn off network (DevTools > Network > Offline)
- [ ] Navigate through cached pages
- [ ] Verify UI shows "offline" indicator
- [ ] Try to create a sale/expense (should queue)
- [ ] Reconnect network
- [ ] Verify queued operations sync automatically
- [ ] Check "online" indicator appears

**Test Offline Queue**
- [ ] Go offline
- [ ] Create a new sale or expense
- [ ] Check IndexedDB (Application > IndexedDB > LedgrDB)
- [ ] Verify operation is in offlineOperations table
- [ ] Go back online
- [ ] Verify operation syncs and appears in database
- [ ] Check operation is removed from queue

### ✅ Performance

**Lighthouse Audit** (Chrome DevTools)
- [ ] Open DevTools > Lighthouse
- [ ] Select "Progressive Web App" category
- [ ] Run audit
- [ ] Target: Score 100/100
- [ ] Fix any issues reported

**Key Metrics to Check:**
- First Contentful Paint: < 2s
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3s
- Speed Index: < 3s

### ✅ Manifest & Icons

**Icon Display**
- [ ] App icon displays correctly on home screen
- [ ] Splash screen shows correct icon and colors
- [ ] Maskable icons display properly on Android

**Shortcuts (Android)**
- [ ] Long-press app icon
- [ ] Verify shortcuts appear (Nueva Venta, Registrar Gasto, Dashboard)
- [ ] Tap each shortcut and verify correct page opens

### ✅ App Behavior

**Standalone Mode**
- [ ] App opens without browser UI
- [ ] Status bar color matches theme
- [ ] Navigation works within app
- [ ] External links open in browser

**Theme**
- [ ] Light mode theme color correct
- [ ] Dark mode theme color correct
- [ ] System theme preference respected

**Updates**
- [ ] Make a change and rebuild
- [ ] Refresh app in standalone mode
- [ ] Verify update prompt appears (if implemented)
- [ ] Update applies correctly

### ✅ Network Strategies

**Test Caching Strategies**
- [ ] API calls: Network-first (fresh data when online)
- [ ] Images: Cache-first (fast loading)
- [ ] Static assets: Stale-while-revalidate

**Test in DevTools:**
1. Network tab > Throttling > Slow 3G
2. Navigate the app
3. Verify acceptable performance
4. Check cache hits in Application > Cache Storage

## Validation Tools

### PWA Builder

1. Visit https://www.pwabuilder.com/
2. Enter your production URL
3. Scan the site
4. Review report and address any issues
5. Target: All checks passing

### Lighthouse CI

Run automated Lighthouse tests:

```bash
# Install Lighthouse CI
npm install -g @lhci/cli

# Run audit
lhci autorun --url=http://localhost:3000
```

### Manual Testing Checklist

Print and complete this checklist:

```
Date: __________  Tester: __________

[ ] Manifest loads correctly
[ ] Service worker registers
[ ] App installs on Chrome Desktop
[ ] App installs on Chrome Android
[ ] App installs on Safari iOS
[ ] Offline indicator appears when offline
[ ] Install prompt appears when available
[ ] Offline queue works correctly
[ ] Operations sync when back online
[ ] Icons display correctly
[ ] Shortcuts work (Android)
[ ] Theme colors correct
[ ] Lighthouse PWA score: 100
[ ] Performance acceptable on slow 3G
[ ] No console errors in standalone mode
```

## Common Issues & Solutions

### Issue: Service Worker Not Registering

**Solution:**
- Ensure you're using HTTPS or localhost
- Clear browser cache and hard reload
- Check for console errors
- Verify service worker file is accessible

### Issue: Install Prompt Not Showing

**Solution:**
- Ensure all PWA requirements are met
- Check that user hasn't dismissed it before
- Clear browser data and revisit
- Verify manifest is valid

### Issue: Offline Mode Not Working

**Solution:**
- Check service worker is active
- Verify cache strategies in next.config.mjs
- Check Network tab for failed requests
- Clear cache and try again

### Issue: Icons Not Displaying

**Solution:**
- Verify icons exist in /public/icons/
- Check manifest.ts icon paths
- Ensure icons are correct sizes
- Clear app cache and reinstall

## Production Deployment Checklist

Before deploying to production:

- [ ] Set up HTTPS with valid SSL certificate
- [ ] Verify all environment variables are set
- [ ] Test on real devices (iOS and Android)
- [ ] Run full Lighthouse audit
- [ ] Test offline functionality thoroughly
- [ ] Verify manifest domain matches production URL
- [ ] Check analytics tracking (if implemented)
- [ ] Test update mechanism
- [ ] Verify error tracking (Sentry, etc.)
- [ ] Document any platform-specific limitations

## Browser Support

| Feature | Chrome | Edge | Safari | Firefox |
|---------|--------|------|--------|---------|
| Install | ✅ 90+ | ✅ 90+ | ✅ 16.4+ | ⚠️ Limited |
| Offline | ✅ | ✅ | ✅ | ✅ |
| Push Notifications | ✅ | ✅ | ✅ 16.4+ | ✅ |
| Shortcuts | ✅ | ✅ | ❌ | ❌ |
| Maskable Icons | ✅ | ✅ | ❌ | ❌ |

## Resources

- [PWA Builder](https://www.pwabuilder.com/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Web.dev PWA Guide](https://web.dev/progressive-web-apps/)
- [MDN PWA Guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Next.js PWA Plugin](https://github.com/shadowwalker/next-pwa)

## Support

For issues or questions about the PWA implementation, contact the development team or create an issue in the repository.
