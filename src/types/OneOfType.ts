import AnyType, { AnyTypeConfig } from './AnyType';
import SetContext from '../SetContext';
import Validator from '../validators/Validator';
import OneOfTypeValidator from '../validators/OneOfTypeValidator';
import MultipleValidator from '../validators/MultipleValidator';

export interface ValidatorConfig {
  errorMessageRule?: string;
}

export interface OneOfTypeConfig extends AnyTypeConfig {
  rules: AnyType[];
  validatorConfig?: ValidatorConfig;
}

export default class OneOfType extends AnyType {
  protected rules: AnyType[];
  validatorConfig?: ValidatorConfig;

  constructor(config: OneOfTypeConfig) {
    super(config);

    this.rules = config.rules;
  }

  private getRules(): AnyType[] {
    return this.rules;
  }

  set(setContext: SetContext) {
    let error;

    this.getRules().some((rule) => {
      error = false;

      try {
        rule.set(setContext);
      } catch (e) {
        error = e;
      }

      return error === false;
    });

    if (error) {
      throw error;
    }
  }

  canSet(setContext: SetContext): boolean {
    return this.getRules().some((rule) => rule.canSet(setContext));
  }

  apply(setContext: SetContext) {
    let error;

    this.getRules().some((rule) => {
      error = false;

      try {
        rule.apply(setContext);
      } catch (e) {
        error = e;
      }

      return error === false;
    });

    if (error) {
      throw error;
    }
  }

  canApply(setContext: SetContext): boolean {
    return this.getRules().some((rule) => rule.canApply(setContext));
  }

  protected getTypeValue(setContext: SetContext): AnyType | null {
    let type;

    this.getRules().some((rule) => {
      try {
        type = rule.getType(setContext);
      } catch (e) {}

      return !!type;
    });

    return type || null;
  }

  getValidator(setContext: SetContext) {
    const rule = this.getRules().find((rule) => rule.canApply(setContext));
    let validator = this.validator;

    if (validator) {
      validator = new MultipleValidator({
        validators: [
          new OneOfTypeValidator({
            setContext,
            rule,
            ...this.validatorConfig,
          }),
          validator,
        ],
      });
    } else {
      validator = new OneOfTypeValidator({
        setContext,
        rule,
        ...this.validatorConfig,
      });
    }

    return validator;
  }
}
