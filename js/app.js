import { registerDeck } from "./navigator.js"
import { registerControls } from "./controls.js"
import { registerKeyHandler } from "./keyhandler.js"

/**
 * Main application element, simply registers the web components
 */
const app = async () => {
    registerDeck();
    registerControls();
    registerKeyHandler();
};

document.addEventListener("DOMContentLoaded", app);