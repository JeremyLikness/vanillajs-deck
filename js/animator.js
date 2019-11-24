// @ts-check

/**
 * Handles animations and transitions
 * @property {boolean} _transitioning True when animation in effect
 * @property {string} _begin The beginning animation class
 * @property {string} _end The ending animation class 
 */
export class Animator {
    /**
     * Create an instance of the animation helper
     */
    constructor() {
        this._transitioning = false;
        this._begin = null;
        this._end = null;
    }

    /**
     * True when animation in effect
     * @returns {boolean}
     */
    get transitioning() {
        return this._transitioning;
    }

    /**
     * True when ready to complete second part of animation
     * @returns {boolean}
     */
    get animationReady() {
        return !!this._end;
    }

    /**
     * Kicks off a new animation (old slide)
     * @param {string} animationName Name of the animation
     * @param {HTMLDivElement} host The div to be animated
     * @param {Function} callback Function to call when the animation completes
     */
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

    /**
     * Kicks off the final animation (new slide)
     * @param {HTMLDivElement} host The div to animate
     */
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