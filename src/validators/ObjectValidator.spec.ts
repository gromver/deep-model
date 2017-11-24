declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import MultipleValidator from './MultipleValidator';
import PresenceValidator from './PresenceValidator';
import ObjectValidator from './ObjectValidator';

import Model from '../Model';
import * as t from '../types';

class TestModel extends Model {
  getRules() {
    return {
      object: t.object({
        rules: {
          foo: t.string({
            validator: new PresenceValidator(),
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
      boolean: 'wrong',
    });

    await model.validate().catch((err) => console.log('ERR', err));
  });
});
