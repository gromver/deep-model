declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import CustomValidator from './CustomValidator';
import ValueContext from '../ValueContext';

import Model from '../Model';

function getTestModel(attributes?) {
  return Model.compile(
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

function func(valueContext: ValueContext): Promise<void | string> {
  const { value } = valueContext;

  if (value < 1) {
    return Promise.reject('error');
  }

  return Promise.resolve();
}

describe('CustomValidator', () => {
  it('Should validate properly', async () => {
    const validator = new CustomValidator({
      func,
    });

    await expect(validator.validate(createValue(0))).rejects.toBe('error');
    await expect(validator.validate(createValue(1))).resolves.toBe(undefined);
  });
});
