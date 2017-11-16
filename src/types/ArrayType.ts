import AnyType, { AnyTypeConfig } from './AnyType';
import OneOfType from './OneOfType';
import SetContext from '../SetContext';
import ValueContext from '../ValueContext';

export interface ArrayTypeConfig extends AnyTypeConfig {
  rules: AnyType | (AnyType | (() => AnyType))[] | (() => AnyType);
}

export default class ArrayType extends AnyType {
  protected rules: AnyType | (AnyType | (() => AnyType))[] | (() => AnyType);

  constructor(config: ArrayTypeConfig) {
    super(config);

    this.rules = config.rules;
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

  protected setValue(setContext: SetContext) {
    const rule = this.getRule();
    const { newValue } = setContext.get();

    for (const k in newValue) {
      const v = newValue[k];

      const nestedContext = setContext.push(k, v);
      rule.set(nestedContext);
    }
  }

  protected setValueNested(setContext: SetContext) {
    const { attribute } = setContext.get();
    const rule = this.getRule();

    rule.set(setContext);
  }

  /** Checks **/

  /**
   * Проверка типа
   * @param valueContext ValueContext
   * @throws {Error}
   */
  protected typeCheck(valueContext: ValueContext) {
    const value = valueContext.newValue;

    if (value !== undefined && !Array.isArray(value)) {
      throw new Error('ObjectType:typeCheck - the value must be an array');
    }
  }

  /**
   * Проверка типа для вложенного значения
   * @param valueContext ValueContext
   * @throws {Error}
   */
  protected typeCheckNested(valueContext: ValueContext) {
    const { attribute } = valueContext;

    if (typeof attribute !== 'number') {
      throw new Error(`ArrayType:typeCheckNested - nested attribute must be a number`);
    }
  }
}
