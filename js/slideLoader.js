import { Slide } from "./slide.js"

async function loadSlide(slideName) {
    const response = await fetch(`./slides/${slideName}.html`);
    const slide = await response.text();
    return new Slide(slide);
}

export async function loadSlides(start) {
    var next = start;
    const slides = [];
    const cycle = {};
    while (next) {
        const nextSlide = await loadSlide(next);
        if (!cycle[nextSlide.title]) {
            slides.push(nextSlide);
            cycle[nextSlide.title] = nextSlide;
            next = nextSlide.nextSlide;
        }
        else {
            break;
        }
    }   
    return slides;
}