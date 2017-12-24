import Validator from './Validator';
import Message from './utils/Message';
import ValueContext from '../ValueContext';
import utils from './utils/utils';

export interface NumberValidatorConfig {
  errorMessageNotNumber?: string;
  errorMessageOnlyInteger?: string;
  errorMessageGreaterThan?: string;
  errorMessageGreaterThanOrEqualTo?: string;
  errorMessageEqualTo?: string;
  errorMessageLessThan?: string;
  errorMessageLessThanOrEqualTo?: string;
  errorMessageDivisibleBy?: string;
  errorMessageNotOdd?: string;
  errorMessageNotEven?: string;
  strict?: boolean;
  onlyInteger?: boolean;
  odd?: boolean;
  even?: boolean;
  greaterThan?: number;
  greaterThanOrEqualTo?: number;
  equalTo?: number;
  lessThan?: number;
  lessThanOrEqualTo?: number;
  divisibleBy?: number;

}
export default class NumberValidator extends Validator {
  static ERROR_MESSAGE_NOT_NUMBER = '{attribute} - must be a valid number';
  static ERROR_MESSAGE_ONLY_INTEGER = '{attribute} - must be an integer';
  static ERROR_MESSAGE_GREATER_THAN = '{attribute} - must be greater than {count}';
  static ERROR_MESSAGE_GREATER_THAN_OR_EQUAL_TO = '{attribute} - must be greater than or equal to {count}';
  static ERROR_MESSAGE_EQUAL_TO = '{attribute} - must be equal to {count}';
  static ERROR_MESSAGE_LESS_THAN = '{attribute} - must be less than {count}';
  static ERROR_MESSAGE_LESS_THAN_OR_EQUAL_TO = '{attribute} - must be less than or equal to {count}';
  static ERROR_MESSAGE_DIVISIBLE_BY = '{attribute} - must be divisible by {count}';
  static ERROR_MESSAGE_NOT_ODD = '{attribute} - must be odd';
  static ERROR_MESSAGE_NOT_EVEN = '{attribute} - must be even';

  private errorMessageNotNumber?: string;
  private errorMessageOnlyInteger?: string;
  private errorMessageGreaterThan?: string;
  private errorMessageGreaterThanOrEqualTo?: string;
  private errorMessageEqualTo?: string;
  private errorMessageLessThan?: string;
  private errorMessageLessThanOrEqualTo?: string;
  private errorMessageDivisibleBy?: string;
  private errorMessageNotOdd?: string;
  private errorMessageNotEven?: string;
  private strict: boolean;
  private onlyInteger: boolean;
  private odd: boolean;
  private even: boolean;
  private greaterThan?: number;
  private greaterThanOrEqualTo?: number;
  private equalTo?: number;
  private lessThan?: number;
  private lessThanOrEqualTo?: number;
  private divisibleBy?: number;
  
  constructor(config: NumberValidatorConfig = {}) {
    super();

    this.errorMessageNotNumber = config.errorMessageNotNumber;
    this.errorMessageOnlyInteger = config.errorMessageOnlyInteger;
    this.errorMessageGreaterThan = config.errorMessageGreaterThan;
    this.errorMessageGreaterThanOrEqualTo = config.errorMessageGreaterThanOrEqualTo;
    this.errorMessageEqualTo = config.errorMessageEqualTo;
    this.errorMessageLessThan = config.errorMessageLessThan;
    this.errorMessageLessThanOrEqualTo = config.errorMessageLessThanOrEqualTo;
    this.errorMessageDivisibleBy = config.errorMessageDivisibleBy;
    this.errorMessageNotOdd = config.errorMessageNotOdd;
    this.errorMessageNotEven = config.errorMessageNotEven;
    this.strict = config.strict || false;
    this.onlyInteger = config.onlyInteger || false;
    this.greaterThan = config.greaterThan;
    this.greaterThanOrEqualTo = config.greaterThanOrEqualTo;
    this.equalTo = config.equalTo;
    this.lessThan = config.lessThan;
    this.lessThanOrEqualTo = config.lessThanOrEqualTo;
    this.divisibleBy = config.divisibleBy;
    this.odd = config.odd || false;
    this.even = config.even || false;
  }

  validate(valueContext: ValueContext): Promise<void | string | Message> {
    let { value } = valueContext;
    const { attribute } = valueContext;

    // Empty values are fine
    if (!utils.isDefined(value) || utils.isEmpty(value)) {
      return Promise.resolve();
    }

    // Strict will check that it is a valid looking number
    if (utils.isString(value) && this.strict) {
      let pattern = '^(0|[1-9]\\d*)';
      if (!this.onlyInteger) {
        pattern += '(\\.\\d+)?';
      }
      pattern += '$';

      if (!(new RegExp(pattern).test(value))) {
        return Promise.reject(
          utils.createMessage(this.errorMessageNotNumber || NumberValidator.ERROR_MESSAGE_NOT_NUMBER, {
            attribute,
          }),
        );
      }
    }

    // Coerce the value to a number unless we're being strict.
    // if (options.noStrings !== true && utils.isString(value) && !utils.isEmpty(value)) {
    //     value = +value;
    // }

    value = +value;

    // If it's not a number we shouldn't continue since it will compare it.
    if (!utils.isNumber(value)) {
      return Promise.reject(
        utils.createMessage(this.errorMessageNotNumber || NumberValidator.ERROR_MESSAGE_NOT_NUMBER, {
          attribute,
        }),
      );
    }

    // Same logic as above, sort of. Don't bother with comparisons if this
    // doesn't pass.
    if (this.onlyInteger && !utils.isInteger(value)) {
      return Promise.reject(
        utils.createMessage(this.errorMessageOnlyInteger || NumberValidator.ERROR_MESSAGE_ONLY_INTEGER, {
          attribute,
        }),
      );
    }

    if (this.greaterThan !== undefined && utils.isNumber(this.greaterThan) && !(value > this.greaterThan)) {
      return Promise.reject(
        utils.createMessage(this.errorMessageGreaterThan || NumberValidator.ERROR_MESSAGE_GREATER_THAN, {
          attribute,
          count: this.greaterThan,
        }),
      );
    }

    if (this.greaterThanOrEqualTo !== undefined && utils.isNumber(this.greaterThanOrEqualTo) && !(value >= this.greaterThanOrEqualTo)) {
      return Promise.reject(
        utils.createMessage(this.errorMessageGreaterThanOrEqualTo || NumberValidator.ERROR_MESSAGE_GREATER_THAN_OR_EQUAL_TO, {
          attribute,
          count: this.greaterThanOrEqualTo,
        }),
      );
    }

    if (this.equalTo !== undefined && utils.isNumber(this.equalTo) && !(value === this.equalTo)) {
      return Promise.reject(
        utils.createMessage(this.errorMessageEqualTo || NumberValidator.ERROR_MESSAGE_EQUAL_TO, {
          attribute,
          count: this.equalTo,
        }),
      );
    }

    if ((this.lessThan !== undefined) && utils.isNumber(this.lessThan) && !(value < this.lessThan)) {
      return Promise.reject(
        utils.createMessage(this.errorMessageLessThan || NumberValidator.ERROR_MESSAGE_LESS_THAN, {
          attribute,
          count: this.lessThan,
        }),
      );
    }

    if (this.lessThanOrEqualTo !== undefined && utils.isNumber(this.lessThanOrEqualTo) && !(value <= this.lessThanOrEqualTo)) {
      return Promise.reject(
        utils.createMessage(this.errorMessageLessThanOrEqualTo || NumberValidator.ERROR_MESSAGE_LESS_THAN_OR_EQUAL_TO, {
          attribute,
          count: this.lessThanOrEqualTo,
        }),
      );
    }

    if (this.divisibleBy !== undefined && utils.isNumber(this.divisibleBy) && !(value % this.divisibleBy === 0)) {
      return Promise.reject(
        utils.createMessage(this.errorMessageDivisibleBy || NumberValidator.ERROR_MESSAGE_DIVISIBLE_BY, {
          attribute,
          count: this.divisibleBy,
        }),
      );
    }

    if (this.odd === true && Math.abs(value) % 2 !== 1) {
      return Promise.reject(
        utils.createMessage(this.errorMessageNotOdd || NumberValidator.ERROR_MESSAGE_NOT_ODD, {
          attribute,
        }),
      );
    }

    if (this.even === true && Math.abs(value) % 2 !== 0) {
      return Promise.reject(
        utils.createMessage(this.errorMessageNotEven || NumberValidator.ERROR_MESSAGE_NOT_EVEN, {
          attribute,
        }),
      );
    }

    return Promise.resolve();
  }
}

