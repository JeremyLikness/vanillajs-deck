// @ts-check

import {DataBinding} from "./dataBinding.js"

/** 
 * Represents a slide 
 * */
export class Slide {

    /**
     * @constructor
     * @param {string} text - The content of the slide 
     */
    constructor(text) {
        /** 
         * Internal text representation of the slide
         * @type {string}
         */
        this._text = text;
        /**
         * Context for embedded scripts
         * @type {object}
         */
        this._context = {};
        /**
         * Data binding helper
         * @type {DataBinding}
         */
        this._dataBinding = new DataBinding();
        /** 
         * The HTML DOM hosting the slide contents
         * @type {HTMLDivElement}
         */
        this._html = document.createElement('div');
        this._html.innerHTML = text;
        /**
         * The title of the slide
         * @type {string}
         */
        this._title = this._html.querySelectorAll("title")[0].innerText;
        /** @type{NodeListOf<HTMLElement>} */
        const transition = (this._html.querySelectorAll("transition"));
        if (transition.length) {
            /**
             * The name of the animation to use for transitions
             * @type {string}
             */
            this._transition = transition[0].innerText;
        }
        else {
            this._transition = null;
        }
        /** @type{NodeListOf<HTMLElement>} */
        const hasNext = this._html.querySelectorAll("nextslide");
        if (hasNext.length > 0) {
            /** 
             * The name of the next slide to load
             * @type {string}
             */
            this._nextSlideName = hasNext[0].innerText;
        }
        else {
            this._nextSlideName = null;
        }
        // execute any scripts
        const script = this._html.querySelector("script");
        if (script) {
            this._dataBinding.executeInContext(script.innerText, this._context);
            this._dataBinding.bindLists(this._html, this._context);
        }
    }

    /** 
     * The slide transition
     * @returns {string} The transition name
     */
    get transition() {
        return this._transition;
    }

    /** 
     * The slide title
     * @returns {string} The slide title
     */
    get title() {
        return this._title;
    }

    /**
     * The HTML DOM node for the slide
     * @returns {HTMLDivElement} The HTML content
     */
    get html() {
        return this._html;
    }

    /**
     * The name of the next slide (filename without the .html extension)
     * @returns {string} The name of the next slide
     */
    get nextSlide() {
        return this._nextSlideName;
    }
}