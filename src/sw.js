import {precacheAndRoute, cleanupOutdatedCaches} from 'workbox-precaching';
import {clientsClaim} from 'workbox-core';
// Built by Vite and populated by injectManifest; caches only this application's assets.
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();
self.skipWaiting();
clientsClaim();
