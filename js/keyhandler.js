class KeyHandler extends HTMLElement {

    constructor() {
        super();
        this._deck = null;
    }

    static get observedAttributes() {
        return ["deck"];
    }

    async attributeChangedCallback(attrName, oldVal, newVal) {
        if (attrName === "deck") {
            if (oldVal !== newVal) {
                this._deck = document.getElementById(newVal);
                this._deck.parentElement.addEventListener("keydown", key => {
                    if (key.keyCode == 39 || key.keyCode == 32) {
                        this._deck.next();
                    }
                    else if (key.keyCode == 37) {
                        this._deck.previous();
                    }
                });
            }
        }
    }
}

export const registerKeyHandler = () => customElements.define('key-handler', KeyHandler);