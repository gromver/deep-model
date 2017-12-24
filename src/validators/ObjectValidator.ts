import AnyType from '../types/AnyType';
import Validator from './Validator';
import Message from './utils/Message';
import ValueContext from '../ValueContext';
import SetContext from '../SetContext';
import utils from './utils/utils';

export interface ObjectValidatorConfig {
  errorMessageType?: string;
  errorMessageFields?: string;
  warningMessage?: string;
  properties: { [key: string]: AnyType };
  setContext: SetContext;
}

export default class ObjectValidator extends Validator {
  static ERROR_MESSAGE_TYPE = '{attribute} - object has an invalid type';
  static ERROR_MESSAGE_FIELDS = '{attribute} - object has invalid fields';

  static WARNING_MESSAGE = '{attribute} - object has some fields with warnings';

  private errorMessageType?: string;
  private errorMessageFields?: string;
  private warningMessage?: string;
  private properties: { [key: string]: AnyType };
  private setContext: SetContext;

  constructor(config: ObjectValidatorConfig) {
    super();

    this.errorMessageType = config.errorMessageType;
    this.errorMessageFields = config.errorMessageFields;
    this.warningMessage = config.warningMessage;
    this.properties = config.properties;
    this.setContext = config.setContext;
  }

  validate(valueContext: ValueContext): Promise<void | string | Message> {
    const { value } = valueContext;

    // Undefined values are fine
    if (value === undefined) {
      return Promise.resolve();
    }

    if (value.constructor !== Object) {
      return Promise.reject(
        utils.createMessage(this.errorMessageType || ObjectValidator.ERROR_MESSAGE_TYPE, {
          attribute: valueContext.attribute,
        }),
      );
    }

    const { properties, setContext } = this;

    return new Promise((resolve, reject) => {
      const jobs: Promise<string | Message | void>[] = [];

      for (const k in properties) {
        const v = value[k];
        const type = properties[k];

        if (type) {
          const nextSetContext = setContext.push(k, v);
          jobs.push(type.validate(nextSetContext));
        }
      }

      Promise.all(jobs).then((warnings) => {
        const warning = warnings.find((i) => !!i);

        if (warning) {
          resolve(
            utils.createMessage(this.warningMessage || ObjectValidator.WARNING_MESSAGE, {
              attribute: valueContext.attribute,
            }),
          );
        } else {
          resolve();
        }
      }).catch(() => {
        reject(
          utils.createMessage(this.errorMessageFields || ObjectValidator.ERROR_MESSAGE_FIELDS, {
            attribute: valueContext.attribute,
          }),
        );
      });
    });
  }
}

