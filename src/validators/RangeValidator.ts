import Validator from './Validator';
import utils from './utils/utils';
import Message from './utils/Message';
import ValueContext from '../ValueContext';

export interface RangeValidatorConfig {
  errorMessageInRange?: string;
  errorMessageExceptRange?: string;
  inRange?: any[];
  exceptRange?: any[];
}

export default class RangeValidator extends Validator {
  static MESSAGE_IN_RANGE = '{attribute} - must be in range';
  static MESSAGE_EXCEPT_RANGE = '{attribute} - must not be in range';

  public errorMessageInRange?: string;
  public errorMessageExceptRange?: string;
  public inRange?: any[];
  public exceptRange?: any[];

  constructor(config: RangeValidatorConfig) {
    super();

    if (!config.inRange && !config.exceptRange) {
      throw new Error('either inRange or exceptRange prop must be set.');
    }

    this.errorMessageInRange = config.errorMessageInRange;
    this.errorMessageExceptRange = config.errorMessageExceptRange;
    this.inRange = config.inRange;
    this.exceptRange = config.exceptRange;
  }

  validate(valueContext: ValueContext): Promise<void | string | Message> {
    const { value, attribute } = valueContext;

    // Empty values are fine
    if (!utils.isDefined(value) || utils.isEmpty(value)) {
      return Promise.resolve();
    }

    if (this.inRange && this.inRange.indexOf(value) === -1) {
      return Promise.reject(
        utils.createMessage(this.errorMessageInRange || RangeValidator.MESSAGE_IN_RANGE, {
          attribute,
        }),
      );
    }

    if (this.exceptRange && this.exceptRange.indexOf(value) !== -1) {
      return Promise.reject(
        utils.createMessage(this.errorMessageExceptRange || RangeValidator.MESSAGE_EXCEPT_RANGE, {
          attribute,
        }),
      );
    }

    return Promise.resolve();
  }
}

