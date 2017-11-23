import Validator from './Validator';
import utils from './utils/utils';
import ValueContext from '../ValueContext';

export interface PresenceValidatorConfig {
  allowEmpty?: boolean;
  message?: string;
}

export default class PresenceValidator extends Validator {
  static MESSAGE = '{attribute} - can\'t be blank';

  public allowEmpty: boolean;
  public message?: string;

  constructor(config: PresenceValidatorConfig = {}) {
    super();

    this.message = config.message;
    this.allowEmpty = config.allowEmpty || false;
  }

  validate(valueContext: ValueContext) {
    if (
      this.allowEmpty
        ? !utils.isDefined(valueContext.value)
        : utils.isEmpty(valueContext.value)
    ) {
      return Promise.reject(this.createMessage(this.message || PresenceValidator.MESSAGE, {
        attribute: valueContext.attribute,
      }));
    }
    return Promise.resolve();
  }
}

