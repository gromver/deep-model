import Message from './utils/Message';
import ValueContext from '../ValueContext';

export default class Validator {
  /**
   * Message instance creator
   * @param {string} message
   * @param {{}} bindings
   * @returns {Message}
   */
  static createMessage(message: string, bindings: {}): Message {
    return new Message(message, bindings);
  }

  /**
   * Validator.createMessage wrapper for using in object context
   * @param {string} message
   * @param {{}} bindings
   * @returns {Message}
   */
  createMessage(message: string, bindings: {}): Message {
    return Validator.createMessage(message, bindings);
  }

  /**
   * Validate the value
   * @param {ValueContext} valueContext
   * @returns {Promise}
   */
  validate(valueContext: ValueContext): Promise<any> {
    return Promise.resolve();
  }
}
