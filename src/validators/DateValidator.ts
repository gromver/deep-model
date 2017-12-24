import Validator from './Validator';
import utils from './utils/utils';
import Message from './utils/Message';
import ValueContext from '../ValueContext';

export interface DateValidatorConfig {
  errorMessageNotDate?: string;
  errorMessageMaxDate?: string;
  errorMessageMinDate?: string;
  maxDate?: Date;
  minDate?: Date;
}

export default class DateValidator extends Validator {
  static ERROR_MESSAGE_NOT_DATE = '{attribute} - must be a date';
  static ERROR_MESSAGE_MIN_DATE = '{attribute} - must be later than {date}';
  static ERROR_MESSAGE_MAX_DATE = '{attribute} - must be earlier than {date}';

  public errorMessageNotDate?: string;
  public errorMessageMaxDate?: string;
  public errorMessageMinDate?: string;
  public maxDate?: Date;
  public minDate?: Date;

  constructor(config: DateValidatorConfig = {}) {
    super();

    if (config.minDate && !(utils.isDate(config.minDate))) {
      throw new Error('DateValidator - minDate must be a Date instance');
    }

    if (config.maxDate && !(utils.isDate(config.maxDate))) {
      throw new Error('DateValidator - maxDate must be a Date instance');
    }

    this.errorMessageNotDate = config.errorMessageNotDate;
    this.errorMessageMaxDate = config.errorMessageMaxDate;
    this.errorMessageMinDate = config.errorMessageMinDate;
    this.maxDate = config.maxDate;
    this.minDate = config.minDate;
  }

  validate(valueContext: ValueContext): Promise<void | string | Message> {
    const { value, attribute } = valueContext;

    // Undefined values are fine
    if (!utils.isDefined(value)) {
      return Promise.resolve();
    }

    if (!utils.isDate(value)) {
      return Promise.reject(
        utils.createMessage(this.errorMessageNotDate || DateValidator.ERROR_MESSAGE_NOT_DATE, {
          attribute,
        }),
      );
    }

    if (this.minDate && !(value >= this.minDate)) {
      return Promise.reject(
        utils.createMessage(this.errorMessageMinDate || DateValidator.ERROR_MESSAGE_MIN_DATE, {
          attribute,
          date: this.minDate,
        }),
      );
    }

    if (this.maxDate && !(value <= this.maxDate)) {
      return Promise.reject(
        utils.createMessage(this.errorMessageMaxDate || DateValidator.ERROR_MESSAGE_MAX_DATE, {
          attribute,
          date: this.maxDate,
        }),
      );
    }

    return Promise.resolve();
  }
}

