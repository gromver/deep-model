declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import CompareValidator from './CompareValidator';
import Message from './utils/Message';

import Model from '../Model';
import * as t from '../types';

class TestModel extends Model {
  rules() {
    return {
      object: t.object({
        rules: {
          a: t.string(),
          b: t.string({
            validator: new CompareValidator({
              compareAttribute: ['object', 'a'],
            }),
          }),
        },
      }),
      a: t.string(),
      b: t.string({
        validator: new CompareValidator({
          compareAttribute: 'a',
        }),
      }),
      c: t.number({
        validator: new CompareValidator({
          compareValue: 5,
          errorMessage: 'custom error',
        }),
      }),
    };
  }
}

const model = new TestModel();

describe('CompareValidator', () => {
  it('Constructor should throw an error', async () => {
    expect(() => new CompareValidator({})).toThrow(
      'either compareAttribute or compareValue prop must be set.',
    );
  });

  it('Should resolve', async () => {
    const model = new TestModel({
      object: {
        a: 'foo',
        b: 'foo',
      },
      a: 'bar',
      b: 'bar',
      c: 5,
    });

    await expect(model.validate()).resolves.toBe(undefined);
  });

  it('Should reject', async () => {
    const model = new TestModel({
      object: {
        a: 'foo',
        b: 'bar',
      },
      a: 'bar',
      b: 'bar',
      c: 5,
    });

    await expect(model.validate()).rejects.toBeInstanceOf(Message);

    expect(model.getFirstError()).toMatchObject({
      path: ['object', 'b'],
      message: {
        message: '{attribute} - must equals "{value}" value',
      },
    });
  });

  it('Should reject 2', async () => {
    const model = new TestModel({
      object: {
        a: 'foo',
        b: 'foo',
      },
      a: 'bar',
      b: 'foo',
      c: 5,
    });

    await expect(model.validate()).rejects.toBeInstanceOf(Message);

    expect(model.getFirstError()).toMatchObject({
      path: ['b'],
      message: {
        message: '{attribute} - must equals "{value}" value',
      },
    });
  });

  it('Should reject 3 and get custom error', async () => {
    const model = new TestModel({
      object: {
        a: 'foo',
        b: 'foo',
      },
      a: 'bar',
      b: 'bar',
      c: 6,
    });

    await expect(model.validate()).rejects.toBeInstanceOf(Message);

    expect(model.getFirstError()).toMatchObject({
      path: ['c'],
      message: {
        message: 'custom error',
      },
    });
  });
});
