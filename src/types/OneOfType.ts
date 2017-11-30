import AnyType, { AnyTypeConfig } from './AnyType';
import SetContext from '../SetContext';
import Validator from '../validators/Validator';
import OneOfTypeValidator from '../validators/OneOfTypeValidator';
import MultipleValidator from '../validators/MultipleValidator';

export interface ValidatorConfig {
  errorMessageRule?: string;
}

export interface OneOfTypeConfig extends AnyTypeConfig {
  types: AnyType[];
  validatorConfig?: ValidatorConfig;
}

export default class OneOfType extends AnyType {
  protected types: AnyType[];
  protected validatorConfig?: ValidatorConfig;

  constructor(config: OneOfTypeConfig) {
    super(config);

    this.types = config.types;
  }

  private getTypes(): AnyType[] {
    return this.types;
  }

  set(setContext: SetContext) {
    let error;

    this.getTypes().some((type) => {
      error = false;

      try {
        type.set(setContext);
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
    return this.getTypes().some((type) => type.canSet(setContext));
  }

  apply(setContext: SetContext) {
    let error;

    this.getTypes().some((type) => {
      error = false;

      try {
        type.apply(setContext);
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
    return this.getTypes().some((type) => type.canApply(setContext));
  }

  protected getTypeValue(setContext: SetContext): AnyType | null {
    let foundedType;

    this.getTypes().some((type) => {
      try {
        foundedType = type.getType(setContext);
      } catch (e) {}

      return !!foundedType;
    });

    return foundedType || null;
  }

  getValidator(setContext: SetContext) {
    const type = this.getTypes().find((type) => type.canApply(setContext));
    let validator = this.validator;

    if (validator) {
      validator = new MultipleValidator({
        validators: [
          new OneOfTypeValidator({
            setContext,
            type,
            ...this.validatorConfig,
          }),
          validator,
        ],
      });
    } else {
      validator = new OneOfTypeValidator({
        setContext,
        type,
        ...this.validatorConfig,
      });
    }

    return validator;
  }
}
