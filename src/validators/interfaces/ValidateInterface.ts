import Message from '../utils/Message';
import ValueContext from '../../ValueContext';

export default interface ValidateInterface {
  /**
   * Validate the value
   * @param {ValueContext} valueContext
   * @returns {Promise<string | Message | void>}
   */
  validate(valueContext: ValueContext): Promise<string | Message | void>;
}
