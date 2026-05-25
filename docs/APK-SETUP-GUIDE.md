# GrindLog — APK Setup Guide

How to get GrindLog installed as a native-feeling app on your Android phone.

---

## Option A — Instant Install (No APK Needed) ★ Recommended First Try

If your phone uses Chrome, you can install the PWA directly without ever building an APK.

1. Host the app on **GitHub Pages** (free, takes 3 minutes)
2. Open the URL in Chrome on your phone
3. Chrome shows "Add to Home screen" banner → tap **Install**
4. App appears on your home screen, opens fullscreen with no browser chrome

This is the fastest path. Skip to **Step 1: Host on GitHub Pages** below.

---

## Option B — Real APK via PWABuilder (No Android Studio Required)

If you want a proper `.apk` file you can share and sideload, use Microsoft's free **PWABuilder** tool. It wraps your PWA in a **Trusted Web Activity (TWA)** — a Chrome shell that runs your web app natively.

**Requirement:** Your app must be hosted at a public HTTPS URL (GitHub Pages works perfectly).

---

## Step 1: Host on GitHub Pages

### 1a. Push to GitHub

```bash
# In your project folder
git init  # already done
git remote add origin https://github.com/YOUR_USERNAME/grindlog.git
git push -u origin master
```

### 1b. Enable GitHub Pages

1. Go to your repo on github.com
2. **Settings** → **Pages**
3. Source: **Deploy from a branch**
4. Branch: `master` / root `/`
5. Click **Save**

Your app will be live at:
`https://YOUR_USERNAME.github.io/grindlog/`

> Takes 1-2 minutes to go live after enabling.

---

## Step 2: Generate APK with PWABuilder

1. Go to **[pwabuilder.com](https://www.pwabuilder.com)**
2. Paste your GitHub Pages URL → **Start**
3. PWABuilder will scan your manifest and service worker — you should get a green score
4. Click **Package For Stores**
5. Choose **Android**
6. Click **Generate Package**
7. Download the `.zip` — it contains your APK + signing keys

---

## Step 3: Install the APK on Your Phone

### Enable Unknown Sources on Android

1. **Settings** → **Security** (or **Apps**)
2. Toggle on **"Install unknown apps"** or **"Allow from this source"**
   - On newer Android: Settings → Apps → Special app access → Install unknown apps → enable for Chrome/Files

### Transfer and Install

**Option 1 — Direct download:**
Upload the `.apk` to Google Drive or send to yourself on Telegram, then download and tap to install.

**Option 2 — USB:**
```bash
# Enable USB Debugging on phone first (Developer Options)
adb install grindlog.apk
```

**Option 3 — Local server:**
```bash
# Run in project folder
npx serve .
# Then open your local IP on phone browser to download the APK
```

---

## Step 4: Update the App Icon (Use Your Custom SVG)

The file `icons/grindlog-icon.svg` is the master icon. Convert it to PNG before uploading to GitHub:

### Convert SVG → PNG (Free Options)

- **Online:** [svgtopng.com](https://svgtopng.com) — upload SVG, download 192×192 and 512×512 PNGs
- **Or:** Open `generate-icons.html` in your browser — it auto-downloads both PNGs

Replace the files:
```
icons/icon-192.png   ← 192×192 export
icons/icon-512.png   ← 512×512 export
```

Then commit and push:
```bash
git add icons/
git commit -m "feat: add real app icons"
git push
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| PWABuilder score is low | Make sure `manifest.json` and `sw.js` are accessible at your Pages URL |
| App shows browser bar | Ensure `manifest.json` has `"display": "standalone"` |
| Icons not showing | Check `manifest.json` icon paths match actual file locations |
| APK install blocked | Enable "Install unknown apps" in Android settings |
| App not caching offline | Hard-reload once on WiFi to let service worker cache files |

---

## Quick Reference

| Tool | URL | Cost |
|------|-----|------|
| GitHub Pages | github.com | Free |
| PWABuilder | pwabuilder.com | Free |
| SVG to PNG | svgtopng.com | Free |
| ADB (optional) | developer.android.com/tools/adb | Free |
