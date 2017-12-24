import Model from './Model';

export interface ValueContextInterface {
  model: Model;
  path: (string|number)[];
  attribute: string|number;
  value: any;
}

export default class ValueContext implements ValueContextInterface {
  public model: Model;
  public path: (string|number)[];
  public attribute: string|number;
  public value: any;

  constructor(config: ValueContextInterface) {
    this.model = config.model;
    this.path = config.path;
    this.attribute = config.attribute;
    this.value = config.value;
  }
}
