import SetContext from '../SetContext';
import ValueContext from '../ValueContext';
import Validator from '../validators/Validator';
import MultipleFilter from '../filters/MultipleFilter';
import MultiplePermission from '../permissions/MultiplePermission';
import SetValueEvent from '../events/SetValueEvent';

export interface AnyTypeConfig {
  permission?: ((context: ValueContext) => void) | [(context: ValueContext) => void];
  validator?: Validator | Validator[];
  filter?: ((value: any) => any) | [(value: any) => any];
}

export default class AnyType {
  protected permission?: (context: ValueContext) => void;
  protected validator?: Validator;
  protected filter?: (value: any) => any;

  constructor(config: AnyTypeConfig = {}) {
    this.permission = Array.isArray(config.permission)
      ? MultiplePermission(config.permission)
      : config.permission;
    this.validator = config.validator as Validator;
    this.filter = Array.isArray(config.filter)
      ? MultipleFilter(config.filter)
      : config.filter;
  }

  /* Set */
  set(setContext: SetContext) {
    const valueContext = setContext.get();

    this.setCheck(valueContext);

    this.setValue(setContext);
  }

  protected setCheck(valueContext: ValueContext) {
    throw new Error('Primitive types don\'t support nested value setting.');
  }

  protected setValue(setContext: SetContext) {}

  canSet(setContext: SetContext): boolean {
    try {
      const valueContext = setContext.get();

      this.setCheck(valueContext);

      return this.canSetValue(setContext);
    } catch (error) {
      return false;
    }
  }

  protected canSetValue(setContext: SetContext): boolean {
    return false;
  }

  /* Apply */
  apply(setContext: SetContext) {
    const valueContext = setContext.get();

    this.applyCheck(valueContext);

    this.applyValue(setContext);
  }

  protected applyCheck(valueContext: ValueContext) {
    if (this.filter) {
      valueContext.value = this.filter(valueContext.value);
    }

    this.typeCheck(valueContext);

    this.permissionCheck(valueContext);
  }

  protected applyValue(setContext: SetContext) {
    const { model, path, value } = setContext.get();

    model.dispatch(new SetValueEvent(path, value));
  }

  canApply(setContext: SetContext): boolean {
    try {
      const valueContext = setContext.get();

      this.applyCheck(valueContext);

      return true;
    } catch (error) {
      return false;
    }
  }

  getType(setContext: SetContext): AnyType | null {
    try {
      const valueContext = setContext.get();

      this.setCheck(valueContext);

      return this.getTypeValue(setContext);
    } catch (error) {
      return null;
    }
  }

  protected getTypeValue(setContext: SetContext): AnyType | null {
    return null;
  }

  /** Checks **/

  /**
   * Проверка типа
   * @param valueContext ValueContext
   * @throws {Error}
   */
  protected typeCheck(valueContext: ValueContext) {}

  /**
   * Запускаем кастомные проверки
   * @param {Context} valueContext
   * @throws {Error}
   */
  protected permissionCheck(valueContext: ValueContext) {
    if (this.permission) {
      this.permission(valueContext);
    }
  }

  getFilter() {
    return this.filter;
  }

  validate(setContext: SetContext) {
    const validator = this.getValidator();

    return (validator ? validator.validate(setContext.get()) : Promise.resolve())
      .then((warning) => {

      })
      .catch((error) => {

      });
  }

  getValidator(): Validator | null {
    return this.validator || null;
  }
}
