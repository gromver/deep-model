import Model from './Model';

export interface ValueContextInterface {
  model: Model;
  path: (string|number)[];
  attribute: string|number;
  curValue: any;
  newValue?: any;
}

export default class ValueContext implements ValueContextInterface {
  public model: Model;
  public path: (string|number)[];
  public attribute: string|number;
  public curValue: any;
  public newValue: any;

  constructor(config: ValueContextInterface) {
    this.model = config.model;
    this.path = config.path;
    this.curValue = config.curValue;
    this.newValue = config.newValue;
    this.attribute = config.attribute;
  }
}
