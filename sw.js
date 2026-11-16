/* Service worker: офлайн-режим с первого визита (требование Яндекс Игр). */
/*__PRECACHE__*/
const CACHE_NAME = "block-garden-9050381ff2f7";
// Список сгенерирован scripts/build.mjs: index.html, styles.css и все .js.
const PRECACHE = [
	"./",
	"./icons/favicon-32.png",
	"./icons/icon-192.png",
	"./icons/icon-512.png",
	"./icons/icon.svg",
	"./index.html",
	"./js/audio.js",
	"./js/game/constants.js",
	"./js/game/daily.js",
	"./js/game/rng.js",
	"./js/game/rules.js",
	"./js/game/shapes.js",
	"./js/game/state.js",
	"./js/game/types.js",
	"./js/i18n.js",
	"./js/input/drag.js",
	"./js/main.js",
	"./js/platform/adPolicy.js",
	"./js/platform/config.js",
	"./js/platform/index.js",
	"./js/platform/local.js",
	"./js/platform/readyGate.js",
	"./js/platform/share.js",
	"./js/platform/telegram.js",
	"./js/platform/types.js",
	"./js/platform/vk.js",
	"./js/platform/yandex.js",
	"./js/storage.js",
	"./js/ui/hud.js",
	"./js/view/effects.js",
	"./js/view/layout.js",
	"./js/view/render.js",
	"./manifest.webmanifest",
	"./styles.css"
];
/*__PRECACHE_END__*/

self.addEventListener("install", (event) => {
	event.waitUntil(
		caches
			.open(CACHE_NAME)
			.then((cache) => cache.addAll(PRECACHE))
			.then(() => self.skipWaiting()),
	);
});

self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
			.then(() => self.clients.claim()),
	);
});

self.addEventListener("fetch", (event) => {
	const request = event.request;
	if (request.method !== "GET") return;

	const url = new URL(request.url);
	if (url.origin !== self.location.origin) return;

	event.respondWith(
		caches.match(request).then((cached) => {
			if (cached) return cached;
			return fetch(request)
				.then((response) => {
					if (response.ok) {
						const copy = response.clone();
						caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => undefined);
					}
					return response;
				})
				.catch(() => {
					// Фолбэк на index.html только для навигации:
					// скрипт нельзя подменять HTML, иначе пустой экран.
					if (request.mode === "navigate") {
						return caches.match("./index.html").then((page) => page ?? Response.error());
					}
					return Response.error();
				});
		}),
	);
});
