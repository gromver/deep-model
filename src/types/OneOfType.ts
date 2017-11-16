import AnyType, { AnyTypeConfig } from './AnyType';
import SetContext from '../SetContext';

export interface OneOfTypeConfig extends AnyTypeConfig {
  rules: AnyType[];
}

export default class OneOfType extends AnyType {
  protected rules: AnyType[];

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
}
