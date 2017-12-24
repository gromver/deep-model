import AnyType from './AnyType';
import SetContext from '../SetContext';

export default class StringType extends AnyType {
  /**
   * Проверка типа
   * @param {SetContext} setContext
   * @throws {Error}
   */
  protected typeCheck(setContext: SetContext) {
    const { value } = setContext.get();

    if (value !== undefined && typeof value !== 'string') {
      throw new Error('StringType:typeCheck - the value must be a string');
    }
  }
}
