import SetContext from '../SetContext';
import ValueContext from '../ValueContext';
import Validator from '../validators/interfaces/ValidateInterface';
import Message from '../validators/utils/Message';
import PendingState from '../validators/states/PendingState';
import WarningState from '../validators/states/WarningState';
import SuccessState from '../validators/states/SuccessState';
import ErrorState from '../validators/states/ErrorState';
import MultipleFilter from '../filters/MultipleFilter';
import MultiplePermission from '../permissions/MultiplePermission';
import MultipleValidator from '../validators/MultipleValidator';

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
    this.validator = Array.isArray(config.validator)
      ? new MultipleValidator({ validators: config.validator })
      : config.validator;
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

    // model.dispatch(new SetValueEvent(path, value));
    model.setValue(path, value);
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

  validate(setContext: SetContext): Promise<string | Message | void> {
    const validator = this.getValidator(setContext);
    const valueContext = setContext.get();
    const job = (validator ? validator.validate(valueContext) : Promise.resolve());

    const jobState = job
      .then((warningMessage) => {
        const state = warningMessage
          ? new WarningState(warningMessage)
          : new SuccessState();

        valueContext.model.setValidationState(valueContext.path, state);

        return state;
      })
      .catch((errorMessage) => {
        const state = new ErrorState(errorMessage);

        valueContext.model.setValidationState(valueContext.path, state);

        return state;
      });

    Promise.race([jobState, new Promise((r) => setTimeout(() => r(new PendingState()), 0))])
      .then((state) => {
        if (state instanceof PendingState) {
          valueContext.model.setValidationState(valueContext.path, state);
        }
      });

    return job;
  }

  getValidator(setContext: SetContext): Validator | null {
    return this.validator || null;
  }
}
