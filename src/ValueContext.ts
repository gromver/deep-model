import Model from './Model';

export default class Context {
  public model: Model;
  public targetPath: (string|number)[];
  public currentPath: (string|number)[];
  public value: any;

  constructor(model: Model, targetPath: (string|number)[], value: any) {
    this.model = model;
    this.targetPath = targetPath;
    this.currentPath = [];
    this.value = value;
  }
}
