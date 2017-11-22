import State from '../validators/states/State';

export default class ValidationStateEvent {
  type: string = 'validationState';
  path: (string|number)[];
  state: State;

  constructor(path: (string|number)[], state: State) {
    this.path = path;
    this.state = state;
  }
}
