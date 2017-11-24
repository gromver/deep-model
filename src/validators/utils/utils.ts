import Message from './Message';

const utils = {
  EMPTY_STRING_REGEXP: /^\s*$/,

  isString(value: any): boolean {
    return typeof value === 'string';
  },

  isArray(value: any): boolean {
    return {}.toString.call(value) === '[object Array]';
  },

  // Checks if the value is a number. This function does not consider NaN a
  // number like many other `isNumber` functions do.
  isNumber(value: any): boolean {
    return typeof value === 'number' && !isNaN(value);
  },

  // Returns false if the object is not a function
  isFunction(value: any): boolean {
    return typeof value === 'function';
  },

  // A simple check to verify that the value is an integer. Uses `isNumber`
  // and a simple modulo check.
  isInteger(value: any): boolean {
    return this.isNumber(value) && value % 1 === 0;
  },

  // Checks if the value is a boolean
  isBoolean(value: any): boolean {
    return typeof value === 'boolean';
  },

  // Uses the `Object` function to check if the given argument is an object.
  isObject(obj: any): boolean {
    return obj === Object(obj);
  },

  // Simply checks if the object is an instance of a date
  isDate(obj: any): boolean {
    return obj instanceof Date;
  },

  // Returns false if the object is `null` of `undefined`
  isDefined(obj: any): boolean {
    return obj !== null && obj !== undefined;
  },

  // Checks if the given argument is a promise. Anything with a `then`
  // function is considered a promise.
  isPromise(p) {
    return !!p && this.isFunction(p.then);
  },

  isDomElement(o: any): boolean {
    if (!o) {
      return false;
    }

    if (!o.querySelectorAll || !o.querySelector) {
      return false;
    }

    if (this.isObject(document) && o === document) {
      return true;
    }

    // http://stackoverflow.com/a/384380/699304
    /* istanbul ignore else */
    if (typeof HTMLElement === 'object') {
      return o instanceof HTMLElement;
    }
    return o &&
      typeof o === 'object' &&
      o !== null &&
      o.nodeType === 1 &&
      typeof o.nodeName === 'string';
  },

  isEmpty(value: any): boolean {
    let attr;

    // Null and undefined are empty
    if (!this.isDefined(value)) {
      return true;
    }

    // functions are non empty
    if (this.isFunction(value)) {
      return false;
    }

    // Whitespace only strings are empty
    if (this.isString(value)) {
      return this.EMPTY_STRING_REGEXP.test(value);
    }

    // For arrays we use the length property
    if (this.isArray(value)) {
      return value.length === 0;
    }

    // Dates have no attributes but aren't empty
    if (this.isDate(value)) {
      return false;
    }

    // If we find at least one property we consider it non empty
    if (this.isObject(value)) {
      for (attr in value) {
        return false;
      }
      return true;
    }

    return false;
  },

  // Checks if the object is a hash, which is equivalent to an object that
  // is neither an array nor a function.
  isHash(value: any): boolean {
    return this.isObject(value) && !this.isArray(value) && !this.isFunction(value);
  },

  contains(obj: any, value: any): boolean {
    if (!this.isDefined(obj)) {
      return false;
    }
    if (this.isArray(obj)) {
      return obj.indexOf(value) !== -1;
    }
    return value in obj;
  },

  unique(array: any[]): any[] {
    if (!this.isArray(array)) {
      return array;
    }
    return array.filter((el, index, array) => array.indexOf(el) === index);
  },

  /**
   * Validator.createMessage wrapper for using in object context
   * @param {string} message
   * @param {{}} bindings
   * @returns {Message}
   */
  createMessage(message: string, bindings: {}): Message {
    return new Message(message, bindings);
  },
};

export default utils;
