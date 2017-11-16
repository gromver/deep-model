import AnyType from './AnyType';
import ValueContext from '../ValueContext';

export default class StringType extends AnyType {
  /**
   * Проверка типа
   * @param valueContext ValueContext
   * @throws {Error}
   */
  protected typeCheck(valueContext: ValueContext) {
    const value = valueContext.newValue;

    if (value !== undefined && typeof value !== 'string') {
      throw new Error('StringType:typeCheck - the value must be a string');
    }
  }
}
