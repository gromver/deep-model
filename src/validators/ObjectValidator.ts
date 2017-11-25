import AnyType from '../types/AnyType';
import Validator from './Validator';
import Message from './utils/Message';
import ValueContext from '../ValueContext';
import SetContext from '../SetContext';
import utils from './utils/utils';

export interface ObjectValidatorConfig {
  errorMessage?: string;
  warningMessage?: string;
  rules: { [key: string]: AnyType };
  setContext: SetContext;
}

export default class ObjectValidator extends Validator {
  static ERROR_MESSAGE = '{attribute} - object has invalid fields';
  static WARNING_MESSAGE = '{attribute} - object has some fields with warnings';

  private errorMessage?: string;
  private warningMessage?: string;
  private rules: { [key: string]: AnyType };
  private setContext: SetContext;

  constructor(config: ObjectValidatorConfig) {
    super();

    this.errorMessage = config.errorMessage;
    this.warningMessage = config.warningMessage;
    this.rules = config.rules;
    this.setContext = config.setContext;
  }

  validate(valueContext: ValueContext): Promise<void | string | Message> {
    const { value } = valueContext;

    // Undefined values are fine
    if (value === undefined) {
      return Promise.resolve();
    }

    const { rules, setContext } = this;

    return new Promise((resolve, reject) => {
      const jobs: Promise<string | Message | void>[] = [];

      for (const k in value) {
        if (value.hasOwnProperty(k)) {
          const v = value[k];
          const rule = rules[k];

          if (rule) {
            const nextSetContext = setContext.push(k, v);
            jobs.push(rule.validate(nextSetContext));
          }
        }
      }

      Promise.all(jobs).then((warnings) => {
        const warning = warnings.find((i) => !!i);

        if (warning) {
          resolve(utils.createMessage(this.warningMessage || ObjectValidator.WARNING_MESSAGE, {
            attribute: valueContext.attribute,
          }));
        } else {
          resolve();
        }
      }).catch(() => {
        reject(utils.createMessage(this.errorMessage || ObjectValidator.ERROR_MESSAGE, {
          attribute: valueContext.attribute,
        }));
      });
    });
  }
}

