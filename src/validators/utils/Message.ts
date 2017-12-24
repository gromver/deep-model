const toPairs = require('lodash/toPairs');

export default class Message extends String {
  static formatMessage(message: string, bindings: {}): string {
    toPairs(bindings).forEach(([k, v]) => {
      message = message.replace(new RegExp(`\\{${k}\\}`, 'g'), v as string);
    });

    return message;
  }

  public message: string;
  public bindings: {};

  constructor(message: string, bindings: {}) {
    super();

    this.message = message;
    this.bindings = bindings;
  }

  toString(): string {
    return Message.formatMessage(this.message, this.bindings);
  }
}
