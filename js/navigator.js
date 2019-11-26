// @ts-check

import { loadSlides } from "./slideLoader.js"
import { Slide } from "./slide.js"
import { Router } from "./router.js"
import { Animator } from "./animator.js"

/**
 * The main class that handles rendering the slide decks
 * @extends {HTMLElement}
 */
export class Navigator extends HTMLElement {

    /**
     * Create an instance of the custom navigator element
     */
    constructor() {
        super();
        /**
         * The related animation control
         * @type {Animator}
         */
        this._animator = new Animator();
        /**
         * The related router control
         * @type {Router}
         */
        this._router = new Router();
        /**
         * The last known route
         * @type {string}
         */
        this._route = this._router.getRoute();
        /**
         * Custom event raised when the current slide changes
         * @type {CustomEvent}
         */
        this.slidesChangedEvent = new CustomEvent("slideschanged", {
            bubbles: true,
            cancelable: false
        });
        this._router.eventSource.addEventListener("routechanged", () => {
            if (this._route !== this._router.getRoute()) {
                this._route = this._router.getRoute();
                if (this._route) {
                    var slide = parseInt(this._route) - 1;
                    this.jumpTo(slide);
                }
            }
        });
    }

    /**
     * Get the list of observed attributes
     * @returns {string[]} The list of attributes to watch
     */
    static get observedAttributes() {
        return ["start"];
    }

    /**
     * Called when an attribute changes
     * @param {string} attrName 
     * @param {string} oldVal 
     * @param {string} newVal 
     */
    async attributeChangedCallback(attrName, oldVal, newVal) {
        if (attrName === "start") {
            if (oldVal !== newVal) {
                this._slides = await loadSlides(newVal);
                this._route = this._router.getRoute();
                var slide = 0;
                if (this._route) {
                    slide = parseInt(this._route) - 1;
                }
                this.jumpTo(slide);
                this._title = document.querySelectorAll("title")[0];
            }
        }
    }

    /**
     * Current slide index
     * @returns {number} The current slide index
     */
    get currentIndex() {
        return this._currentIndex;
    }

    /**
     * Current slide
     * @returns {Slide} The current slide
     */
    get currentSlide() {
        return this._slides ? this._slides[this._currentIndex] : null;
    }

    /**
     * Total number of slides
     * @returns {number} The total slide count
     */
    get totalSlides() {
        return this._slides ? this._slides.length : 0;
    }

    /**
     * True if a previous slide exists
     * @returns {boolean} True if a previous slide exists
     */
    get hasPrevious() {
        return this._currentIndex > 0;
    }

    /**
     * True if a next slide exists
     * @returns {boolean} True if a subsequent slide exists
     */
    get hasNext() {
        const host = this.querySelector("div");
        if (host) {
            const appear = host.querySelectorAll(".appear");
            if (appear && appear.length) {
                return true;
            }
        }
        return this._currentIndex < (this.totalSlides - 1);
    }

    /**
     * Main slide navigation: jump to specific slide
     * @param {number} slideIdx The index of the slide to navigate to
     */
    jumpTo(slideIdx) {
        if (this._animator.transitioning) {
            return;
        }
        if (slideIdx >= 0 && slideIdx < this.totalSlides) {
            this._currentIndex = slideIdx;
            this.innerHTML = '';
            this.appendChild(this.currentSlide.html);
            this._router.setRoute((slideIdx + 1).toString());
            this._route = this._router.getRoute();
            document.title = `${this.currentIndex + 1}/${this.totalSlides}: ${this.currentSlide.title}`;
            this.dispatchEvent(this.slidesChangedEvent);
            if (this._animator.animationReady) {
                this._animator.endAnimation(this.querySelector("div"));
            }
        }
    }

    /**
     * Check for in-slide appearances on navigation
     * @returns {boolean} True if an element was revealed
     */
    checkForAppears() {
        const host = this.querySelector("div");
        const appear = host.querySelectorAll(".appear");
        if (appear.length) {
            appear[0].classList.remove("appear");
            return true;
        }
        return false;
    }

    /**
     * Advance to next slide, if it exists. Applies animation if transition is specified
     */
    next() {
        if (this.checkForAppears()) {
            this.dispatchEvent(this.slidesChangedEvent);
            return;
        }
        if (this.hasNext) {
            if (this.currentSlide.transition !== null) {
                this._animator.beginAnimation(
                    this.currentSlide.transition,
                    this.querySelector("div"),
                    () => this.jumpTo(this.currentIndex + 1));
            }
            else {
                this.jumpTo(this.currentIndex + 1);
            }
        }
    }

    /**
     * Move to previous slide, if it exists
     */
    previous() {
        if (this.hasPrevious) {
            this.jumpTo(this.currentIndex - 1);
        }
    }
}

/**
 * Register the custom slide-deck component
 */
export const registerDeck = () => customElements.define('slide-deck', Navigator);