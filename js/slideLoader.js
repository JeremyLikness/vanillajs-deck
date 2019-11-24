//@ts-check
import { Slide } from "./slide.js"

/**
 * Load a single slide
 * @param {string} slideName The name of the slide
 * @returns {Promise<Slide>} The slide 
 */
async function loadSlide(slideName) {
    const response = await fetch(`./slides/${slideName}.html`);
    const slide = await response.text();
    return new Slide(slide);
}

/**
 * 
 * @param {string} start The name of the slide to begin with
 * @returns {Promise<Slide[]>} The array of loaded slides
 */
export async function loadSlides(start) {
    var next = start;
    const slides = [];
    const cycle = {};
    while (next) {
        if (!cycle[next]) {
            cycle[next] = true;
            const nextSlide = await loadSlide(next);
            slides.push(nextSlide);
            next = nextSlide.nextSlide;
        }
        else {
            break;
        }
    }
    return slides;
}