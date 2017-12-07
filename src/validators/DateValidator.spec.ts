declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import DateValidator from './DateValidator';
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

describe('DateValidator', () => {
  it('Constructor should throw errors', async () => {
    expect(() => new DateValidator({
      minDate: 'not a date' as any,
    })).toThrow(
      'DateValidator - minDate must be a Date instance',
    );

    expect(() => new DateValidator({
      maxDate: 'not a date' as any,
    })).toThrow(
      'DateValidator - maxDate must be a Date instance',
    );
  });

  it('Should validate properly', async () => {
    const validator = new DateValidator({
      minDate: new Date(2000,2,1),
      maxDate: new Date(2000,4,1),
    });

    await expect(validator.validate(createValue('not a date')))
      .rejects.toMatchObject({
        message: '{attribute} - must be a date',
      });
    await expect(validator.validate(createValue(new Date(2000,1,1))))
      .rejects.toMatchObject({
        message: '{attribute} - must be later than {date}',
      });
    await expect(validator.validate(createValue(new Date(2000,5,1))))
      .rejects.toMatchObject({
        message: '{attribute} - must be earlier than {date}',
      });

    await expect(validator.validate(createValue(new Date(2000,3,1)))).resolves.toBe(undefined);
  });

  it('Should validate with custom error messages', async () => {
    const validator = new DateValidator({
      minDate: new Date(2000,2,1),
      maxDate: new Date(2000,4,1),
      errorMessageNotDate: 'not date',
      errorMessageMaxDate: 'max date',
      errorMessageMinDate: 'min date',
    });

    await expect(validator.validate(createValue('not a date')))
      .rejects.toMatchObject({
        message: 'not date',
      });
    await expect(validator.validate(createValue(new Date(2000,1,1))))
      .rejects.toMatchObject({
        message: 'min date',
      });
    await expect(validator.validate(createValue(new Date(2000,5,1))))
      .rejects.toMatchObject({
        message: 'max date',
      });
  });


});
