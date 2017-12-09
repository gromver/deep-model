declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import NumberValidator from './NumberValidator';
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

describe('NumberValidator', () => {
  it('greaterThan', async () => {
    const validator = new NumberValidator({
      greaterThan: 0,
    });

    let result = await validator.validate(createValue(0)).then(() => true).catch(() => false);
    expect(result).toBe(false);

    result = await validator.validate(createValue(-1)).then(() => true).catch(() => false);
    expect(result).toBe(false);

    result = await validator.validate(createValue(1)).then(() => true).catch(() => false);
    expect(result).toBe(true);
  });

  it('greaterThanOrEqual', async () => {
    const validator = new NumberValidator({
      greaterThanOrEqualTo: 0,
    });

    let result = await validator.validate(createValue(0)).then(() => true).catch(() => false);
    expect(result).toBe(true);

    result = await validator.validate(createValue(-1)).then(() => true).catch(() => false);
    expect(result).toBe(false);

    result = await validator.validate(createValue(1)).then(() => true).catch(() => false);
    expect(result).toBe(true);
  });

  it('lessThan', async () => {
    const validator = new NumberValidator({
      lessThan: 0,
    });

    let result = await validator.validate(createValue(0)).then(() => true).catch(() => false);
    expect(result).toBe(false);

    result = await validator.validate(createValue(-1)).then(() => true).catch(() => false);
    expect(result).toBe(true);

    result = await validator.validate(createValue(1)).then(() => true).catch(() => false);
    expect(result).toBe(false);
  });

  it('lessThanOrEqual', async () => {
    const validator = new NumberValidator({
      lessThanOrEqualTo: 0,
    });

    let result = await validator.validate(createValue(0)).then(() => true).catch(() => false);
    expect(result).toBe(true);

    result = await validator.validate(createValue(-1)).then(() => true).catch(() => false);
    expect(result).toBe(true);

    result = await validator.validate(createValue(1)).then(() => true).catch(() => false);
    expect(result).toBe(false);
  });

  it('equalTo', async () => {
    const validator = new NumberValidator({
      equalTo: 0,
    });

    let result = await validator.validate(createValue(0)).then(() => true).catch(() => false);
    expect(result).toBe(true);

    result = await validator.validate(createValue(-1)).then(() => true).catch(() => false);
    expect(result).toBe(false);

    result = await validator.validate(createValue(1)).then(() => true).catch(() => false);
    expect(result).toBe(false);
  });

  it('divisibleBy', async () => {
    const validator = new NumberValidator({
      divisibleBy: 2,
    });

    let result = await validator.validate(createValue(2)).then(() => true).catch(() => false);
    expect(result).toBe(true);

    result = await validator.validate(createValue(-1)).then(() => true).catch(() => false);
    expect(result).toBe(false);

    result = await validator.validate(createValue(1)).then(() => true).catch(() => false);
    expect(result).toBe(false);

    result = await validator.validate(createValue(0)).then(() => true).catch(() => false);
    expect(result).toBe(true);
  });

  it('odd', async () => {
    const validator = new NumberValidator({
      odd: true,
    });

    let result = await validator.validate(createValue(0)).then(() => true).catch(() => false);
    expect(result).toBe(false);

    result = await validator.validate(createValue(2)).then(() => true).catch(() => false);
    expect(result).toBe(false);

    result = await validator.validate(createValue(-1)).then(() => true).catch(() => false);
    expect(result).toBe(true);

    result = await validator.validate(createValue(1)).then(() => true).catch(() => false);
    expect(result).toBe(true);
  });

  it('even', async () => {
    const validator = new NumberValidator({
      even: true,
    });

    let result = await validator.validate(createValue(0)).then(() => true).catch(() => false);
    expect(result).toBe(true);

    result = await validator.validate(createValue(2)).then(() => true).catch(() => false);
    expect(result).toBe(true);

    result = await validator.validate(createValue(-1)).then(() => true).catch(() => false);
    expect(result).toBe(false);

    result = await validator.validate(createValue(1)).then(() => true).catch(() => false);
    expect(result).toBe(false);
  });

  it('onlyInteger false', async () => {
    const validator = new NumberValidator();

    let result = await validator.validate(createValue(0)).then(() => true).catch(() => false);
    expect(result).toBe(true);

    result = await validator.validate(createValue(-1)).then(() => true).catch(() => false);
    expect(result).toBe(true);

    result = await validator.validate(createValue(1)).then(() => true).catch(() => false);
    expect(result).toBe(true);

    result = await validator.validate(createValue(1.45)).then(() => true).catch(() => false);
    expect(result).toBe(true);

    result = await validator.validate(createValue(-1.45)).then(() => true).catch(() => false);
    expect(result).toBe(true);
  });

  it('onlyInteger true', async () => {
    const validator = new NumberValidator({
      onlyInteger: true,
    });

    let result = await validator.validate(createValue(0)).then(() => true).catch(() => false);
    expect(result).toBe(true);

    result = await validator.validate(createValue(-1)).then(() => true).catch(() => false);
    expect(result).toBe(true);

    result = await validator.validate(createValue(1)).then(() => true).catch(() => false);
    expect(result).toBe(true);

    result = await validator.validate(createValue(1.45)).then(() => true).catch(() => false);
    expect(result).toBe(false);

    result = await validator.validate(createValue(-1.45)).then(() => true).catch(() => false);
    expect(result).toBe(false);
  });


  it('strict', async () => {
    const validator = new NumberValidator({
      strict: true,
    });

    let result = await validator.validate(createValue('-1')).then(() => true).catch(() => false);
    expect(result).toBe(false);

    result = await validator.validate(createValue('1df')).then(() => true).catch(() => false);
    expect(result).toBe(false);

    result = await validator.validate(createValue('-1.5')).then(() => true).catch(() => false);
    expect(result).toBe(false);

    result = await validator.validate(createValue('+1.5')).then(() => true).catch(() => false);
    expect(result).toBe(false);

    result = await validator.validate(createValue('0.1')).then(() => true).catch(() => false);
    expect(result).toBe(true);

    result = await validator.validate(createValue('1.01')).then(() => true).catch(() => false);
    expect(result).toBe(true);

    result = await validator.validate(createValue('1')).then(() => true).catch(() => false);
    expect(result).toBe(true);
  });

  it('strict and onlyInteger', async () => {
    const validator = new NumberValidator({
      strict: true,
      onlyInteger: true,
    });

    let result = await validator.validate(createValue('-1')).then(() => true).catch(() => false);
    expect(result).toBe(false);

    result = await validator.validate(createValue('1df')).then(() => true).catch(() => false);
    expect(result).toBe(false);

    result = await validator.validate(createValue('-1.5')).then(() => true).catch(() => false);
    expect(result).toBe(false);

    result = await validator.validate(createValue('+1.5')).then(() => true).catch(() => false);
    expect(result).toBe(false);

    result = await validator.validate(createValue('0.1')).then(() => true).catch(() => false);
    expect(result).toBe(false);

    result = await validator.validate(createValue('1.01')).then(() => true).catch(() => false);
    expect(result).toBe(false);

    result = await validator.validate(createValue('1')).then(() => true).catch(() => false);
    expect(result).toBe(true);
  });
});
