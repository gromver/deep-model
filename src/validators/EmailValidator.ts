import Validator from './Validator';
import utils from './utils/utils';
import Message from './utils/Message';
import ValueContext from '../ValueContext';

export interface EmailValidatorConfig {
  errorMessage?: string;
}

export default class EmailValidator extends Validator {
  static PATTERN = /^[a-z0-9\u007F-\uffff!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9\u007F-\uffff!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i;
  static ERROR_MESSAGE = '{attribute} - is not a valid email';

  public errorMessage?: string;

  constructor(config: EmailValidatorConfig = {}) {
    super();

    this.errorMessage = config.errorMessage;
  }

  validate(valueContext: ValueContext): Promise<void | string | Message> {
    const { value, attribute } = valueContext;

    const message = utils.createMessage(this.errorMessage || EmailValidator.ERROR_MESSAGE, {
      attribute,
    });

    // Empty values are fine
    if (!utils.isDefined(value) || utils.isEmpty(value)) {
      return Promise.resolve();
    }
    if (!utils.isString(value)) {
      return Promise.reject(message);
    }
    if (!EmailValidator.PATTERN.exec(value)) {
      return Promise.reject(message);
    }

    return Promise.resolve();
  }
}

