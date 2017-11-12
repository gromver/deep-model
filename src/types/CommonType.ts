import ValueContext from '../ValueContext';
import MultipleFilter from '../filters/MultipleFilter';
import MultiplePermission from '../permissions/MultiplePermission';
import TypeConfigPrimitive from '../interfaces/TypeConfigPrimitive';
import SetValueEvent from '../events/SetValueEvent';

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

  set(context: ValueContext) {
    const { currentPath, targetPath } = context;
    if (this.permissionCheck(context)) {
      const traversePath = targetPath.slice(currentPath.length);

      const [nestedAttribute, ...nestedPath] = traversePath;
      if (nestedAttribute) {  // deep setting
        if (this.canSetNestedValue(nestedAttribute)) {
          this.presetValue(context);

          context.currentPath.push(nestedAttribute);
          this.setDeepValue(nestedAttribute, context);
        } else {
          console.warn('Deep value setting is unsupported.');
        }
      } else {
        if (this.canSetValue(context)) {
          this.setValue(context);
        }
      }
    }
  }

  isTypeApplicable(context: ValueContext) {
    return this.typeCheck(context) && this.permissionCheck(context);
  }

  protected canSetValue(context: ValueContext): boolean {
    return true;
  }

  protected canSetNestedValue(nestedAttribute: string|number): boolean {
    return false;
  }

  protected setValue(context: ValueContext) {
    const { model, currentPath } = context;

    if (this.filter) {
      model.dispatch(new SetValueEvent(currentPath, this.filter(context.value)));
    } else {
      model.dispatch(new SetValueEvent(currentPath, context.value));
    }
  }

  protected setDeepValue(nestedAttribute: string|number, context: ValueContext) {}

  protected presetValue(context: ValueContext) {}

  protected typeCheck(context: ValueContext) {
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

  validate(context: ValueContext) {

  }
}
