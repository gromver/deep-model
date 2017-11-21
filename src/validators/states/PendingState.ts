import State from './State';

export default class PendingState extends State {
  static STATUS = undefined;

  getStatus() {
    return PendingState.STATUS;
  }
}
