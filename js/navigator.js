export class Navigator {

    constructor(slides, deck) {
        this._deck = deck;
        this._slides = slides;
        this.jumpTo(0);
    }

    get currentIndex() {
        return this._currentIndex;
    }

    get currentSlide() {
        return this._slides[this._currentIndex];
    }

    get totalSlides() {
        return this._slides.length;
    }

    get hasPrevious() {
        return this._currentIndex > 0;
    }

    get hasNext() {
        return this._currentIndex < (this.totalSlides - 1);
    }

    jumpTo(slideIdx) {
        if (slideIdx >= 0 && slideIdx < this.totalSlides) {
            this._currentIndex = slideIdx;
            this._deck.innerHTML = '';
            this._deck.appendChild(this.currentSlide.html);
        }
    }

    next() {
        if (this.hasNext) {
            this.jumpTo(this.currentIndex + 1);
        }
    }

    previous() {
        if (this.hasPrevious) {
            this.jumpTo(this.currentIndex - 1);
        }
    }
}