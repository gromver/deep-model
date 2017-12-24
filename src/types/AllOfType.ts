import AnyType, { AnyTypeConfig } from './AnyType';
import SetContext from '../SetContext';
import Validator from '../validators/Validator';
import TypeValidator from '../validators/TypeValidator';
import MultipleValidator from '../validators/MultipleValidator';

export interface AllOfTypeConfig extends AnyTypeConfig {
  types: AnyType[];
}

export default class AllOfType extends AnyType {
  private types: AnyType[];

  constructor(config: AllOfTypeConfig) {
    super(config);

    this.types = config.types;
  }

  /**
   * @param {SetContext} setContext
   * @throws {Error}
   */
  setCheck(setContext: SetContext) {
    if (this.types.some((type) => !type.canSet(setContext))) {
      throw new Error('AllOfType::setCheck - there are exists at least one not suitable type.');
    }
  }

  protected setImpl(setContext: SetContext) {
    // из всех типов, ко всем должна быть применима set() операция
    this.types.map((type) => {
      type.set(setContext);
    });
  }

  /**
   * @param {SetContext} setContext
   * @throws {Error}
   */
  applyCheck(setContext: SetContext) {
    if (this.types.some((type) => !type.canApply(setContext))) {
      throw new Error('AllOfType::applyCheck - there are exists at least one not suitable type.');
    }
  }

  protected applyImpl(setContext: SetContext) {
    // из всех типов, ко всем должна быть применима apply() операция
    this.types.map((type) => {
      type.apply(setContext);
    });
  }

  protected getTypeImpl(setContext: SetContext): AnyType | void {
    const types: AnyType[] = [];

    this.types.map((type) => {
      const t = type.getType(setContext);

      if (t) {
        types.push(t);
      }
    });

    if (types.length) {
      return new AllOfType({ types });
    }
  }

  getValidator(setContext: SetContext): Validator | void {
    if (!this.canApply(setContext)) {
      return;
    }

    const validators = this.types
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
