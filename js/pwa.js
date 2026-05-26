'use strict';

function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
}

let deferredInstall = null;

function handleInstallPrompt() {
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredInstall = e;
    if (!load('install-dismissed')) showInstallBanner();
  });
}

function showInstallBanner() {
  const banner = document.getElementById('install-banner');
  if (banner) banner.style.display = 'flex';
}

window.installPWA = function () {
  if (deferredInstall) {
    deferredInstall.prompt();
    deferredInstall.userChoice.then(() => { deferredInstall = null; dismissInstall(); });
  }
};

window.dismissInstall = function () {
  store('install-dismissed', true);
  const banner = document.getElementById('install-banner');
  if (banner) banner.style.display = 'none';
};
