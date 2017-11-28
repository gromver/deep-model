import Validator from './Validator';
import utils from './utils/utils';
import Message from './utils/Message';
import ValueContext from '../ValueContext';

export interface CompareValidatorConfig {
  errorMessage?: string;
  compareAttribute?: string | (string | number)[];
  compareValue?: any;
  operator?: string;
}

export default class CompareValidator extends Validator {
  static ERROR_MESSAGE = '{attribute} - must equals "{value}" value';

  public errorMessage?: string;
  public compareAttribute?: string | (string | number)[];
  public compareValue?: any;
  public operator?: string;

  constructor(config: CompareValidatorConfig) {
    super();

    if (!utils.isDefined(config.compareAttribute) && !utils.isDefined(config.compareValue)) {
      throw new Error('either compareAttribute or compareValue prop must be set.');
    }

    // todo add operator support ('==', '===', '!==', '!=', '<=', '>=')
    this.errorMessage = config.errorMessage;
    this.compareAttribute = config.compareAttribute;
    this.compareValue = config.compareValue;
    this.operator = config.operator;
  }

  validate(valueContext: ValueContext): Promise<void | string | Message> {
    const { value, model, attribute } = valueContext;

    // Undefined values are fine
    if (!utils.isDefined(value)) {
      return Promise.resolve();
    }

    let compareValue;

    if (this.compareAttribute) {
      compareValue = model.get(this.compareAttribute);
    } else {
      compareValue = this.compareValue;
    }

    if (value !== compareValue) {
      return Promise.reject(
        utils.createMessage(this.errorMessage || CompareValidator.ERROR_MESSAGE, {
          attribute,
          value: compareValue,
        }),
      );
    }

    return Promise.resolve();
  }
}