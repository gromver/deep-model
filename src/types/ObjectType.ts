import CommonType from './CommonType';
import ValueContext from '../ValueContext';
import TypeConfigObject from '../interfaces/TypeConfigObject';

export default class ObjectType extends CommonType {
  protected rules: { [key: string]: CommonType };

  constructor(config: TypeConfigObject) {
    super(config);

    this.rules = config.rules;
  }

  protected applyValue(path: [string|number]|never[], context: ValueContext) {
    const { model } = context;
    model.dispatch('test');
  }

  /**
   * Проверяем - можно ли установить данное знаечение в указанное место
   * @param {[(string | number)]} path
   * @param {Context} context
   * @returns {boolean}
   */
  protected setCheck(path: [string|number]|never[], context: ValueContext) {
    if (path.length) {
      console.warn('You try to set a value by the deep way to the simple typed value');

      return false;
    }

    return true;
  }
}
