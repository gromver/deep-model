import Validator from './interfaces/Validate';
import utils from './utils/utils';
import ValueContext from '../ValueContext';

export interface ObjectValidatorConfig {
  message?: string;
}

export default class ObjectValidator implements Validator {
  static MESSAGE = '{attribute} - object has invalid fields';

  public message?: string;

  constructor(config: ObjectValidatorConfig = {}) {
    this.message = config.message;
  }

  validate(valueContext: ValueContext) {
    // Undefined values are fine
    if (valueContext.value === undefined) {
      return Promise.resolve();
    }

    if (valueContext.value.constructor !== Object) {
      return Promise.reject(utils.createMessage(this.message || ObjectValidator.MESSAGE, {
        attribute: valueContext.attribute,
      }));
    }

    return Promise.resolve();

  }
}

