import AnyType from './AnyType';
import ValueContext from '../ValueContext';

export default class BooleanType extends AnyType {
  /**
   * Проверка типа
   * @param valueContext ValueContext
   * @throws {Error}
   */
  protected typeCheck(valueContext: ValueContext) {
    const value = valueContext.newValue;

    if (value !== undefined && typeof value !== 'boolean') {
      throw new Error('StringType:typeCheck - the value must be a boolean');
    }
  }
}
