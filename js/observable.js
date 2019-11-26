// @ts-check

/**
 * @callback ListenerCallback
 * @param {object} newVal The new value generated
 */

/**
 * Represents an observable value
 */
export class Observable {

    /**
     * Creates a new observable and initializes with a value
     * @param {object} value 
     */
    constructor(value) {
        /** 
         * Subscriptions
         * @type {ListenerCallback[]}
         */
        this._listeners = [];
        /**
         * The value
         * @type {object}
         */
        this._value = value;
    }

    /**
     * Notifies subscribers of new value
     */
    notify() {
        this._listeners.forEach(listener => listener(this._value));
    }

    /**
     * Subscribe to listen for changes
     * @param {ListenerCallback} listener 
     */
    subscribe(listener) {
        this._listeners.push(listener);
    }

    /**
     * The value of the observable
     * @returns {object} The current value
     */
    get value() {
        return this._value;
    }

    /**
     * Sets the value of the observable
     * @param {object} val The new value
     */
    set value(val) {
        if (val !== this._value) {
            this._value = val;
            this.notify();
        }
    }
}

/**
 * Observable computed properties
 */
export class Computed extends Observable {
    /**
     * Creates a new observable and initializes with a value
     * @param {Function} value Initial computation
     * @param {Observable[]} deps Dependencies 
     */
    constructor(value, deps) {
        super(value());
        const listener = () => {
            this._value = value();
            this.notify();
        }
        deps.forEach(dep => dep.subscribe(listener));
    }

    /**
     * Gets the value of the observable
     * @returns {object} The value
     */
    get value() {
        return this._value;
    }

    /**
     * Sets the value of the observable
     * @param {object} _ The new value
     * @throws "Cannot set computed property"
     */
    set value(_) {
        throw "Cannot set computed property";
    }
}