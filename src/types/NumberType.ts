import AnyType from './AnyType';
import SetContext from '../SetContext';

export default class NumberType extends AnyType {
  /**
   * Проверка типа
   * @param {SetContext} setContext
   * @throws {Error}
   */
  protected typeCheck(setContext: SetContext) {
    const { value } = setContext.get();

    if (value !== undefined && typeof value !== 'number') {
      throw new Error('NumberType:typeCheck - the value must be a number');
    }
  }
}
