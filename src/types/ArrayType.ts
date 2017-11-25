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
  rules: AnyType | (AnyType | (() => AnyType))[] | (() => AnyType);
  validatorConfig?: ValidatorConfig;
}

export default class ArrayType extends AnyType {
  protected rules: AnyType | (AnyType | (() => AnyType))[] | (() => AnyType);
  protected validatorConfig: ValidatorConfig;

  constructor(config: ArrayTypeConfig) {
    super(config);

    this.rules = config.rules;
    this.validatorConfig = config.validatorConfig || {};
    this.normalizeRule = this.normalizeRule.bind(this);
  }

  private getRule(): AnyType {
    return this.normalizeRule(this.rules);
  }

  private normalizeRule(rule: AnyType | (AnyType | (() => AnyType))[] | (() => AnyType)): AnyType {
    if (typeof rule === 'function') {
      return this.normalizeRule(rule());
    } else if (Array.isArray(rule)) {
      const rules = [...rule].map(this.normalizeRule);

      return new OneOfType({ rules });
    } else if (rule instanceof AnyType) {
      return rule;
    }

    throw new Error('ArrayType:normalizeRule - Invalid rule description.');
  }

  protected applyValue(setContext: SetContext) {
    const rule = this.getRule();
    const { value } = setContext.get();

    for (const k in value) {
      if (value.hasOwnProperty(k)) {
        const v = value[k];

        const nextSetContext = setContext.push(k, v);
        rule.apply(nextSetContext);
      }
    }
  }

  protected setValue(setContext: SetContext) {
    const rule = this.getRule();

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

    if (typeof attribute !== 'number') {
      throw new Error('ArrayType:setCheck - nested attribute key must be a number');
    }
  }

  protected canSetValue(setContext: SetContext): boolean {
    const rule = this.getRule();

    const nextSetContext = setContext.shift();

    return nextSetContext
      ? rule.canSet(nextSetContext)
      : rule.canApply(setContext);
  }

  protected getTypeValue(setContext: SetContext): AnyType | null {
    const rule = this.getRule();

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
            rule: this.getRule(),
            ...this.validatorConfig,
          }),
          validator,
        ],
      });
    } else {
      validator = new ArrayValidator({
        setContext,
        rule: this.getRule(),
        ...this.validatorConfig,
      });
    }

    return validator;
  }
}
