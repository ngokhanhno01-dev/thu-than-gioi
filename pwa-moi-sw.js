/* Service worker của bản cài đặt (PWA) Thú Thần Giới.
   Ưu tiên MẠNG (luôn lấy bản mới nhất khi có mạng), mất mạng thì dùng bản đã lưu lần trước.
   Chỉ lưu file cùng trang web, chỉ lưu phản hồi 200; không đụng tới Firebase hay các yêu cầu khác (POST...). */
var CACHE = 'ttg-moi-v1';
self.addEventListener('install', function (e) { self.skipWaiting(); });
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var r = e.request;
  if (r.method !== 'GET' || r.headers.has('range')) return;
  var u = new URL(r.url);
  if (u.origin !== self.location.origin) return;
  e.respondWith(fetch(r).then(function (res) {
    if (res && res.status === 200 && res.type === 'basic') {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put(r, copy); }).catch(function () {});
    }
    return res;
  }).catch(function () {
    return caches.match(r).then(function (m) { return m || Response.error(); });
  }));
});
