import { loadSlides } from "./slideLoader.js"
import { Router } from "./router.js"
import { Animator } from "./animator.js"

class Navigator extends HTMLElement {

    constructor() {
        super();
        this._animator = new Animator();
        this._router = new Router();
        this._route = this._router.getRoute();
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

    static get observedAttributes() {
        return ["start"];
    }

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

    get currentIndex() {
        return this._currentIndex;
    }

    get currentSlide() {
        return this._slides ? this._slides[this._currentIndex] : null;
    }

    get totalSlides() {
        return this._slides ? this._slides.length : 0;
    }

    get hasPrevious() {
        return this._currentIndex > 0;
    }

    get hasNext() {
        return this._currentIndex < (this.totalSlides - 1);
    }

    jumpTo(slideIdx) {
        if (this._animator.transitioning) {
            return;
        }
        if (slideIdx >= 0 && slideIdx < this.totalSlides) {
            this._currentIndex = slideIdx;
            this.innerHTML = '';
            this.appendChild(this.currentSlide.html);
            this._router.setRoute(slideIdx+1);         
            this._route = this._router.getRoute();
            document.title = `${this.currentIndex+1}/${this.totalSlides}: ${this.currentSlide.title}`;
            this.dispatchEvent(this.slidesChangedEvent);
            if (this._animator.animationReady) {
                this._animator.endAnimation(this.querySelector("div"));
            }
        }
    }

    next() {
        if (this.hasNext) {
            if (this.currentSlide.transition !== null) {
                this._animator.beginAnimation(
                    this.currentSlide.transition, 
                    this.querySelector("div"),
                    () => this.jumpTo(this.currentIndex+1));
            }
            else {
                this.jumpTo(this.currentIndex + 1);
            }
        }
    }

    previous() {
        if (this.hasPrevious) {
            this.jumpTo(this.currentIndex - 1);
        }
    }
}

export const registerDeck = () => customElements.define('slide-deck', Navigator);