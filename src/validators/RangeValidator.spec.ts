declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import RangeValidator from './RangeValidator';
import ValueContext from '../ValueContext';

import Model from '../Model';

class TestModel extends Model {
  getRules() {
    return {};
  }
}

const model = new TestModel();

function createValue(value) {
  return new ValueContext({
    value,
    model,
    path: [],
    attribute: 'test',
  });
}

describe('RangeValidator', () => {
  it('Constructor should throw an error', async () => {
    expect(() => new RangeValidator({})).toThrow(
      'either inRange or exceptRange prop must be set.',
    );
  });

  it('Should validate properly', async () => {
    const validator = new RangeValidator({
      inRange: [1,2,3],
    });

    await expect(validator.validate(createValue(4)))
      .rejects.toMatchObject({
        message: '{attribute} - must be in range',
      });
    await expect(validator.validate(createValue(0)))
      .rejects.toMatchObject({
        message: '{attribute} - must be in range',
      });

    await expect(validator.validate(createValue(1))).resolves.toBe(undefined);
    await expect(validator.validate(createValue(2))).resolves.toBe(undefined);
    await expect(validator.validate(createValue(3))).resolves.toBe(undefined);
  });

  it('Should validate properly', async () => {
    const validator = new RangeValidator({
      exceptRange: [1,2,3],
    });

    await expect(validator.validate(createValue(1)))
      .rejects.toMatchObject({
        message: '{attribute} - must not be in range',
      });
    await expect(validator.validate(createValue(2)))
      .rejects.toMatchObject({
        message: '{attribute} - must not be in range',
      });
    await expect(validator.validate(createValue(3)))
      .rejects.toMatchObject({
        message: '{attribute} - must not be in range',
      });

    await expect(validator.validate(createValue(0))).resolves.toBe(undefined);
    await expect(validator.validate(createValue(4))).resolves.toBe(undefined);
  });

  it('Should validate with custom error messages', async () => {
    const validator = new RangeValidator({
      inRange: [1,2,3],
      exceptRange: [3,4],
      errorMessageInRange: 'custom error in',
      errorMessageExceptRange: 'custom error except',
    });

    await expect(validator.validate(createValue(0)))
      .rejects.toMatchObject({
        message: 'custom error in',
      });
    await expect(validator.validate(createValue(3)))
      .rejects.toMatchObject({
        message: 'custom error except',
      });
  });


});
