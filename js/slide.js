// @ts-check
/** Represents a slide */
export class Slide {

    /**
     * @constructor
     * @param {string} text - The content of the slide 
     */
    constructor(text) {
        /** @property {string} _text - internal text representation */
        this._text = text;
        /** @property {HTMLDivElement} _html - host div */
        this._html = document.createElement('div');
        this._html.innerHTML = text;
        /** @property {string} _title - title of the slide */
        this._title = this._html.querySelectorAll("title")[0].innerText;
        /** @type{NodeListOf<HTMLElement>} */
        const transition = (this._html.querySelectorAll("transition"));
        if (transition.length) {
            this._transition = transition[0].innerText;
        }
        else {
            this._transition = null;
        }
        /** @type{NodeListOf<HTMLElement>} */
        const hasNext = this._html.querySelectorAll("nextslide");
        if (hasNext.length > 0) {
            this._nextSlideName = hasNext[0].innerText;
        }
        else {
            this._nextSlideName = null;
        }
    }

    /** 
     * The slide transition
     * @return{string} The transition name
     */
    get transition() {
        return this._transition;
    }

    /** 
     * The slide title
     * @return{string} The slide title
     */
    get title() {
        return this._title;
    }

    /**
     * The HTML DOM node for the slide
     * @return{HTMLDivElement} The HTML content
     */
    get html() {
        return this._html;
    }

    /**
     * The name of the next slide (filename without the .html extension)
     * @return{string} The name of the next slide
     */
    get nextSlide() {
        return this._nextSlideName;
    }
}