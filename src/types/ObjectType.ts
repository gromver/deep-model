import AnyType from './AnyType';
import ModelContext from '../ModelContext';
import ValueContext from '../ValueContext';
import TypeConfigObject from '../interfaces/TypeConfigObject';
import SetValueEvent from '../events/SetValueEvent';
import InitValueEvent from '../events/InitValueEvent';

export default class ObjectType extends AnyType {
  protected rules: { [key: string]: AnyType };

  constructor(config: TypeConfigObject) {
    super(config);

    this.rules = config.rules;
  }

  // protected canSetValue(context: ModelContext): boolean {
  //   if (context.value instanceof Object) {
  //     return true;
  //   }
  //
  //   console.warn('You try to set non object value to the ObjectType');
  //
  //   return false;
  // }

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

  protected setDeepValue(modelContext: ModelContext) {
    // смотрим правила и делаем сет
    // const { model, currentPath } = context;
    //
    // model.dispatch(new InitValueEvent(currentPath, {}));
  }

  // protected presetValue(context: ModelContext) {
  //   const { model, currentPath } = context;
  //
  //   model.dispatch(new InitValueEvent(currentPath, {}));
  // }
}
