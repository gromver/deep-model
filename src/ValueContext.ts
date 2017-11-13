import Model from './Model';
import ValueContextInterface from './ValueContextInterface';

export default class ValueContext implements ValueContextInterface {
  public model: Model;
  public path: (string|number)[];
  public attribute: string|number;
  public value: any;

  constructor(config: ValueContextInterface) {
    this.model = config.model;
    this.path = config.path;
    this.value = config.value;
    this.attribute = config.attribute;
  }
}
