import Message from '../utils/Message';

let version: number = 1;

/**
 * Base validation state class
 */
export default class State extends String {
  static STATUS: string | undefined = undefined;

  private version: number;

  public message?: string | Message;

  constructor(message?: string | Message) {
    super();

    this.version = version++;
    this.message = message;
  }

  getVersion(): number {
    return this.version;
  }

  getStatus(): string | undefined {
    return State.STATUS;
  }

  toString(): string {
    return this.message ? this.message.toString() : '';
  }
}
