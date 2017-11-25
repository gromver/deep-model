import Validator from './Validator';
import Message from './utils/Message';
import ValueContext from '../ValueContext';

export interface CustomValidatorConfig {
  func: (valueContext: ValueContext) => Promise<void | string | Message>;
}

export default class CustomValidator extends Validator {
  public func;

  constructor(config: CustomValidatorConfig) {
    super();

    if (typeof config.func !== 'function') {
      throw new Error('CustomValidator::construct - func must be set.');
    }

    this.func = config.func;
  }

  validate(valueContext: ValueContext): Promise<void | string | Message> {
    return this.func(valueContext);
  }
}
