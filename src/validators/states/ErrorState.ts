import State from './State';
import Message from '../utils/Message';

export default class ErrorState extends State {
  static STATUS = 'error';

  constructor(message: string | Message) {
    super(message);
  }

  getStatus() {
    return ErrorState.STATUS;
  }
}
