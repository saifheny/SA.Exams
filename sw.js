var CACHE_NAME = 'sa-exams-v1';
var urlsToCache = [
  '/',
  '/index.html',
  '/exam.html',
  '/policy.html',
  '/terms.html',
  '/css/style.css',
  '/js/student.js',
  '/js/teacher.js',
  '/js/firebase-config.js',
  '/icon.svg'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) return response;
        return fetch(event.request);
      })
  );
});
