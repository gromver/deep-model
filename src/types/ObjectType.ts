import AnyType, { AnyTypeConfig } from './AnyType';
import OneOfType from './OneOfType';
import SetContext from '../SetContext';
import ValueContext from '../ValueContext';
import SetValueEvent from '../events/SetValueEvent';
import InitValueEvent from '../events/InitValueEvent';

export interface ObjectTypeConfig extends AnyTypeConfig {
  rules: { [key: string]: AnyType | (AnyType | (() => AnyType))[] | (() => AnyType) };
}

export default class ObjectType extends AnyType {
  protected rules: { [key: string]: AnyType | (AnyType | (() => AnyType))[] | (() => AnyType) };

  constructor(config: ObjectTypeConfig) {
    super(config);

    this.rules = config.rules;
    this.normalizeRule = this.normalizeRule.bind(this);
  }

  // protected canSetValue(context: SetContext): boolean {
  //   if (context.value instanceof Object) {
  //     return true;
  //   }
  //
  //   console.warn('You try to set non object value to the ObjectType');
  //
  //   return false;
  // }

  private getRules(): { [key: string]: AnyType } {
    const rules = {};

    for (const k in this.rules) {
      rules[k] = this.normalizeRule(this.rules[k]);
    }

    return rules;
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

    throw new Error('ObjectType:normalizeRule - Invalid rule description.');
  }

  protected setValue(setContext: SetContext) {
    // смотрим правила и записываем по полям
    const rules = this.getRules();
    const { newValue } = setContext.get();

    for (const k in newValue) {
      const v = newValue[k];
      const rule = rules[k];

      if (rule) {
        const nestedContext = setContext.push(k, v);
        rule.set(nestedContext);
      }
    }

    // const [attribute] = path;
    //
    // if (path.length && typeof attribute !== 'string') {
    //   // init default value
    //   model.dispatch(new InitValueEvent(this.path, {}));
    // } else {
    //   // check rules and try to set value
    //   model.dispatch(new SetValueEvent(this.path, context.value));
    // }
  }

  // protected canSetNestedValue(nestedAttribute: string|number): boolean {
  //   if (typeof nestedAttribute === 'string') {
  //     return true;
  //   }
  //
  //   console.warn('Nested object\'s values must have string typed keys');
  //
  //   return false;
  // }

  protected setValueNested(setContext: SetContext) {
    // смотрим правила и делаем сет
    const { attribute } = setContext.get();
    const rules = this.getRules();

    rules[attribute].set(setContext);
  }

  /** Checks **/

  /**
   * Проверка типа
   * @param valueContext ValueContext
   * @throws {Error}
   */
  protected typeCheck(valueContext: ValueContext) {
    const value = valueContext.newValue;

    if (value !== undefined && (value.constructor !== Object)) {
      throw new Error('ObjectType:typeCheck - the value must be an instance of object');
    }
  }

  /**
   * Проверка типа для вложенного значения
   * @param valueContext ValueContext
   * @throws {Error}
   */
  protected typeCheckNested(valueContext: ValueContext) {
    const { attribute } = valueContext;
    const rules = this.getRules();

    if (!this.rules[attribute]) {
      throw new Error(`ObjectType:typeCheckNested - unknown attribute "${attribute}"`);
    }
  }
}
