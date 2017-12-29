import AnyType, { AnyTypeConfig } from './AnyType';
import AnyOfType from './AnyOfType';
import SetContext from '../SetContext';
import ValueContext from '../ValueContext';
import Validator from '../validators/Validator';
import ArrayValidator from '../validators/ArrayValidator';
import MultipleValidator from '../validators/MultipleValidator';

export interface ValidatorConfig {
  errorMessageType?: string;
  errorMessageFields?: string;
  errorMessageMaxLength?: string;
  errorMessageMinLength?: string;
  warningMessage?: string;
  maxLength?: number;
  minLength?: number;
}

export interface ArrayTypeConfig extends AnyTypeConfig {
  items: AnyType | (AnyType | (() => AnyType))[] | (() => AnyType);
  validatorConfig?: ValidatorConfig;
}

export default class ArrayType extends AnyType {
  protected items: AnyType | (AnyType | (() => AnyType))[] | (() => AnyType);
  protected validatorConfig: ValidatorConfig;

  constructor(config: ArrayTypeConfig) {
    super(config);

    this.items = config.items;
    this.validatorConfig = config.validatorConfig || {};
    this.normalizeType = this.normalizeType.bind(this);
  }

    /**
     * Normalize type
     * todo: добавить возможность настраивать типы для индексов массивов, как в json schema спеке
     * @param {(AnyType | (AnyType | (() => AnyType))[] | (() => AnyType))} type
     * @returns {AnyType}
     */
  private normalizeType(type: AnyType | (AnyType | (() => AnyType))[] | (() => AnyType)): AnyType {
    if (typeof type === 'function') {
      return this.normalizeType(type());
    } else if (Array.isArray(type)) {
      const types = [...type].map(this.normalizeType);

      return new AnyOfType({ types });
    } else if (type instanceof AnyType) {
      return type;
    }

    throw new Error('ArrayType:normalizeType - Invalid type description.');
  }

  protected applyImpl(setContext: SetContext) {
    const type = this.normalizeType(this.items);
    const valueContext = setContext.get();
    let { value } = valueContext;
    const { model, path } = valueContext;

    if (this.filter) {
      value = this.filter(value);
    }

    model.setValue(path, []);

    for (const k in value) {
      if (value.hasOwnProperty(k)) {
        const v = value[k];

        const nextSetContext = setContext.push(k, v);
        type.apply(nextSetContext);
      }
    }

    // значение установлено, сообщаем об этом
    model.dispatchValue(path);
  }

  protected setImpl(setContext: SetContext) {
    const type = this.normalizeType(this.items);

    const nextSetContext = setContext.shift();

    if (nextSetContext) {
      type.set(nextSetContext);
    } else {
      type.apply(setContext);
    }
  }

  /**
   * Проверка типа для вложенного значения
   * @param {SetContext} setContext
   * @throws {Error}
   */
  setCheck(setContext: SetContext) {
    const valueContext = setContext.get();
    const { attribute } = valueContext;

    if (typeof attribute !== 'number') {
      throw new Error('ArrayType:setCheck - nested attribute key must be a number');
    }

    const nextSetContext = setContext.shift();
    const type = this.normalizeType(this.items);

    if (nextSetContext) {
      type.setCheck(nextSetContext);
    } else {
      type.applyCheck(setContext);
    }
  }

  // protected canSetImpl(setContext: SetContext): boolean {
  //   const type = this.normalizeType(this.items);
  //
  //   const nextSetContext = setContext.shift();
  //
  //   return nextSetContext
  //     ? type.canSet(nextSetContext)
  //     : type.canApply(setContext);
  // }

  protected getTypeImpl(setContext: SetContext): AnyType | void {
    const type = this.normalizeType(this.items);

    const nextSetContext = setContext.shift();

    if (nextSetContext) {
      return type.getType(nextSetContext);
    } else {
      return type;
    }
  }

  /**
   * Проверка типа
   * @param {SetContext} setContext
   * @throws {Error}
   */
  protected typeCheck(setContext: SetContext) {
    const { value } = setContext.get();

    if (value !== undefined && !Array.isArray(value)) {
      throw new Error('ArrayType:typeCheck - the value must be an array');
    }
  }

  getValidator(setContext: SetContext): Validator | void {
    if (!this.canApply(setContext)) {
      return;
    }

    let validator = this.validator;

    if (validator) {
      validator = new MultipleValidator({
        validators: [
          new ArrayValidator({
            setContext,
            type: this.normalizeType(this.items),
            ...this.validatorConfig,
          }),
          validator,
        ],
      });
    } else {
      validator = new ArrayValidator({
        setContext,
        type: this.normalizeType(this.items),
        ...this.validatorConfig,
      });
    }

    return validator;
  }
}
