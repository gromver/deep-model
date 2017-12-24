import ValidateInterface from './interfaces/ValidateInterface';
import ValueContext from '../ValueContext';
import Message from './utils/Message';

export default class Validator implements ValidateInterface {
  validate(valueContext: ValueContext): Promise<void | string | Message> {
    return Promise.resolve();
  }

  isValidator(validatorClass: any): boolean {
    return this instanceof validatorClass;
  }
}

