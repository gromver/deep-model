declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import ObjectValidator from './ObjectValidator';
import PresenceValidator from './PresenceValidator';
import StringValidator from './StringValidator';

import Model from '../Model';
import SetContext from '../SetContext';
import ValueContext from '../ValueContext';
import * as t from '../types';

class TestModel extends Model {
  rules() {
    return {
      object: t.object({
        properties: {
          foo: t.string({
            validator: [new PresenceValidator(), new StringValidator()],
          }),
          bar: t.string(),
        },
      }),
      boolean: t.boolean(),
    };
  }
}

describe('validate', () => {
  it('Should reject with "object has invalid fields" error', async () => {
    const model = new TestModel();
    const validator = new ObjectValidator({
      setContext: new SetContext({
        model,
        path: [],
      }),
      properties: {
        object: t.object({
          properties: {
            foo: t.string({
              validator: [new PresenceValidator(), new StringValidator()],
            }),
            bar: t.string(),
          },
        }),
      },
    });

    await expect(validator.validate(new ValueContext({
      model,
      attribute: 'test',
      path: [],
      value: {
        object: { foo: '' },
      },
    }))).rejects.toMatchObject({
      bindings: { attribute: 'test' },
      message: '{attribute} - object has invalid fields',
    });
  });

  it('Should reject with "object has an invalid type" error', async () => {
    const model = new TestModel();
    const validator = new ObjectValidator({
      setContext: new SetContext({
        model,
        path: [],
      }),
      properties: {
        object: t.object({
          properties: {
            foo: t.string({
              validator: [new PresenceValidator(), new StringValidator()],
            }),
            bar: t.string(),
          },
        }),
      },
    });

    await expect(validator.validate(new ValueContext({
      model,
      attribute: 'test',
      path: [],
      value: 'not an object',
    }))).rejects.toMatchObject({
      bindings: { attribute: 'test' },
      message: '{attribute} - object has an invalid type',
    });
  });

  it('Should reject.', async () => {
    const model = new TestModel({
      object: { foo: '' },
    });


    await expect(model.validate()).rejects.toMatchObject({
      bindings: { attribute: undefined },
      message: '{attribute} - object has invalid fields',
    });
    expect(model.getErrors()).toHaveLength(3);
  });

  it('Should resolve.', async () => {
    const model = new TestModel({
      object: { foo: 'foo', bar: 'bar' },
    });

    await expect(model.validate()).resolves.toBe(undefined);
    expect(model.getErrors()).toHaveLength(0);
  });
});
