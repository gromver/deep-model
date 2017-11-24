import Validator from './interfaces/ValidateInterface';
import Message from './utils/Message';
import ValueContext from '../ValueContext';

export const reverse = (promise: Promise<any>) => {
  return new Promise((resolve, reject) => Promise.resolve(promise).then(reject, resolve));
};

export const promiseAny = (promises: Promise<any>[]): Promise<any> => {
  return reverse(Promise.all([...promises].map(reverse)));
};

export interface MultipleValidatorConfig {
  validators: Validator[];
  isAny?: boolean;
}

export default class MultipleValidator implements Validator {
  public validators: Validator[];
  public isAny: boolean;

  constructor(config: MultipleValidatorConfig) {
    this.validators = config.validators;
    this.isAny = config.isAny || false;
  }

  validate(valueContext: ValueContext): Promise<string | Message | void> {
    if (!this.validators.length) return Promise.resolve();

    const jobs = this.validators.map((validator) => validator.validate(valueContext));

    return this.isAny
      ? promiseAny(jobs).then((messages) => messages.find((i) => !!i))
      : Promise.all(jobs).then((messages) => messages.find((i) => !!i));
  }
}
