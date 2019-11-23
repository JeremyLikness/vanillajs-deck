export class Slide {

    constructor(text) {
        this._text = text;
        this._html = document.createElement('div');
        this._html.innerHTML = text;
        this._title = this._html.querySelectorAll("title")[0].innerText;
        const transition  = this._html.querySelectorAll("transition");
        if (transition.length) {
            this._transition = transition[0].innerText;
        }
        else {
            this._transition = null;
        }
        const hasNext = this._html.querySelectorAll("nextslide");
        if (hasNext.length > 0) {
            this._nextSlideName = hasNext[0].innerText;
        }   
        else {
            this._nextSlideName = null;
        }     
    }

    get transition() {
        return this._transition;
    }

    get title() {
        return this._title;
    }

    get html() {
        return this._html;
    }

    get nextSlide() {
        return this._nextSlideName;
    }
}