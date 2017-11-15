import AnyType, { AnyTypeConfig } from './AnyType';
import OneOfType from './OneOfType';
import SetContext from '../SetContext';
import ValueContext from '../ValueContext';
import SetValueEvent from '../events/SetValueEvent';
import InitValueEvent from '../events/InitValueEvent';

export interface ObjectTypeConfig extends AnyTypeConfig {
  rules: { [key: string]: AnyType };
}

export default class ObjectType extends AnyType {
  protected rules: { [key: string]: AnyType };

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

  private getRules() {

  }

  private normalizeRule(rule: AnyType | AnyType[] | (() => AnyType)): AnyType {
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

  protected setValue(valueContext: ValueContext) {
    // this.presetValue(context);
    // смотрим правила и записываем по полям
    const rules = this.getRules();
    const { curValue } = valueContext;

    for (let k in curValue) {
      const v = curValue[k];
      const rule = rules[k];

      if (rule) {

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
    // const { model, currentPath } = context;
    //
    // model.dispatch(new InitValueEvent(currentPath, {}));
  }

  /** Checks **/

  /**
   * Можно ли записать вложенное значение
   * @param {string | number} attribute
   * @throws Error
   */
  protected deepAttributeCheck(attribute: string|number) {

  }

  /**
   * Проверка типа
   * @param value
   * @throws {Error}
   */
  protected typeCheck(value: any) {}
}
