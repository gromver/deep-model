import ModelContext from '../ModelContext';
import ValueContext from '../ValueContext';
import MultipleFilter from '../filters/MultipleFilter';
import MultiplePermission from '../permissions/MultiplePermission';
import TypeConfigPrimitive from '../interfaces/TypeConfigPrimitive';
import SetValueEvent from '../events/SetValueEvent';

export default class AnyType {
  protected permission?: (context: ValueContext) => void;
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

  set(modelContext: ModelContext, value: any) {
    const [currentContext, nextContext] = modelContext.get();

    if (this.filter) {
      value = this.filter(value);
    }

    this.typeCheck(value);

    this.permissionCheck(currentContext);

    if (currentContext.value !== value) {
      this.setValue(new ValueContext({
        ...currentContext,
        value,
      }));
    }

    if (nextContext) {
      this.deepAttributeCheck(nextContext.attribute);
      modelContext.shift();
      this.setDeepValue(modelContext);
    }

    // if (this.permissionCheck(modelContext)) {
    //   const traversePath = targetPath.slice(currentPath.length);
    //
    //   const [nestedAttribute, ...nestedPath] = traversePath;
    //   if (nestedAttribute) {  // deep setting
    //     if (this.canSetNestedValue(nestedAttribute)) {
    //       this.presetValue(modelContext);
    //
    //       modelContext.currentPath.push(nestedAttribute);
    //       this.setDeepValue(nestedAttribute, modelContext);
    //     } else {
    //       console.warn('Deep value setting is unsupported.');
    //     }
    //   } else {
    //     if (this.canSetValue(modelContext)) {
    //       this.setValue(modelContext);
    //     }
    //   }
    // }
  }

  // isTypeApplicable(context: ModelContext) {
  //   return this.typeCheck(context) && this.permissionCheck(context);
  // }

  // protected canSetValue(context: ModelContext): boolean {
  //   return true;
  // }

  protected setValue(context: ValueContext) {
    const { model, path } = context;

    model.dispatch(new SetValueEvent(path, context.value));
  }

  protected setDeepValue(modelContext: ModelContext) {}

  // protected presetValue(context: ModelContext) {}

  /** Checks **/

  /**
   * Можно ли записать вложенное значение
   * @param {string | number} attribute
   * @throws Error
   */
  protected deepAttributeCheck(attribute: string|number) {}

  /**
   * Проверка типа
   * @param value
   * @throws {Error}
   */
  protected typeCheck(value: any) {}

  /**
   * Запускаем кастомные проверки
   * @param {Context} context
   * @throws {Error}
   */
  protected permissionCheck(context: ValueContext) {
    if (this.permission) {
      if (!this.permission(context)) {
        throw new Error('You try to set a value without having permissions for that');
      }
    }
  }

  validate(context: ModelContext) {

  }

  getValidator(context: ModelContext) {
    //
  }
}
