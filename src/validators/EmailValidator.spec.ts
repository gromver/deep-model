declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import EmailValidator from './EmailValidator';
import ValueContext from '../ValueContext';

import Model from '../Model';

class TestModel extends Model {
  rules() {
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

describe('EmailValidator', () => {
  it('Should validate properly', async () => {
    const validator = new EmailValidator();

    await expect(validator.validate(createValue('some-mail.ru')))
      .rejects.toMatchObject({
        message: '{attribute} - is not a valid email',
      });
    await expect(validator.validate(createValue('some@mail.ru'))).resolves.toBe(undefined);
    await expect(validator.validate(createValue(undefined))).resolves.toBe(undefined);
  });

  it('Should validate with custom error message', async () => {
    const validator = new EmailValidator({
      errorMessage: 'custom error',
    });

    await expect(validator.validate(createValue('some-mail.ru')))
      .rejects.toMatchObject({
        message: 'custom error',
      });
  });
});
