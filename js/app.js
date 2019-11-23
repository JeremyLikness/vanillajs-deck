import { registerDeck } from "./navigator.js"
import { registerControls } from "./controls.js"

const app = async () => {
    
    registerDeck();
    registerControls();
};

document.addEventListener("DOMContentLoaded", app);

