import ValueContext from '../ValueContext';
import MultipleFilter from '../filters/MultipleFilter';
import MultiplePermission from '../permissions/MultiplePermission';
import TypeConfigPrimitive from '../interfaces/TypeConfigPrimitive';

export default class CommonType {
  protected permission?: (context: ValueContext) => boolean;
  protected validator?: [any];
  protected filter?: (value: any) => any;

  constructor(config: TypeConfigPrimitive) {
    this.permission = Array.isArray(config.permission)
      ? MultiplePermission(config.permission)
      : config.permission;
    this.validator = config.validator;
    this.filter = Array.isArray(config.filter)
      ? MultipleFilter(config.filter)
      : config.filter;
  }

  set(path: [string|number]|never[], context: ValueContext) {
    // const { value, path, model } = context;

    if (this.setCheck(path, context) && this.permissionCheck(context)) {
      // trigger set event
    }
  }

  validate(context: ValueContext) {

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

  /**
   * Запускаем кастомные проверки
   * @param {Context} context
   * @returns {boolean}
   */
  protected permissionCheck(context: ValueContext) {
    if (this.permission) {
      if (!this.permission(context)) {
        console.warn('You try to set a value without having permissions for that');

        return false;
      }
    }

    return true;
  }
}
