import AnyType from './AnyType';
import ValueContext from '../ValueContext';

export default class NumberType extends AnyType {
  /**
   * Проверка типа
   * @param valueContext ValueContext
   * @throws {Error}
   */
  protected typeCheck(valueContext: ValueContext) {
    const value = valueContext.value;

    if (value !== undefined && typeof value !== 'number') {
      throw new Error('StringType:typeCheck - the value must be a number');
    }
  }
}
