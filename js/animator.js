export class Animator {
    constructor() {
        this._transitioning = false;
        this._begin = null;
        this._end = null;
    }

    get transitioning() {
        return this._transitioning;
    }

    get animationReady() {
        return !!this._end;
    }

    beginAnimation(animationName, host, callback) {
        this._transitioning = true;
        this._begin = `anim-${animationName}-begin`;
        this._end = `anim-${animationName}-end`;
        const animationEnd = () => {
            host.removeEventListener("animationend", animationEnd);
            host.classList.remove(this._begin);
            this._transitioning = false;
            callback();
        }
        host.addEventListener("animationend", animationEnd, false);
        host.classList.add(this._begin);
    }

    endAnimation(host) {
        this._transitioning = true;
        const animationEnd = () => {
            host.removeEventListener("animationend", animationEnd);
            host.classList.remove(this._end);
            this._transitioning = false;
            this._begin = null;
            this._end = null;
        }
        host.addEventListener("animationend", animationEnd, false);
        host.classList.add(this._end);
    }
}