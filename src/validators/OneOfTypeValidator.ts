import AnyType from '../types/AnyType';
import Validator from './Validator';
import Message from './utils/Message';
import ValueContext from '../ValueContext';
import SetContext from '../SetContext';
import utils from './utils/utils';

export interface OneOfTypeValidatorConfig {
  errorMessageRule?: string;
  type?: AnyType;
  setContext: SetContext;
}

export default class OneOfTypeValidator extends Validator {
  static ERROR_MESSAGE_RULE = '{attribute} - the type for a given value is undefined';

  private errorMessageRule?: string;
  private type?: AnyType;
  private setContext: SetContext;

  constructor(config: OneOfTypeValidatorConfig) {
    super();

    this.errorMessageRule = config.errorMessageRule;
    this.type = config.type;
    this.setContext = config.setContext;
  }

  validate(valueContext: ValueContext): Promise<void | string | Message> {
    const { type, setContext } = this;

    if (!type) {
      return Promise.reject(
        utils.createMessage(this.errorMessageRule || OneOfTypeValidator.ERROR_MESSAGE_RULE, {
          attribute: valueContext.attribute,
        }),
      );
    }

    return type.validate(setContext);
  }
}

