import Model from './Model';
import ValueContext from './ValueContext';

export interface SetContextConfig {
  model: Model;
  path: (string|number)[];
  value?: any;
  cursor?: number;
}

export default class SetContext {
  public model: Model;
  public path: (string|number)[];
  private value: any;
  private cursor: number;
  private valueContext: ValueContext;

  constructor(config: SetContextConfig) {
    this.model = config.model;
    this.path = config.path;
    this.value = config.hasOwnProperty('value') ? config.value : config.model.get(config.path);
    this.cursor = config.cursor !== undefined ? config.cursor : (this.path.length ? 0 : -1);
  }

  /**
   *
   * @returns ValueContext
   */
  get(): ValueContext {
    if (!this.valueContext) {
      if (this.cursor === this.path.length - 1) {
        this.valueContext = new ValueContext({
          attribute: this.path[this.cursor],
          model: this.model,
          path: this.path,
          value: this.value,
        });
      } else {
        const curPath = this.path.slice(0, this.cursor);

        this.valueContext = new ValueContext({
          attribute: this.path[this.cursor],
          model: this.model,
          path: curPath,
          value: this.model.get(curPath),
        });
      }
    }

    return this.valueContext;
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

  mutate(newValue: any) {
    this.get().value = newValue;
  }
}
