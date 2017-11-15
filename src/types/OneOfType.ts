import AnyType, { AnyTypeConfig } from './AnyType';
import SetContext from '../SetContext';
import ValueContext from '../ValueContext';
import SetValueEvent from '../events/SetValueEvent';
import InitValueEvent from '../events/InitValueEvent';

export interface OneOfTypeConfig extends AnyTypeConfig {
  rules: AnyType[];
}

export default class OneOfType extends AnyType {
  protected rules: AnyType[];

  constructor(config: OneOfTypeConfig) {
    super(config);

    this.rules = config.rules;
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
    return this.rules;
  }

  protected setValue(context: ValueContext) {
    // this.presetValue(context);
    // смотрим правила и записываем по полям

    // const { model } = context;
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
