// @ts-check

/**
 * Handles routing for the app
 */
export class Router {

    constructor() {
        /** 
         * @property {HTMLDivElement} _eventSource Arbitrary DIV used to generate events
         */
        this._eventSource = document.createElement("div");
        /**
         * @property {CustomEvent} _routeChanged Custom event raised when the route changes
         */
        this._routeChanged = new CustomEvent("routechanged", {
            bubbles: true,
            cancelable: false
        });
        /**
         * @property {string} _route The current route
         */
        this._route = null;
        window.addEventListener("popstate", () => {
            if (this.getRoute() !== this._route) {
                this._route = this.getRoute();
                this._eventSource.dispatchEvent(this._routeChanged);
            }
        });
    }

    /**
     * Get the event source
     * @returns {HTMLDivElement} The event source div
     */
    get eventSource() {
        return this._eventSource;
    }

    /**
     * Set the current route
     * @param {string} route The route name 
     */
    setRoute(route) {
        window.location.hash = route;
        this._route = route;
    }

    /**
     * Get the current route
     * @returns {string} The current route name
     */
    getRoute() {
        return window.location.hash.substr(1).replace(/\//ig, "/");
    }
}