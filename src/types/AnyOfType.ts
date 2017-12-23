import AnyType, { AnyTypeConfig } from './AnyType';
import SetContext from '../SetContext';
import Validator from '../validators/Validator';
import TypeValidator from '../validators/TypeValidator';
import MultipleValidator from '../validators/MultipleValidator';

export interface AnyOfTypeConfig extends AnyTypeConfig {
  types: AnyType[];
}

export default class AnyOfType extends AnyType {
  private types: AnyType[];

  constructor(config: AnyOfTypeConfig) {
    super(config);

    this.types = config.types;
  }

  /**
   * @param {SetContext} setContext
   * @throws {Error}
   */
  setCheck(setContext: SetContext) {
    if (!this.types.some((type) => type.canSet(setContext))) {
      throw new Error('AnyOfType::setCheck - there is no suitable types detected.');
    }
  }

  protected setImpl(setContext: SetContext) {
    // из всех типов, хотя бы к одному должна быть применима set() операция
    this.types.map((type) => {
      try {
        type.set(setContext);
      } catch (e) {}
    });
  }

  /**
   * @param {SetContext} setContext
   * @throws {Error}
   */
  applyCheck(setContext: SetContext) {
    if (!this.types.some((type) => type.canApply(setContext))) {
      throw new Error('AnyOfType::applyCheck - there is no suitable types detected.');
    }
  }

  protected applyImpl(setContext: SetContext) {
    // из всех типов, хотя бы к одному должна быть применима apply() операция
    this.types.map((type) => {
      try {
        type.apply(setContext);
      } catch (e) {}
    });
  }

  protected getTypeImpl(setContext: SetContext): AnyType | void {
    const types: AnyType[] = [];

    this.types.map((type) => {
      try {
        const t = type.getType(setContext);

        if (t) {
          types.push(t);
        }
      } catch (e) {}
    });

    if (types.length) {
      return new AnyOfType({ types });
    }
  }

  getValidator(setContext: SetContext): Validator | void {
    const types = this.types.filter((type) => type.canApply(setContext));

    if (!types.length) {
      return;
    }

    const validators = types
      .map((type) => type.getValidator(setContext))
      .filter((v) => v) as Validator[];

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
