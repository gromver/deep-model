export default class InitValueEvent {
  type: string = 'presetValue';
  path: (string|number)[];
  value: any;

  constructor(path: (string|number)[], value: any) {
    this.path = path;
    this.value = value;
  }
}
