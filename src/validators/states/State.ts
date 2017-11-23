import Message from '../utils/Message';

let version: number = 1;

/**
 * Base validation state class
 */
export default class State extends String {
  static STATUS: string | undefined = undefined;

  private version: number;

  public message?: string | Message;
  public path: (string | number)[];

  constructor(message?: string | Message) {
    super();

    version += 1;
    this.version = version;
    this.message = message;
  }

  setPath(path: (string | number)[]) {
    this.path = path;
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
