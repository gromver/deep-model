import Validator from './Validator';
import Message from './utils/Message';
import utils from './utils/utils';
import ValueContext from '../ValueContext';

export interface PresenceValidatorConfig {
  allowEmpty?: boolean;
  errorMessage?: string;
}

export default class PresenceValidator extends Validator {
  static MESSAGE = '{attribute} - can\'t be blank';

  public allowEmpty: boolean;
  public errorMessage?: string;

  constructor(config: PresenceValidatorConfig = {}) {
    super();

    this.errorMessage = config.errorMessage;
    this.allowEmpty = config.allowEmpty || false;
  }

  validate(valueContext: ValueContext): Promise<void | string | Message> {
    const isDefined = utils.isDefined(valueContext.value);

    if (this.allowEmpty && !isDefined) {
      return Promise.resolve();
    }

    if (!isDefined || utils.isEmpty(valueContext.value)) {
      return Promise.reject(utils.createMessage(this.errorMessage || PresenceValidator.MESSAGE, {
        attribute: valueContext.attribute,
      }));
    }

    return Promise.resolve();
  }
}

