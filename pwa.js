// @ts-check

/**
 * @typedef {object} CacheVersions
 * @property {string} assets Cache name for base assets
 * @property {string} content Cache for pages
 * @property {string} offline Cache for offline content
 * @property {string} notFound Cache for 404 content
 */

/**
 * @typedef {function} AddEventListener
 * @param {string} eventName Name of event to add
 * @param {EventListener} callback Callback when event is fired
 * @returns {void}
 */

/**
 * @typedef {object} ServiceWorkerGlobalScope
 * @property {function} skipWaiting skip the waiting
 * @property {AddEventListener} addEventListener Add event listener
 * @property {any} clients Service worker clients
 */

/**
 * Service worker for Progressive Web App 
 * */
class Pwa {
    /**
     * Create a new instance
     * @param {ServiceWorkerGlobalScope} self 
     */
    constructor(self) {
        /**
         * Global scope
         * @type {ServiceWorkerGlobalScope}
         */
        this.scope = self;

        /**
         * Cache version
         * @type {number}
         */
        this.CACHE_VERSION = 1.0;
        /**
         * Pre-emptive files to cache
         * @type {string[]}
         */
        this.BASE_CACHE_FILES = [
            '/index.html',
            '/pwa/404.html',
            '/pwa/offline.html',
            '/css/style.css',
            '/css/animations.css',
            '/manifest.json',
            '/images/logo.png',
            '/js/app.js',
        ];
        /** 
         * Files needed for offline mode
         * @type {string[]}
         */
        this.OFFLINE_CACHE_FILES = [
            '/pwa/offline.html'
        ];
        /**
         * Files needed for 404 page
         * @type {string[]}
         */
        this.NOT_FOUND_CACHE_FILES = [
            '/pwa/404.html'
        ];
        /**
         * Page to redirect to when offline
         * @type {string}
         */
        this.OFFLINE_PAGE = '/pwa/offline.html';
        /**
         * Page to show when not found (404)
         * @type {string}
         */
        this.NOT_FOUND_PAGE = '/pwa/404.html';
        /**
         * Versioned caches
         * @type {CacheVersions}
         */
        this.CACHE_VERSIONS = {
            assets: `assets-v${this.CACHE_VERSION}`,
            content: `content-v${this.CACHE_VERSION}`,
            offline: `offline-v${this.CACHE_VERSION}`,
            notFound: `404-v${this.CACHE_VERSION}`,
        };
        /**
         * The time to live in cache
         * @type {object}
         */
        this.MAX_TTL = {
            /** @type {number} Default time to live in seconds */
            '/': 3600,
            /** @type {number} Time to live for pages in seconds */
            html: 43200,
            /** @type {number} Time to live for JSON in seconds */
            json: 43200,
            /** @type {number} Time to live for scripts in seconds */
            js: 86400,
            /** @type {number} Time to live for stylesheets in seconds */
            css: 86400,
        };

        /**
         * Supported methods for HTTP requests
         * @type {string[]}
         */
        this.SUPPORTED_METHODS = [
            'GET',
        ];
    }

    /**
    * Get the extension of a file from URL
    * @param {string} url
    * @returns {string}
    */
    getFileExtension(url) {
        let extension = url.split('.').reverse()[0].split('?')[0];
        return (extension.endsWith('/')) ? '/' : extension;
    }

    /**
     * Get time to live for cache by extension
     * @param {string} url
     * @returns {number} Time to live in seconds 
     */
    getTTL(url) {
        if (typeof url === 'string') {
            const extension = this.getFileExtension(url);
            if (typeof this.MAX_TTL[extension] === 'number') {
                return this.MAX_TTL[extension];
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    async installServiceWorker() {
        try {
            await Promise.all([
                caches.open(this.CACHE_VERSIONS.assets).then((cache) => {
                    return cache.addAll(this.BASE_CACHE_FILES);
                }, err => console.error(`Error with ${this.CACHE_VERSIONS.assets}`, err)),
                caches.open(this.CACHE_VERSIONS.offline).then((cache_1) => {
                    return cache_1.addAll(this.OFFLINE_CACHE_FILES);
                }, err_1 => console.error(`Error with ${this.CACHE_VERSIONS.offline}`, err_1)),
                caches.open(this.CACHE_VERSIONS.notFound).then((cache_2) => {
                    return cache_2.addAll(this.NOT_FOUND_CACHE_FILES);
                }, err_2 => console.error(`Error with ${this.CACHE_VERSIONS.notFound}`, err_2))]);
            return this.scope.skipWaiting();
        }
        catch (err_3) {
            return console.error("Error with installation: ", err_3);
        }
    }

    /**
     * Removes prior cache version
     * @returns {Promise}
     */
    cleanupLegacyCache() {

        const currentCaches = Object.keys(this.CACHE_VERSIONS).map((key) => {
            return this.CACHE_VERSIONS[key];
        });

        return new Promise(
            (resolve, reject) => {
                caches.keys().then((keys) => {
                    return keys.filter((key) => {
                        return !~currentCaches.indexOf(key);
                    });
                }).then((legacy) => {
                    if (legacy.length) {
                        Promise.all(legacy.map((legacyKey) => {
                            return caches.delete(legacyKey);
                        })
                        ).then(() => {
                            resolve();
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

    /**
     * Pre-fetches URL to store to cache
     * @param {string} url 
     */
    preCacheUrl(url) {
        caches.open(this.CACHE_VERSIONS.content).then((cache) => {
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

    /**
     * Registers the various service worker functions
     * @returns {void}
     */
    register() {
        this.scope.addEventListener('install', event => {
            event.waitUntil(
                Promise.all([
                    this.installServiceWorker(),
                    this.scope.skipWaiting(),
                ]));
        });

        // The activate handler takes care of cleaning up old caches.
        this.scope.addEventListener('activate', event => {
            event.waitUntil(Promise.all(
                [this.cleanupLegacyCache(),
                this.scope.clients.claim(),
                this.scope.skipWaiting()]).catch((err) => {
                    console.error("Activation error: ", err);
                    event.skipWaiting();
                }));
        });

        this.scope.addEventListener('fetch', event => {
            event.respondWith(
                caches.open(this.CACHE_VERSIONS.content)
                    .then(async (cache) => {
                        try {
                            const response = await cache.match(event.request);
                            if (response) {
                                const headers = response.headers.entries();
                                let date = null;
                                for (let pair of headers) {
                                    if (pair[0] === 'date') {
                                        date = new Date(pair[1]);
                                    }
                                }
                                if (date) {
                                    let age = parseInt(((new Date().getTime() - date.getTime()) / 1000).toString());
                                    let ttl = this.getTTL(event.request.url);
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
                                        }).catch(() => response);
                                    }
                                    else {
                                        return response;
                                    }
                                }
                                else {
                                    return response;
                                }
                            }
                            else {
                                return null;
                            }
                        }
                        catch (error) {
                            console.error('Error in fetch handler:', error);
                            throw error;
                        }
                    })
            );
        });

        this.scope.addEventListener('message', (event) => {
            if (typeof event.data === 'object' &&
                typeof event.data.action === 'string') {
                switch (event.data.action) {
                    case 'cache':
                        this.preCacheUrl(event.data.url);
                        break;
                    default:
                        console.log(`Unknown action: ${event.data.action}`);
                        break;
                }
            }
        });
    }
}

/** 
 * Sadly this is a pathetic hack to workaround JsDoc limitations
 * @type {any} */
const _self = self;
var pwa = new Pwa(/**@type {ServiceWorkerGlobalScope}*/(_self));
pwa.register();