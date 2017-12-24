export default class SetValueEvent {
  type: string = 'setValue';
  path: (string|number)[];
  value: any;

  constructor(path: (string|number)[], value: any) {
    this.path = path;
    this.value = value;
  }
}
