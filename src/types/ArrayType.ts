import AnyType, { AnyTypeConfig } from './AnyType';
import OneOfType from './OneOfType';
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
  types: AnyType | (AnyType | (() => AnyType))[] | (() => AnyType);
  validatorConfig?: ValidatorConfig;
}

export default class ArrayType extends AnyType {
  protected types: AnyType | (AnyType | (() => AnyType))[] | (() => AnyType);
  protected validatorConfig: ValidatorConfig;

  constructor(config: ArrayTypeConfig) {
    super(config);

    this.types = config.types;
    this.validatorConfig = config.validatorConfig || {};
    this.normalizeType = this.normalizeType.bind(this);
  }

  private normalizeType(type: AnyType | (AnyType | (() => AnyType))[] | (() => AnyType)): AnyType {
    if (typeof type === 'function') {
      return this.normalizeType(type());
    } else if (Array.isArray(type)) {
      const types = [...type].map(this.normalizeType);

      return new OneOfType({ types });
    } else if (type instanceof AnyType) {
      return type;
    }

    throw new Error('ArrayType:normalizeType - Invalid type description.');
  }

  protected applyValue(setContext: SetContext) {
    const type = this.normalizeType(this.types);
    const { value } = setContext.get();

    for (const k in value) {
      if (value.hasOwnProperty(k)) {
        const v = value[k];

        const nextSetContext = setContext.push(k, v);
        type.apply(nextSetContext);
      }
    }
  }

  protected setValue(setContext: SetContext) {
    const type = this.normalizeType(this.types);

    const nextSetContext = setContext.shift();

    if (nextSetContext) {
      type.set(nextSetContext);
    } else {
      type.apply(setContext);
    }
  }

  /**
   * Проверка типа для вложенного значения
   * @param valueContext ValueContext
   * @throws {Error}
   */
  protected setCheck(valueContext: ValueContext) {
    const { attribute } = valueContext;

    if (typeof attribute !== 'number') {
      throw new Error('ArrayType:setCheck - nested attribute key must be a number');
    }
  }

  protected canSetValue(setContext: SetContext): boolean {
    const type = this.normalizeType(this.types);

    const nextSetContext = setContext.shift();

    return nextSetContext
      ? type.canSet(nextSetContext)
      : type.canApply(setContext);
  }

  protected getTypeValue(setContext: SetContext): AnyType | null {
    const type = this.normalizeType(this.types);

    const nextSetContext = setContext.shift();

    if (nextSetContext) {
      return type.getType(nextSetContext);
    } else {
      return type;
    }
  }

  /**
   * Проверка типа
   * @param valueContext ValueContext
   * @throws {Error}
   */
  protected typeCheck(valueContext: ValueContext) {
    const value = valueContext.value;

    if (value !== undefined && !Array.isArray(value)) {
      throw new Error('ObjectType:typeCheck - the value must be an array');
    }
  }

  getValidator(setContext: SetContext) {
    let validator = this.validator;

    if (validator) {
      validator = new MultipleValidator({
        validators: [
          new ArrayValidator({
            setContext,
            type: this.normalizeType(this.types),
            ...this.validatorConfig,
          }),
          validator,
        ],
      });
    } else {
      validator = new ArrayValidator({
        setContext,
        type: this.normalizeType(this.types),
        ...this.validatorConfig,
      });
    }

    return validator;
  }
}
