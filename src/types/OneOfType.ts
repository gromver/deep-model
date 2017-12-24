import AnyType, { AnyTypeConfig } from './AnyType';
import SetContext from '../SetContext';
import Validator from '../validators/Validator';
import MultipleValidator from '../validators/MultipleValidator';

export interface OneOfTypeConfig extends AnyTypeConfig {
  types: AnyType[];
}

export default class OneOfType extends AnyType {
  private types: AnyType[];

  constructor(config: OneOfTypeConfig) {
    super(config);

    this.types = config.types;
  }

  /**
   * @param {SetContext} setContext
   * @throws {Error}
   */
  setCheck(setContext: SetContext) {
    if (!this.types.some((type) => type.canSet(setContext))) {
      throw new Error('OneOfType::setCheck - there is no one suitable type detected.');
    }
  }

  protected setImpl(setContext: SetContext) {
    // из всех типов, к первому подходящему должна быть применима set() операция
    this.types.map((type) => {
      try {
        type.set(setContext);

        return true;
      } catch (e) {
        return false;
      }
    });
  }

  /**
   * @param {SetContext} setContext
   * @throws {Error}
   */

  applyCheck(setContext: SetContext) {
    if (!this.types.some((type) => type.canApply(setContext))) {
      throw new Error('AnyOfType::applyCheck - there is no one suitable type detected.');
    }
  }

  protected applyImpl(setContext: SetContext) {
    // из всех типов, к первому подходящему должна быть применима apply() операция
    this.types.some((type) => {
      try {
        type.apply(setContext);

        return true;
      } catch (e) {
        return false;
      }
    });
  }

  protected getTypeImpl(setContext: SetContext): AnyType | void {
    let foundedType;

    this.types.some((type) => {
      try {
        foundedType = type.getType(setContext);
      } catch (e) {}

      return !!foundedType;
    });

    return foundedType;
  }

  getValidator(setContext: SetContext): Validator | void {
    const type = this.types.find((type) => type.canApply(setContext));

    const validators: Validator[] = [];

    const typeValidator = type && type.getValidator(setContext);

    if (typeValidator) {
      validators.push(typeValidator);
    }

    if (this.validator) {
      validators.push(this.validator);
    }

    if (validators.length) {
      return new MultipleValidator({
        validators,
      });
    }
  }
}
