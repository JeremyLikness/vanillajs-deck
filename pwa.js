const CACHE_VERSION = 1.0;

const BASE_CACHE_FILES = [
    '/index.html',
    '/pwa/404.html',
    '/pwa/offline.html',
    '/css/style.css',
    '/css/animations.css',
    '/manifest.json',
    '/images/logo.png',
    '/js/app.js',
];

const OFFLINE_CACHE_FILES = [
    '/pwa/offline.html'
];

const NOT_FOUND_CACHE_FILES = [
    '/pwa/404.html'
];

const OFFLINE_PAGE = '/pwa/offline.html';
const NOT_FOUND_PAGE = '/pwa/404.html';

const CACHE_VERSIONS = {
    assets: 'assets-v' + CACHE_VERSION,
    content: 'content-v' + CACHE_VERSION,
    offline: 'offline-v' + CACHE_VERSION,
    notFound: '404-v' + CACHE_VERSION,
};

// Define MAX_TTL's in SECONDS for specific file extensions
const MAX_TTL = {
    '/': 3600,
    html: 43200,
    json: 43200,
    js: 86400,
    css: 86400,
};

const SUPPORTED_METHODS = [
    'GET',
];

/**
 * getFileExtension
 * @param {string} url
 * @returns {string}
 */
function getFileExtension(url) {
    let extension = url.split('.').reverse()[0].split('?')[0];
    return (extension.endsWith('/')) ? '/' : extension;
}

/**
 * getTTL
 * @param {string} url
 */
function getTTL(url) {
    if (typeof url === 'string') {
        let extension = getFileExtension(url);
        if (typeof MAX_TTL[extension] === 'number') {
            return MAX_TTL[extension];
        } else {
            return null;
        }
    } else {
        return null;
    }
}

/**
 * installServiceWorker
 * @returns {Promise}
 */
async function installServiceWorker() {
    try {
        await Promise.all([
            caches.open(CACHE_VERSIONS.assets).then((cache) => {
                return cache.addAll(BASE_CACHE_FILES);
            }, err => console.error(`Error with ${CACHE_VERSIONS.assets}`, err)),
            caches.open(CACHE_VERSIONS.offline).then((cache_1) => {
                return cache_1.addAll(OFFLINE_CACHE_FILES);
            }, err_1 => console.error(`Error with ${CACHE_VERSIONS.offline}`, err_1)),
            caches.open(CACHE_VERSIONS.notFound).then((cache_2) => {
                return cache_2.addAll(NOT_FOUND_CACHE_FILES);
            }, err_2 => console.error(`Error with ${CACHE_VERSIONS.notFound}`, err_2))]);
        return self.skipWaiting();
    }
    catch (err_3) {
        return console.error("Error with installation: ", err_3);
    }
}

/**
 * cleanupLegacyCache
 * @returns {Promise}
 */
function cleanupLegacyCache() {

    const currentCaches = Object.keys(CACHE_VERSIONS).map((key) => {
        return CACHE_VERSIONS[key];
    });

    return new Promise(
        (resolve, reject) => {

            caches.keys().then((keys) => {
                return legacyKeys = keys.filter((key) => {
                    return !~currentCaches.indexOf(key);
                });
            }).then((legacy) => {
                if (legacy.length) {
                    Promise.all(legacy.map((legacyKey) => {
                        return caches.delete(legacyKey)
                    })
                    ).then(() => {
                        resolve()
                    }).catch((err) => {
                        console.error("Error in legacy cleanup: ", err);
                        reject(err);
                    });
                } else {
                    resolve();
                }
            }).catch((err) => {
                console.error("Error in legacy cleanup: ", err);
                reject(err);
            });

        });
}

function preCacheUrl(url) {
    caches.open(CACHE_VERSIONS.content).then((cache) => {
        cache.match(url).then((response) => {
            if (!response) {
                return fetch(url);
            } else {
                // already in cache, nothing to do.
                return null;
            }
        }).then((response) => {
            if (response) {
                return cache.put(url, response.clone());
            } else {
                return null;
            }
        });
    });

}

self.addEventListener('install', event => {
    event.waitUntil(
        Promise.all([
            installServiceWorker(),
            self.skipWaiting(),
        ]));
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', event => {
    event.waitUntil(Promise.all(
        [cleanupLegacyCache(),
        self.clients.claim(),
        self.skipWaiting()]).catch((err) => {
            console.error("Activation error: ", err);
            event.skipWaiting();
        }));
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.open(CACHE_VERSIONS.content).then((cache) => {
            return cache.match(event.request).then((response) => {
                if (response) {
                    let headers = response.headers.entries();
                    let date = null;

                    for (let pair of headers) {
                        if (pair[0] === 'date') {
                            date = new Date(pair[1]);
                        }
                    }

                    if (date) {
                        let age = parseInt((new Date().getTime() - date.getTime()) / 1000);
                        let ttl = getTTL(event.request.url);

                        if (ttl && age > ttl) {
                            return new Promise(async (resolve) => {
                                try {
                                    const updatedResponse = await fetch(event.request.clone());
                                    if (updatedResponse) {
                                        cache.put(event.request, updatedResponse.clone());
                                        resolve(updatedResponse);
                                    }
                                    else {
                                        resolve(response);
                                    }
                                }
                                catch (e) {
                                    resolve(response);
                                }
                            }).catch(() => {
                                return response;
                            });
                        } else {
                            return response;
                        }
                    } else {
                        return response;
                    }
                } else {
                    return null;
                }
            }).then((response) => {
                if (response) {
                    return response;
                } else {
                    return fetch(event.request.clone()).then(
                        (response) => {
                            if (response.status < 400) {
                                if (~SUPPORTED_METHODS.indexOf(event.request.method)) {
                                    cache.put(event.request, response.clone());
                                }
                                return response;
                            } else {
                                return caches.open(CACHE_VERSIONS.notFound).then((cache) => {
                                    return cache.match(NOT_FOUND_PAGE);
                                });
                            }
                        }).then((response) => {
                            if (response) {
                                return response;
                            }
                        }).catch(() => {
                            return caches.open(CACHE_VERSIONS.offline).then(
                                (offlineCache) => {
                                    return offlineCache.match(OFFLINE_PAGE)
                                });
                        });
                }
            }).catch((error) => {
                console.error('Error in fetch handler:', error);
                throw error;
            });
        })
    );
});

self.addEventListener('message', (event) => {
    if (typeof event.data === 'object' &&
        typeof event.data.action === 'string') {
        switch (event.data.action) {
            case 'cache':
                preCacheUrl(event.data.url);
                break;
            default:
                console.log('Unknown action: ' + event.data.action);
                break;
        }
    }
});