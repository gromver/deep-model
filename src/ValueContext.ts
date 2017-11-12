import Model from './Model';

export default class Context {
  public model: Model;
  public path: [string|number] | never[];
  public value: any;

  constructor(model: Model, path: [string|number] | never[], value: any) {
    this.model = model;
    this.path = path;
    this.value = value;
  }
}
