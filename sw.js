const CACHE = 'grindlog-v3';
const ASSETS = [
  '/',
  '/index.html',
  '/workout.html',
  '/boxing.html',
  '/diet.html',
  '/progress.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/css/base.css',
  '/css/components.css',
  '/js/core.js',
  '/js/data.js',
  '/js/pwa.js',
  '/js/today.js',
  '/js/workout.js',
  '/js/boxing.js',
  '/js/diet.js',
  '/js/progress.js',
  '/js/onboarding.js',
  '/js/analyzer.js',
  '/js/app.js',
  'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700&display=swap'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
