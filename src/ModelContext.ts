import Model from './Model';
import ValueContext from './ValueContext';

export default class ModelContext {
  public model: Model;
  public path: (string|number)[];
  private cursor: number;

  constructor(model: Model, path: (string|number)[], cursor: number = 0) {
    this.model = model;
    this.path = path;
    this.cursor = cursor;
  }

  // [Symbol.iterator] = function* () {
  //   while (this.cursor < this.path.length) {
  //     yield this.cursor += 1;
  //   }
  // };

  clone() {
    return new ModelContext(
      this.model,
      this.path,
      this.cursor,
    );
  }

  /**
   *
   * @returns [ValueContext, ValueContext|null]
   */
  get(): [ValueContext, ValueContext|null] {
    if (this.cursor < this.path.length) {
      const curPath = this.path.slice(0, this.cursor);
      const nextPath = this.path.slice(0, this.cursor + 1);

      return [
        new ValueContext({
          attribute: curPath[curPath.length - 1],
          model: this.model,
          path: curPath,
          value: this.model.get(curPath),
        }),
        new ValueContext({
          attribute: nextPath[nextPath.length - 1],
          model: this.model,
          path: nextPath,
          value: this.model.get(nextPath),
        }),
      ];
    } else {
      return [
        new ValueContext({
          attribute: this.path[this.path.length - 1],
          model: this.model,
          path: this.path,
          value: this.model.get(this.path),
        }),
        null,
      ];
    }
  }

  shift() {
    this.cursor += 1;
  }
}
