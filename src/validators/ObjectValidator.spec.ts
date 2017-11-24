declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import PresenceValidator from './PresenceValidator';
import StringValidator from './StringValidator';

import Model from '../Model';
import * as t from '../types';

class TestModel extends Model {
  getRules() {
    return {
      object: t.object({
        rules: {
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
