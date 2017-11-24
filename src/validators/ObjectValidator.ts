import Validator from './Validator';
import Message from './utils/Message';
import utils from './utils/utils';
import ValueContext from '../ValueContext';
import AnyType from '../types/AnyType';

export interface ObjectValidatorConfig {
  message?: string;
}

export default class ObjectValidator extends Validator {
  static MESSAGE = '{attribute} - object has invalid fields';

  public rules: { [key: string]: AnyType };
  public message?: string;

  constructor(config: ObjectValidatorConfig = {}) {
    super();

    this.message = config.message;
  }

  validate(valueContext: ValueContext): Promise<void | string | Message> {
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

