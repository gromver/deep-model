import AnyType, { AnyTypeConfig } from './AnyType';
import SetContext from '../SetContext';
import Validator from '../validators/Validator';
// import OneOfTypeValidator from '../validators/OneOfTypeValidator';
import TypeValidator from '../validators/TypeValidator';
import MultipleValidator from '../validators/MultipleValidator';

export interface ValidatorConfig {
  strict?: boolean;
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
    this.validatorConfig = config.validatorConfig;
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

  protected getTypeImpl(setContext: SetContext): AnyType | void {
    let foundedType;

    this.getTypes().some((type) => {
      try {
        foundedType = type.getType(setContext);
      } catch (e) {}

      return !!foundedType;
    });

    return foundedType || null;
  }

  getValidator(setContext: SetContext): Validator | void {
    const type = this.getTypes().find((type) => type.canApply(setContext));

    if (!type) {
      return;
    }

    let validator = this.validator;

    if (validator) {
      validator = new MultipleValidator({
        validators: [
          new TypeValidator({
            setContext,
            type,
            // ...this.validatorConfig,
          }),
          validator,
        ],
      });
    } else {
      validator = new TypeValidator({
        setContext,
        type,
        // ...this.validatorConfig,
      });
    }

    return validator;
  }
}
