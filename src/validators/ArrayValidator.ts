import AnyType from '../types/AnyType';
import Validator from './Validator';
import Message from './utils/Message';
import ValueContext from '../ValueContext';
import SetContext from '../SetContext';
import ValidationResult from './utils/ValidationResult';
import utils from './utils/utils';

export interface ArrayValidatorConfig {
  errorMessageType?: string;
  errorMessageFields?: string;
  errorMessageMaxLength?: string;
  errorMessageMinLength?: string;
  warningMessage?: string;
  maxLength?: number;
  minLength?: number;
  type: AnyType;
  setContext: SetContext;
}

export default class ArrayValidator extends Validator {
  static ERROR_MESSAGE_TYPE = '{attribute} - array has an invalid type';
  static ERROR_MESSAGE_FIELDS = '{attribute} - array has invalid fields';
  static ERROR_MESSAGE_MIN_LENGTH = '{attribute} - has not enough elements in the array ' +
    '(minimum is {count})';
  static ERROR_MESSAGE_MAX_LENGTH = '{attribute} - has too many elements in the array ' +
    '(maximum is {count})';

  static WARNING_MESSAGE = '{attribute} - array has some fields with warnings';

  private errorMessageType?: string;
  private errorMessageFields?: string;
  private errorMessageMaxLength?: string;
  private errorMessageMinLength?: string;
  private warningMessage?: string;
  private maxLength?: number;
  private minLength?: number;
  private type: AnyType;
  private setContext: SetContext;

  constructor(config: ArrayValidatorConfig) {
    super();

    this.errorMessageType = config.errorMessageType;
    this.errorMessageFields = config.errorMessageFields;
    this.errorMessageMaxLength = config.errorMessageMaxLength;
    this.errorMessageMinLength = config.errorMessageMinLength;
    this.warningMessage = config.warningMessage;
    this.maxLength = config.maxLength;
    this.minLength = config.minLength;
    this.type = config.type;
    this.setContext = config.setContext;
  }

  validate(valueContext: ValueContext): Promise<void | string | Message> {
    const { value } = valueContext;

    // Undefined values are fine
    if (value === undefined) {
      return Promise.resolve();
    }

    if (!utils.isArray(value)) {
      return Promise.reject(
        utils.createMessage(this.errorMessageType || ArrayValidator.ERROR_MESSAGE_TYPE, {
          attribute: valueContext.attribute,
        }),
      );
    }

    const length = value.length;

    if (this.minLength && utils.isNumber(this.minLength) && !(length >= this.minLength)) {
      return Promise.reject(
        utils.createMessage(this.errorMessageMinLength || ArrayValidator.ERROR_MESSAGE_MIN_LENGTH, {
          attribute: valueContext.attribute,
          count: this.minLength,
        }),
      );
    }

    if (this.maxLength && utils.isNumber(this.maxLength) && !(length <= this.maxLength)) {
      return Promise.reject(
        utils.createMessage(this.errorMessageMaxLength || ArrayValidator.ERROR_MESSAGE_MAX_LENGTH, {
          attribute: valueContext.attribute,
          count: this.maxLength,
        }),
      );
    }

    const { type, setContext } = this;

    return new Promise((resolve, reject) => {
      const jobs: Promise<ValidationResult>[] = [];

      // index should be an integer
      for (let k = 0; k < length; k += 1) {
        if (value.hasOwnProperty(k)) {
          const v = value[k];

          if (type) {
            const nextSetContext = setContext.push(k, v);
            jobs.push(
              type.validate(nextSetContext)
                .then((warning) => warning ? ValidationResult.warning : ValidationResult.success)
                .catch(() => ValidationResult.error),
            );
          }
        }
      }

      Promise.all(jobs).then((results) => {
        if (results.indexOf(ValidationResult.error) !== -1) {
          reject(
            utils.createMessage(this.errorMessageFields || ArrayValidator.ERROR_MESSAGE_FIELDS, {
              attribute: valueContext.attribute,
            }),
          );
        } else if (results.indexOf(ValidationResult.warning) !== -1) {
          resolve(
            utils.createMessage(this.warningMessage || ArrayValidator.WARNING_MESSAGE, {
              attribute: valueContext.attribute,
            }),
          );
        } else {
          resolve();
        }
      });
    });
  }
}

