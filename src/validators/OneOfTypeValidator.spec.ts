declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import Validator from './Validator';
import OneOfTypeValidator from './OneOfTypeValidator';
import PresenceValidator from './PresenceValidator';
import StringValidator from './StringValidator';

import Model from '../Model';
import SetContext from '../SetContext';
import ValueContext from '../ValueContext';
import * as t from '../types';

function getTestModel(attributes?) {
  return Model.object(
    {
      oneOfType: [
        t.string({
          validator: [new PresenceValidator(), new StringValidator()],
        }),
        t.number(),
      ],
    },
    attributes,
  );
}

class ValidatorWithWarning extends Validator {
  validate(valueContext: ValueContext) {
    return Promise.resolve('warning message');
  }
}

describe('validate', () => {
  it('Should reject with "the type for a given value is undefined" error', async () => {
    const model = getTestModel();
    const validator = new OneOfTypeValidator({
      setContext: new SetContext({
        model,
        path: [],
      }),
    });

    await expect(validator.validate(new ValueContext({
      model,
      attribute: 'test',
      path: [],
      value: 'foo',
    }))).rejects.toMatchObject({
      bindings: { attribute: 'test' },
      message: '{attribute} - the type for a given value is undefined',
    });
  });

  it('Should reject with "custom error" error', async () => {
    const model = getTestModel();
    const validator = new OneOfTypeValidator({
      setContext: new SetContext({
        model,
        path: [],
      }),
      errorMessageRule: 'custom error',
    });

    await expect(validator.validate(new ValueContext({
      model,
      attribute: 'test',
      path: [],
      value: 'foo',
    }))).rejects.toMatchObject({
      bindings: { attribute: 'test' },
      message: 'custom error',
    });
  });

  it('Model should reject because of the type is undefined', async () => {
    const model = getTestModel({
      oneOfType: false,
    });

    await expect(model.validate()).rejects.toMatchObject({
      bindings: { attribute: undefined },
      message: '{attribute} - object has invalid fields',
    });
    expect(model.getErrors()).toHaveLength(2);
  });

  it('Model should resolves', async () => {
    const model = getTestModel({
      oneOfType: 'string',
    });

    await expect(model.validate()).resolves.toBe(undefined);
    expect(model.getErrors()).toHaveLength(0);

    model.set('oneOfType', 1);
    await expect(model.validate()).resolves.toBe(undefined);
    expect(model.getErrors()).toHaveLength(0);
  });
});
