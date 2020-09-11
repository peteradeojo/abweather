const CACHE_NAME = "ABWEATHER-V2";
const version = "abweather-v2";

const urlsToCache = [
	'/',
	'/styles.css',
	'/index.html',
	'/assets/background.jpg',
	'/assets/favicon.ico',
	'/assets/index.js',
	'/assets/twitter.png',
	'/assets/whatsapp.png'
];

self.addEventListener('install', installer => {
	console.log("Installing");

	const done = async () => {
		const cache = await caches.open(CACHE_NAME);
		return cache.addAll(urlsToCache);
	};

	installer.waitUntil(done());
	self.skipWaiting();
});

self.addEventListener('fetch', fetchEvent => {
	const url = fetchEvent.request.url;

	console.log(`Fetching: ${url}`);

	const getResponse = async (request) => {
		let response = await caches.match(request);
		if (response && response.status === 200) {
			console.log('File in cache. Returning cached version');
			return response;
		}

		try {
			response = await fetch(request);
			if (response && response.status === 404) {
				return new Response({
					status: 404
				});
			}
		} catch (e) {
			window.alert(e);
		}

		const clone = response.clone();
		const cache = await caches.open(CACHE_NAME);
		cache.put(url, clone);
		return response;
	};
	fetchEvent.respondWith(getResponse(fetchEvent.request));
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

self.registration.showNotification('Weather in your Location', {
	body: "Get the weather in your location right now!",
	image: "/assets/background.jpg",
	icon: "/android-chrome-192x192.png",
	badge: "/android-chrome-192x192.png",
	actions: [
		{action: "view", title: "View", icon: '/favicon-32x32.png'}
	]
});

self.addEventListener('notificationclose', evt => {
	console.log('notification closed');
});

self.addEventListener('notificationclick', evt => {
	evt.notification.close();
	
	switch (evt.action) {
		case 'view':
			console.log('view clicked');
			break;
		default:
			console.log('notification clicked');
	}
});