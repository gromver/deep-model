import AnyType, { AnyTypeConfig } from './AnyType';
import OneOfType from './OneOfType';
import SetContext from '../SetContext';
import ValueContext from '../ValueContext';
import Validator from '../validators/Validator';
import ObjectValidator from '../validators/ObjectValidator';
import MultipleValidator from '../validators/MultipleValidator';

export interface ValidatorConfig {
  errorMessageType?: string;
  errorMessageFields?: string;
  warningMessage?: string;
}

export interface ObjectTypeConfig extends AnyTypeConfig {
  rules: { [key: string]: AnyType | (AnyType | (() => AnyType))[] | (() => AnyType) };
  validatorConfig?: ValidatorConfig;
}

export default class ObjectType extends AnyType {
  protected rules: { [key: string]: AnyType | (AnyType | (() => AnyType))[] | (() => AnyType) };
  protected validatorConfig: ValidatorConfig;

  constructor(config: ObjectTypeConfig) {
    super(config);

    this.rules = config.rules;
    this.validatorConfig = config.validatorConfig || {};
    this.normalizeType = this.normalizeType.bind(this);
  }

  private getRules(): { [key: string]: AnyType } {
    const rules = {};

    for (const k in this.rules) {
      rules[k] = this.normalizeType(this.rules[k]);
    }

    return rules;
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

    throw new Error('ObjectType:normalizeType - Invalid type description.');
  }

  protected applyValue(setContext: SetContext) {
    // смотрим правила и записываем по полям
    const rules = this.getRules();
    const { value } = setContext.get();

    for (const k in value) {
      if (value.hasOwnProperty(k)) {
        const v = value[k];
        const rule = rules[k];

        if (rule) {
          const nextSetContext = setContext.push(k, v);
          rule.apply(nextSetContext);
        }
      }
    }
  }

  protected setValue(setContext: SetContext) {
    const { attribute } = setContext.get();
    const rule = this.getRules()[attribute];

    const nextSetContext = setContext.shift();

    if (nextSetContext) {
      rule.set(nextSetContext);
    } else {
      rule.apply(setContext);
    }
  }

  /**
   * Проверка типа для вложенного значения
   * @param valueContext ValueContext
   * @throws {Error}
   */
  protected setCheck(valueContext: ValueContext) {
    const { attribute } = valueContext;
    const rules = this.getRules();

    if (!rules[attribute]) {
      throw new Error(`ObjectType:typeCheckNested - unknown attribute "${attribute}"`);
    }
  }

  protected canSetValue(setContext: SetContext): boolean {
    const { attribute } = setContext.get();
    const rule = this.getRules()[attribute];

    const nextSetContext = setContext.shift();

    return nextSetContext
      ? rule.canSet(nextSetContext)
      : rule.canApply(setContext);
  }

  protected getTypeValue(setContext: SetContext): AnyType | null {
    const { attribute } = setContext.get();
    const rule = this.getRules()[attribute];

    const nextSetContext = setContext.shift();

    if (nextSetContext) {
      return rule.getType(nextSetContext);
    } else {
      return rule;
    }
  }

  /**
   * Проверка типа
   * @param valueContext ValueContext
   * @throws {Error}
   */
  protected typeCheck(valueContext: ValueContext) {
    const value = valueContext.value;

    if (value !== undefined && (value.constructor !== Object)) {
      throw new Error('ObjectType:typeCheck - the value must be an instance of object');
    }
  }

  getValidator(setContext: SetContext) {
    let validator = this.validator;

    if (validator) {
      validator = new MultipleValidator({
        validators: [
          new ObjectValidator({
            setContext,
            rules: this.getRules(),
            ...this.validatorConfig,
          }),
          validator,
        ],
      });
    } else {
      validator = new ObjectValidator({
        setContext,
        rules: this.getRules(),
        ...this.validatorConfig,
      });
    }

    return validator;
  }
}
