// @ts-check

export class DataBinding {
    
    /**
     * Simple evaluation
     * @param {string} js The JavaScript to evaluate 
     */
    execute(js) {
        return eval(js);
    }

    /**
     * Evaluates JavaScript with a constrained context (scope)
     * @param {string} src The JavaScript to evaluate 
     * @param {object} context The context (data) to evaluate with
     * @returns {object} The result of the evaluation 
     */
    executeInContext(src, context) {
        return this.execute.call(context, src);
    }

    /**
     * Searches for "repeat" attribute to data-bind lists
     * @param {HTMLElement} elem The parent element to search 
     * @param {object} context The context to use for binding 
     */
    bindLists(elem, context) {
        const listBinding = elem.querySelectorAll("[repeat]");
        listBinding.forEach(elem => {
            const parent = elem.parentElement;
            const expression = elem.getAttribute("repeat");
            elem.removeAttribute("repeat");
            const template = elem.outerHTML;
            parent.removeChild(elem);
            context[expression].forEach(item => {
                let newTemplate = `${template}`;
                const matches = newTemplate.match(/\{\{([^\}]*?)\}\}/g);
                if (matches) {
                    matches.forEach(match => {
                        match = match.replace("{{", "").replace("}}", "");
                        const value = this.executeInContext(`this.${match}`, {item});
                        newTemplate = newTemplate.replace(`{{${match}}}`, value);                    
                    });
                    parent.innerHTML += newTemplate;
                }               
            });
        });
    }
}