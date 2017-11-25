import AnyType from '../types/AnyType';
import Validator from './Validator';
import Message from './utils/Message';
import ValueContext from '../ValueContext';
import SetContext from '../SetContext';
import utils from './utils/utils';

export interface OneOfTypeValidatorConfig {
  errorMessageRule?: string;
  rule?: AnyType;
  setContext: SetContext;
}

export default class OneOfTypeValidator extends Validator {
  static ERROR_MESSAGE_RULE = '{attribute} - the rule for a given value is undefined';

  private errorMessageRule?: string;
  private rule?: AnyType;
  private setContext: SetContext;

  constructor(config: OneOfTypeValidatorConfig) {
    super();

    this.errorMessageRule = config.errorMessageRule;
    this.rule = config.rule;
    this.setContext = config.setContext;
  }

  validate(valueContext: ValueContext): Promise<void | string | Message> {
    const { rule, setContext } = this;

    if (!rule) {
      return Promise.reject(
        utils.createMessage(this.errorMessageRule || OneOfTypeValidator.ERROR_MESSAGE_RULE, {
          attribute: valueContext.attribute,
        }),
      );
    }

    return rule.validate(setContext);
  }
}

