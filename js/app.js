import { getJson } from "./jsonLoader.js"
import { loadSlides } from "./slideLoader.js"
import { Navigator } from "./navigator.js"

const state = {
    manifest: {}
};

const app = async () => {
    
    state.deck = document.getElementById("main");

    // load the manifest    
    state.manifest = await getJson("slides/manifest.json");

    // load the slides
    state.slides = await loadSlides(state.manifest.start);    

    // initialize the navigation
    state.navigator = new Navigator(state.slides, state.deck);
};

document.addEventListener("DOMContentLoaded", app);

