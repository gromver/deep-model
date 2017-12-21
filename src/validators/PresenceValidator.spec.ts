declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import PresenceValidator from './PresenceValidator';
import ValueContext from '../ValueContext';

import Model from '../Model';

function getTestModel(attributes?) {
  return Model.object(
    {},
    attributes,
  );
}

const model = getTestModel();

function createValue(value) {
  return new ValueContext({
    value,
    model,
    path: [],
    attribute: 'test',
  });
}

describe('PresenceValidator', () => {
  it('Should validate properly', async () => {
    const validator = new PresenceValidator();

    await expect(validator.validate(createValue('foo'))).resolves.toBe(undefined);
    await expect(validator.validate(createValue(1))).resolves.toBe(undefined);
    await expect(validator.validate(createValue(false))).resolves.toBe(undefined);
    await expect(validator.validate(createValue(true))).resolves.toBe(undefined);

    await expect(validator.validate(createValue(undefined))).rejects.toMatchObject({
      message: '{attribute} - can\'t be blank',
    });
    await expect(validator.validate(createValue(null))).rejects.toMatchObject({
      message: '{attribute} - can\'t be blank',
    });
    await expect(validator.validate(createValue({}))).rejects.toMatchObject({
      message: '{attribute} - can\'t be blank',
    });
    await expect(validator.validate(createValue([]))).rejects.toMatchObject({
      message: '{attribute} - can\'t be blank',
    });
    await expect(validator.validate(createValue(''))).rejects.toMatchObject({
      message: '{attribute} - can\'t be blank',
    });
  });

  it('Should validate properly with allowEmpty=true property', async () => {
    const validator = new PresenceValidator({
      allowEmpty: true,
    });

    await expect(validator.validate(createValue('foo'))).resolves.toBe(undefined);
    await expect(validator.validate(createValue(1))).resolves.toBe(undefined);
    await expect(validator.validate(createValue(false))).resolves.toBe(undefined);
    await expect(validator.validate(createValue(true))).resolves.toBe(undefined);

    await expect(validator.validate(createValue(undefined))).resolves.toBe(undefined);
    await expect(validator.validate(createValue(null))).resolves.toBe(undefined);

    await expect(validator.validate(createValue({}))).rejects.toMatchObject({
      message: '{attribute} - can\'t be blank',
    });
    await expect(validator.validate(createValue([]))).rejects.toMatchObject({
      message: '{attribute} - can\'t be blank',
    });
    await expect(validator.validate(createValue(''))).rejects.toMatchObject({
      message: '{attribute} - can\'t be blank',
    });
  });

  it('Should validate with custom error message', async () => {
    const validator = new PresenceValidator({
      errorMessage: 'custom error',
    });

    await expect(validator.validate(createValue(null)))
      .rejects.toMatchObject({
        message: 'custom error',
      });
  });
});
