// @ts-check

import { Navigator } from "./navigator.js"

/**
 * @typedef {object} CustomRef
 * @property {HTMLButtonElement} first The button to jump to the first slide
 * @property {HTMLButtonElement} prev The button to move to the previous slide
 * @property {HTMLButtonElement} next The button to advance to the next slide
 * @property {HTMLButtonElement} last The button to advance to the last slide
 * @property {HTMLSpanElement} pos The span for the positional information
 */

/**
 * Custom element that renders controls to navigate the deck
 * @extends {HTMLElement}
 */
export class Controls extends HTMLElement {

    /**
     * Create a new instance of controls
     */
    constructor() {
        super();
        /**
         * The internal reference list of controls
         * @type {CustomRef}
         */
        this._controlRef = null;
        /**
         * The related Navigator instance (deck) to control
         * @type {Navigator}
         */
        this._deck = null;
    }

    /**
     * Called when the element is inserted into the DOM. Used to fetch the template and wire into the related Navigator instance.
     */
    async connectedCallback() {
        const response = await fetch("./templates/controls.html");
        const template = await response.text();
        this.innerHTML = "";
        const host = document.createElement("div");
        host.innerHTML = template;
        this.appendChild(host);
        this._controlRef = {
            first: /** @type {HTMLButtonElement} **/(document.getElementById("ctrlFirst")),
            prev: /** @type {HTMLButtonElement} **/(document.getElementById("ctrlPrevious")),
            next: /** @type {HTMLButtonElement} **/(document.getElementById("ctrlNext")),
            last: /** @type {HTMLButtonElement} **/(document.getElementById("ctrlLast")),
            pos: /** @type {HTMLSpanElement} **/(document.getElementById("position"))
        };
        this._controlRef.first.addEventListener("click", () => this._deck.jumpTo(0));
        this._controlRef.prev.addEventListener("click", () => this._deck.previous());
        this._controlRef.next.addEventListener("click", () => this._deck.next());
        this._controlRef.last.addEventListener("click", () => this._deck.jumpTo(this._deck.totalSlides - 1));
        this.refreshState();
    }

    /**
     * Get the list of attributes to watch
     * @returns {string[]} List of observable attributes
     */
    static get observedAttributes() {
        return ["deck"];
    }

    /**
     * Called when the attribute is set
     * @param {string} attrName Name of the attribute that was set
     * @param {string} oldVal The old attribute value
     * @param {string} newVal The new attribute value
     */
    async attributeChangedCallback(attrName, oldVal, newVal) {
        if (attrName === "deck") {
            if (oldVal !== newVal) {
                this._deck = /** @type {Navigator} */(document.getElementById(newVal));
                this._deck.addEventListener("slideschanged", () => this.refreshState());
            }
        }
    }

    /**
     * Enables/disables buttons and updates position based on index in the deck
     */
    refreshState() {
        if (this._controlRef == null) {
            return;
        }
        const next = this._deck.hasNext;
        const prev = this._deck.hasPrevious;
        this._controlRef.first.disabled = !prev;
        this._controlRef.prev.disabled = !prev;
        this._controlRef.next.disabled = !next;
        this._controlRef.last.disabled = this._deck.currentIndex === (this._deck.totalSlides - 1);
        this._controlRef.pos.innerText = `${this._deck.currentIndex + 1} / ${this._deck.totalSlides}`;
    }
}

/** Register the custom slide-controls element */
export const registerControls = () => customElements.define('slide-controls', Controls);