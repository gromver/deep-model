declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import Validator from './Validator';
import ArrayValidator from './ArrayValidator';
import PresenceValidator from './PresenceValidator';
import StringValidator from './StringValidator';

import Model from '../Model';
import SetContext from '../SetContext';
import ValueContext from '../ValueContext';
import * as t from '../types';

class TestModel extends Model {
  getRules() {
    return {
      array: t.array({
        rules: [
          t.string({
            validator: [new PresenceValidator(), new StringValidator()],
          }),
          t.number(),
        ],
      }),
    };
  }
}

class ValidatorWithWarning extends Validator {
  validate(valueContext: ValueContext) {
    return Promise.resolve('warning message');
  }
}

describe('validate', () => {
  it('Should reject with "array has invalid fields" error', async () => {
    const model = new TestModel();
    const validator = new ArrayValidator({
      setContext: new SetContext({
        model,
        path: [],
      }),
      rule: t.string({
        validator: new PresenceValidator(),
      }),
    });

    await expect(validator.validate(new ValueContext({
      model,
      attribute: 'test',
      path: [],
      value: [1, 2, ''],
    }))).rejects.toMatchObject({
      bindings: { attribute: 'test' },
      message: '{attribute} - array has invalid fields',
    });
  });

  it('Should reject with "array has invalid fields" because of unsupported type', async () => {
    const model = new TestModel();
    const validator = new ArrayValidator({
      setContext: new SetContext({
        model,
        path: [],
      }),
      rule: t.oneOf({
        rules: [
          t.string({
            validator: [new PresenceValidator(), new StringValidator()],
          }),
          t.number(),
        ],
      }),
    });

    await expect(validator.validate(new ValueContext({
      model,
      attribute: 'test',
      path: [],
      value: [1, 2, 'string', true],  // boolean not supported
    }))).rejects.toMatchObject({
      bindings: { attribute: 'test' },
      message: '{attribute} - array has invalid fields',
    });
  });

  it('Should reject with "array has an invalid type" error', async () => {
    const model = new TestModel();
    const validator = new ArrayValidator({
      setContext: new SetContext({
        model,
        path: [],
      }),
      rule: t.string({
        validator: new PresenceValidator(),
      }),
    });

    await expect(validator.validate(new ValueContext({
      model,
      attribute: 'test',
      path: [],
      value: 'not an array',
    }))).rejects.toMatchObject({
      bindings: { attribute: 'test' },
      message: '{attribute} - array has an invalid type',
    });
  });

  it('Should reject because of length is less than 3', async () => {
    const model = new TestModel();
    const validator = new ArrayValidator({
      setContext: new SetContext({
        model,
        path: [],
      }),
      rule: t.string({
        validator: new PresenceValidator(),
      }),
      minLength: 3,
    });

    await expect(validator.validate(new ValueContext({
      model,
      attribute: 'test',
      path: [],
      value: [1, 2],
    }))).rejects.toMatchObject({
      bindings: { attribute: 'test', count: 3 },
      message: '{attribute} - has not enough elements in the array (minimum is {count})',
    });
  });

  it('Should resolve because of length is greater or equal to 3', async () => {
    const model = new TestModel();
    const validator = new ArrayValidator({
      setContext: new SetContext({
        model,
        path: [],
      }),
      rule: t.string({
        validator: new PresenceValidator(),
      }),
      minLength: 3,
    });

    await expect(validator.validate(new ValueContext({
      model,
      attribute: 'test',
      path: [],
      value: [1, 2, 3],
    }))).resolves.toBe(undefined);
  });

  it('Should reject because of length is greater than 3', async () => {
    const model = new TestModel();
    const validator = new ArrayValidator({
      setContext: new SetContext({
        model,
        path: [],
      }),
      rule: t.string({
        validator: new PresenceValidator(),
      }),
      maxLength: 3,
    });

    await expect(validator.validate(new ValueContext({
      model,
      attribute: 'test',
      path: [],
      value: [1, 2, 3, 4],
    }))).rejects.toMatchObject({
      bindings: { attribute: 'test', count: 3 },
      message: '{attribute} - has too many elements in the array (maximum is {count})',
    });
  });

  it('Should resolve because of length is less or equal to 3', async () => {
    const model = new TestModel();
    const validator = new ArrayValidator({
      setContext: new SetContext({
        model,
        path: [],
      }),
      rule: t.string({
        validator: new PresenceValidator(),
      }),
      maxLength: 3,
    });

    await expect(validator.validate(new ValueContext({
      model,
      attribute: 'test',
      path: [],
      value: [1, 2, 3],
    }))).resolves.toBe(undefined);
  });

  it('Should resolves', async () => {
    const model = new TestModel();
    const validator = new ArrayValidator({
      setContext: new SetContext({
        model,
        path: [],
      }),
      rule: t.string({
        validator: new PresenceValidator(),
      }),
    });

    await expect(validator.validate(new ValueContext({
      model,
      attribute: 'test',
      path: [],
      value: [1,2,'3'],
    }))).resolves.toBe(undefined);
  });

  it('Should resolves with warning', async () => {
    const model = new TestModel();
    const validator = new ArrayValidator({
      setContext: new SetContext({
        model,
        path: [],
      }),
      rule: t.string({
        validator: new ValidatorWithWarning(),
      }),
    });

    await expect(validator.validate(new ValueContext({
      model,
      attribute: 'test',
      path: [],
      value: [1,2,'3'],
    }))).resolves.toMatchObject({
      bindings: { attribute: 'test' },
      message: '{attribute} - array has some fields with warnings',
    });
  });

  it('Model should reject.', async () => {
    const model = new TestModel({
      array: [1, ''],
    });

    await expect(model.validate()).rejects.toMatchObject({
      bindings: { attribute: undefined },
      message: '{attribute} - object has invalid fields',
    });
    expect(model.getErrors()).toHaveLength(3);
  });

  it('Model should resolve.', async () => {
    const model = new TestModel({
      array: ['1', '2'],
    });

    await expect(model.validate()).resolves.toBe(undefined);
    expect(model.getErrors()).toHaveLength(0);
  });

  // todo test all custom messages and length check
});
