export class Router {

    constructor() {
        this._eventSource = document.createElement("div");
        this._routeChanged = new CustomEvent("routechanged", {
            bubbles: true,
            cancelable: false
        });
        this._route = null;
        window.addEventListener("popstate", () => {
            if (this.getRoute() !== this._route) {
                this._route = this.getRoute();
                this._eventSource.dispatchEvent(this._routeChanged);
            }
        });
    }

    get eventSource() {
        return this._eventSource;
    }
    
    setRoute(route) {
        window.location.hash = route;
        this._route = route;
    }

    getRoute() {
        return window.location.hash.substr(1).replace(/\//ig, "/");
    }
}