import Model from './Model';
import ValueContext from './ValueContext';

export interface SetContextConfig {
  model: Model;
  path: (string|number)[];
  value: any;
  cursor?: number;
}

export default class SetContext {
  public model: Model;
  public path: (string|number)[];
  private value: any;
  private cursor: number;

  constructor(config: SetContextConfig) {
    this.model = config.model;
    this.path = config.path;
    this.value = config.value;
    this.cursor = config.cursor !== undefined ? config.cursor : (this.path.length ? 0 : -1);
  }

  // [Symbol.iterator] = function* () {
  //   while (this.cursor < this.path.length) {
  //     yield this.cursor += 1;
  //   }
  // };

  // clone() {
  //   return new SetContext(
  //     this.model,
  //     this.path,
  //     this.cursor,
  //   );
  // }

  /**
   *
   * @returns ValueContext
   */
  get(): ValueContext {
    if (this.cursor === this.path.length - 1) {
      return new ValueContext({
        attribute: this.path[this.cursor],
        model: this.model,
        path: this.path,
        value: this.value,
      });
    } else {
      const curPath = this.path.slice(0, this.cursor);

      return new ValueContext({
        attribute: this.path[this.cursor],
        model: this.model,
        path: curPath,
        value: this.model.get(curPath),
      });

      // const curPath = this.path.slice(0, this.cursor);
      // const nextPath = this.path.slice(0, this.cursor + 1);
      //
      // return [
      //   new ValueContext({
      //     attribute: curPath[curPath.length - 1],
      //     model: this.model,
      //     path: curPath,
      //     value: this.model.get(curPath),
      //   }),
      //   new ValueContext({
      //     attribute: nextPath[nextPath.length - 1],
      //     model: this.model,
      //     path: nextPath,
      //     value: this.model.get(nextPath),
      //   }),
      // ];
    // } else {
    //   const curPath = this.path.slice(0, this.cursor);
    //
    //   return new ValueContext({
    //     attribute: this.path[this.cursor],
    //     model: this.model,
    //     path: curPath,
    //     value: this.model.get(curPath),
    //   });
    //   // return [
    //   //   new ValueContext({
    //   //     attribute: this.path[this.path.length - 1],
    //   //     model: this.model,
    //   //     path: this.path,
    //   //     value: this.model.get(this.path),
    //   //   }),
    //   //   null,
    //   // ];
    }
    // const curPath = this.path.slice(0, this.cursor);
    //
    // return new ValueContext({
    //   attribute: this.path[this.cursor],
    //   model: this.model,
    //   path: curPath,
    //   value: this.model.get(curPath),
    // });
  }

  shift(): SetContext|false {
    if (this.cursor < this.path.length - 1) {
      return new SetContext({
        model: this.model,
        path: this.path,
        value: this.value,
        cursor: this.cursor + 1,
      });
    }

    return false;
  }

  push(attribute: string|number, value: any): SetContext {
    return new SetContext({
      value,
      model: this.model,
      path: [...this.path, attribute],
      cursor: this.cursor + 1,
    });
  }
}
