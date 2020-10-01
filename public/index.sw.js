const CACHE_NAME = "ABWEATHER-V2";
const version = "abweather-v3";

const urlsToCache = [
	'/',
	'/styles.css',
	'/index.html',
	'/assets/background.jpg',
	'/assets/favicon.ico',
	'/assets/index.js',
	'/assets/twitter.png',
	'/assets/whatsapp.png',
	'/android-chrome-256x256.png',
	'/android-chrome-192x192.png',
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

self.addEventListener("notificationclick", (event) => {
	let notification = event.notification;
	let action = event.action;

	console.log(notification);

	if (action === "confirm") {
		console.log('Confirm was chosen');
		notification.close();
	} else {
		console.log(action);
		notification.close();
	}
});

let syncAttendees = () => {
	return update({ url: `../` })
    	.then(refresh)
    	.then(() => self.registration.showNotification(`Sync successful`))
}

self.addEventListener('sync', function(event) {
	console.log("sync event", event);
    if (event.tag === 'syncAttendees') {
        event.waitUntil(syncAttendees()); // sending sync request
    }
});

