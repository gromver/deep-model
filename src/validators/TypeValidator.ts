import AnyType from '../types/AnyType';
import Validator from './Validator';
import Message from './utils/Message';
import ValueContext from '../ValueContext';
import SetContext from '../SetContext';

export interface TypeValidatorConfig {
  type: AnyType;
  setContext: SetContext;
}

export default class TypeValidator extends Validator {
  private type: AnyType;
  private setContext: SetContext;

  constructor(config: TypeValidatorConfig) {
    super();

    this.type = config.type;
    this.setContext = config.setContext;
  }

  validate(valueContext: ValueContext): Promise<void | string | Message> {
    const { type, setContext } = this;

    return type.validate(setContext);
  }
}

