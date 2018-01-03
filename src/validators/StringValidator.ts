import Validator from './Validator';
import utils from './utils/utils';
import Message from './utils/Message';
import ValueContext from '../ValueContext';

export interface StringValidatorConfig {
  messageNotString?: string;
  messageMaxLength?: string;
  messageMinLength?: string;
  messagePattern?: string;
  maxLength?: number;
  minLength?: number;
  pattern?: string | RegExp;
  flags?: string;
}

export default class StringValidator extends Validator implements StringValidatorConfig {
  static MESSAGE_NOT_STRING = '{attribute} - must be a string';
  static MESSAGE_MIN_LENGTH = '{attribute} - is too short (minimum is {count} characters)';
  static MESSAGE_MAX_LENGTH = '{attribute} - is too long (maximum is {count} characters)';
  static MESSAGE_PATTERN = '{attribute} - is invalid';

  public messageNotString?: string;
  public messageMaxLength?: string;
  public messageMinLength?: string;
  public messagePattern?: string;
  public maxLength?: number;
  public minLength?: number;
  public pattern?: string | RegExp;
  public flags?: string;

  constructor(config: StringValidatorConfig = {}) {
    super();

    this.messageNotString = config.messageNotString;
    this.messageMaxLength = config.messageMaxLength;
    this.messageMinLength = config.messageMinLength;
    this.messagePattern = config.messagePattern;
    this.maxLength = config.maxLength;
    this.minLength = config.minLength;
    this.pattern = config.pattern;
    this.flags = config.flags;
  }

  validate(valueContext: ValueContext): Promise<void | string | Message> {
    const value = valueContext.value;
    // Empty values are fine
    if (!utils.isDefined(value) || utils.isEmpty(value)) {
      return Promise.resolve();
    }

    if (!utils.isString(value)) {
      return Promise.reject(
        utils.createMessage(this.messageNotString || StringValidator.MESSAGE_NOT_STRING, {
          attribute: valueContext.attribute,
        }),
      );
    }

    const length = value.length;

    if (this.minLength && utils.isNumber(this.minLength) && !(length >= this.minLength)) {
      return Promise.reject(
        utils.createMessage(this.messageMinLength || StringValidator.MESSAGE_MIN_LENGTH, {
          attribute: valueContext.attribute,
          count: this.minLength,
        }),
      );
    }

    if (this.maxLength && utils.isNumber(this.maxLength) && !(length <= this.maxLength)) {
      return Promise.reject(
        utils.createMessage(this.messageMaxLength || StringValidator.MESSAGE_MAX_LENGTH, {
          attribute: valueContext.attribute,
          count: this.maxLength,
        }),
      );
    }

    let pattern = this.pattern;

    if (pattern) {
      if (utils.isString(pattern)) {
        pattern = new RegExp(pattern as string, this.flags);
      }

      const match = (pattern as RegExp).exec(value);

      if (!match) {
        return Promise.reject(
          utils.createMessage(this.messagePattern || StringValidator.MESSAGE_PATTERN, {
            attribute: valueContext.attribute,
          }),
        );
      }
    }

    return Promise.resolve();
  }
}
