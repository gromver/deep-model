import SetContext from '../SetContext';
import ValueContext from '../ValueContext';
import Validator from '../validators/Validator';
import Message from '../validators/utils/Message';
import PendingState from '../validators/states/PendingState';
import WarningState from '../validators/states/WarningState';
import SuccessState from '../validators/states/SuccessState';
import ErrorState from '../validators/states/ErrorState';
import MultipleFilter from '../filters/MultipleFilter';
import MultiplePermission from '../permissions/MultiplePermission';
import MultipleValidator from '../validators/MultipleValidator';
import CustomValidator from '../validators/CustomValidator';

export interface AnyTypeConfig {
  permission?: ((context: ValueContext) => void) | [(context: ValueContext) => void];
  validator?: Validator | (Validator
    | ((context: ValueContext) => Promise<void | string | Message>))[]
    | ((context: ValueContext) => Promise<void | string | Message>); // Validator | Validator[];
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
    this.validator = config.validator && this.normalizeValidator(config.validator);
    this.filter = Array.isArray(config.filter)
      ? MultipleFilter(config.filter)
      : config.filter;
  }

  protected normalizeValidator(validator: Validator | (Validator
    | ((context: ValueContext) => Promise<void | string | Message>))[]
    | ((context: ValueContext) => Promise<void | string | Message>)): Validator {
    if (typeof validator === 'function') {
      return new CustomValidator({
        func: validator,
      });
    } else if (Array.isArray(validator)) {
      const validators = [...validator].map(this.normalizeValidator);

      return new MultipleValidator({ validators });
    } else if (validator instanceof Validator) {
      return validator;
    }

    throw new Error('AnyType:normalizeValidator - Invalid validator description.');
  }

  /* Set */
  set(setContext: SetContext) {
    this.setCheck(setContext);

    this.setImpl(setContext);
  }

  protected setImpl(setContext: SetContext) {}

  /**
   * Проверка на возможность установить вложенное значение
   * Если проверка не пройдена должен быть выброшен exception
   * @param {SetContext} setContext
   * @throws {Error}
   */
  setCheck(setContext: SetContext) {
    throw new Error('Primitive types don\'t support nested value setting.');
  }

  canSet(setContext: SetContext): boolean {
    try {
      this.setCheck(setContext);

      return true;
    } catch (error) {
      return false;
    }
  }

  /* Apply */
  apply(setContext: SetContext) {
    this.applyCheck(setContext);

    this.applyImpl(setContext);
  }

  /**
   * Проверка на возможность установить значение
   * Если проверка не пройдена должен быть выброшен exception
   * @param {ValueContext} setContext
   * @throws {Error}
   */
  applyCheck(setContext: SetContext) {
    this.typeCheck(setContext);

    this.permissionCheck(setContext);
  }

  protected applyImpl(setContext: SetContext) {
    const valueContext = setContext.get();

    if (this.filter) {
      setContext.mutate(this.filter(valueContext.value));
    }

    valueContext.model.setValue(valueContext.path, valueContext.value);
    valueContext.model.dispatchValue(valueContext.path);
  }

  canApply(setContext: SetContext): boolean {
    try {
      this.applyCheck(setContext);

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Попытка найти тип для указанного аттрибута
   * @param {SetContext} setContext
   * @returns {AnyType}
   */
  getType(setContext: SetContext): AnyType | void {
    try {
      this.setCheck(setContext);

      return this.getTypeImpl(setContext);
    } catch (error) { }
  }

  /**
   * Custom getType implementation
   * @param {SetContext} setContext
   * @returns {AnyType}
   */
  protected getTypeImpl(setContext: SetContext): AnyType | void {
    return;
  }

  /** Checks **/

  /**
   * Проверка типа
   * Примечание! undefined значения всегда должны проходить проверку
   * @param {SetContext} setContext
   * @throws {Error}
   */
  protected typeCheck(setContext: SetContext) {}

  /**
   * Запускаем кастомные проверки
   * @param {SetContext} setContext
   * @throws {Error}
   */
  protected permissionCheck(setContext: SetContext) {
    if (this.permission) {
      this.permission(setContext.get());
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

  /**
   * Возвращает валидатор в случае если данный тип применим для текущего сет контекста
   * @param {SetContext} setContext
   * @returns {Validator | void}
   */
  getValidator(setContext: SetContext): Validator | void {
    return this.canApply(setContext) ? this.validator : undefined;
  }
}
