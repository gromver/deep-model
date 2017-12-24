import AnyType from './AnyType';
import SetContext from '../SetContext';

export default class FunctionType extends AnyType {
  /**
   * Проверка типа
   * @param {SetContext} setContext
   * @throws {Error}
   */
  protected typeCheck(setContext: SetContext) {
    const { value } = setContext.get();

    if (value !== undefined && typeof value !== 'function') {
      throw new Error('FunctionType:typeCheck - the value must be a function');
    }
  }
}
