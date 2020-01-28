// @ts-check

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
        this.CACHE_VERSION = 1.3;
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
         * Versioned cache
         * @type {string}
         */
        this.CACHE_NAME = `content-v${this.CACHE_VERSION}`;
        /**
         * The time to live in cache
         * @type {object}
         */
        this.MAX_TTL = 86400;

        /**
         * Extensions with no expiration in the cache
         * @type {string[]}
         */
        this.TTL_EXCEPTIONS = ["jpg", "jpeg", "png", "gif", "mp4"];
    }

    /**
    * Get the extension of a file from URL
    * @param {string} url
    * @returns {string} The extension
    */
    getFileExtension(url) {
        const extension = url.split('.').reverse()[0].split('?')[0];
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
            return ~this.TTL_EXCEPTIONS.indexOf(extension) ?
                null : this.MAX_TTL;
        }
        return null;
    }

    async installServiceWorker() {
        try {
            await caches.open(this.CACHE_NAME).then((cache) => {
                return cache.addAll(this.BASE_CACHE_FILES);
            }, err => console.error(`Error with ${this.CACHE_NAME}`, err));
            return this.scope.skipWaiting();
        }
        catch (err) {
            return console.error("Error with installation: ", err);
        }
    }

    /**
     * Removes prior cache version
     * @returns {Promise}
     */
    cleanupLegacyCache() {

        const currentCaches = [this.CACHE_NAME];

        return new Promise(
            (resolve, reject) => {
                caches.keys()
                    .then((keys) => keys.filter((key) => !~currentCaches.indexOf(key)))
                    .then((legacy) => {
                        if (legacy.length) {
                            Promise.all(legacy.map((legacyKey) => caches.delete(legacyKey))
                            ).then(() => resolve()).catch((err) => {
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
    async preCacheUrl(url) {
        const cache = await caches.open(this.CACHE_NAME);
        const response = await cache.match(url);
        if (!response) {
            return fetch(url).then(resp => cache.put(url, resp.clone()));
        }
        return null;
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
                caches.open(this.CACHE_NAME).then(async cache => {
                    if (event.request.url.startsWith("http://localhost")) {
                        return fetch(event.request.clone());
                    }
                    const response = await cache.match(event.request);
                    if (response) {
                        // found it, see if expired
                        const headers = response.headers.entries();
                        let date = null;
                        for (let pair of headers) {
                            if (pair[0] === 'date') {
                                date = new Date(pair[1]);
                                break;
                            }
                        }
                        if (!date) {
                            return response;
                        }
                        const age = parseInt(((new Date().getTime() - date.getTime()) / 1000).toString());
                        const ttl = this.getTTL(event.request.url);
                        if (ttl === null || (ttl && age < ttl)) {
                            return response;
                        }
                    }
                    // not found or expired, fresh request
                    return fetch(event.request.clone()).then(resp => {
                        if (resp.status < 400) {
                            // good to go
                            cache.put(event.request, resp.clone());
                            return resp;
                        }
                        else {
                            // not found
                            return cache.match(this.NOT_FOUND_PAGE);
                        }
                    }).catch(err => {
                        // offline
                        console.error("Error resulting in offline", err);
                        return cache.match(this.OFFLINE_PAGE);
                    })
                }));
        });
    }
}

/** 
 * Sadly this is a pathetic hack to workaround JsDoc limitations
 * Casting what the IDE thinks is Window to service worker scope 
 * @type {any} */
const _self = self;
var pwa = new Pwa(/**@type {ServiceWorkerGlobalScope}*/(_self));
pwa.register();