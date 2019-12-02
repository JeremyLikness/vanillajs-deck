// @ts-check

import { Observable, Computed } from "./observable.js"

/**
 * Class supports data-binding operations
 */
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
    executeInContext(src, context, attachBindingHelpers = false) {
        if (attachBindingHelpers) {
            context.observable = this.observable;
            context.computed = this.computed;
            context.bindValue = this.bindValue;
        }
        return this.execute.call(context, src);
    }

    /**
     * A simple observable implementation
     * @param {object} value Any value to observe
     * @returns {Observable} The observable instance to use
     */
    observable(value) {
        return new Observable(value);
    }

    /**
     * Creates an observed computed property
     * @param {function} calculation Calculated value 
     * @param {Observable[]} deps The list of dependent observables
     * @returns {Computed} The observable computed value 
     */
    computed(calculation, deps) {
        return new Computed(calculation, deps);
    }

    /**
     * Binds an input element to an observable value
     * @param {HTMLInputElement} input The element to bind to 
     * @param {Observable} observable The observable instance to bind to 
     */
    bindValue(input, observable) {
        const initialValue = observable.value;
        input.value = initialValue;
        observable.subscribe(() => input.value = observable.value);
        /**
         * Converts the values 
         * @param {object} value 
         */
        let converter = value => value;
        if (typeof initialValue === "number") {
            converter = num => isNaN(num = parseFloat(num)) ? 0 : num;
        }
        input.onkeyup = () => {
            observable.value = converter(input.value);
        };
    }

    /**
     * 
     * @param {HTMLElement} elem The parent element 
     * @param {object} context The context to use for binding 
     */
    bindAll(elem, context) {
        this.bindLists(elem, context);
        this.bindObservables(elem, context);
    }

    /**
     * Searches for "data-bind" attribute to data-bind observables
     * @param {HTMLElement} elem The parent element to search 
     * @param {object} context The context to use for binding 
     */
    bindObservables(elem, context) {
        const dataBinding = elem.querySelectorAll("[data-bind]");
        dataBinding.forEach(elem => {
            this.bindValue(
                /** @type {HTMLInputElement} */(elem), 
                context[elem.getAttribute("data-bind")]);
        });
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
                        const value = this.executeInContext(`this.${match}`, { item });
                        newTemplate = newTemplate.replace(`{{${match}}}`, value);
                    });
                    parent.innerHTML += newTemplate;
                }
            });
        });
    }
}
