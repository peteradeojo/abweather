const CACHE_NAME = "ABWEATHER-V1";

const urlsToCache = [
	'/styles.css',
	'/index.html',
	'/assets/background.jpg',
	'/assets/favicon.ico',
	'/assets/index.js'
	// 'https://fonts.googleapis.com/css2?family=Comfortaa'
];

self.addEventListener('install', installer => {
	console.log("Installing");

	const done = async () => {
		const cache = await caches.open(CACHE_NAME);
		return cache.addAll(urlsToCache);
	};

	installer.waitUntil(done());
});

self.addEventListener('fetch', fetchEvent => {
	
});

self.addEventListener('activate', activator => {
	console.log('Activating');

	const currentCaches = [CACHE_NAME];
	const done = async () => {
		const names = await caches.keys();
		return Promise.all(names.map(name => {
			if (!currentCaches.includes(name)) {
				return caches.delete(name);
			}
		}));
	};

	activator.waitUntil(done());
});