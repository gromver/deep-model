import AnyType from './AnyType';
import SetContext from '../SetContext';

export default class BooleanType extends AnyType {
  /**
   * Проверка типа
   * @param {SetContext} setContext
   * @throws {Error}
   */
  protected typeCheck(setContext: SetContext) {
    const { value } = setContext.get();

    if (value !== undefined && typeof value !== 'boolean') {
      throw new Error('BooleanType:typeCheck - the value must be a boolean');
    }
  }
}
