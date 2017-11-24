declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import Model from './Model';
import ObjectType from './types/ObjectType';
import ArrayType from './types/ArrayType';
import StringType from './types/StringType';
import NumberType from './types/NumberType';
import BooleanType from './types/BooleanType';
import OneOfType from './types/OneOfType';
import * as t from './types';

import PresenceValidator from './validators/PresenceValidator';
import MultipleValidator from './validators/MultipleValidator';
import SuccessState from './validators/states/SuccessState';
import ErrorState from './validators/states/ErrorState';

class TestModel extends Model {
  getRules() {
    return {
      string: new StringType(),
      number: new NumberType(),
      boolean: new BooleanType(),
      object: new ObjectType({
        rules: {
          string: new StringType(),
          number: new NumberType(),
        },
      }),
      array: new ArrayType({
        rules: new NumberType(),
      }),
      mixed: [
        t.string(),
        t.boolean(),
      ],
    };
  }
}

class ValidationModel extends Model {
  getRules() {
    return {
      presence: t.string({
        validator: new PresenceValidator(),
      }),
    };
  }
}

describe('Dispatch', () => {
  it('Should receive dispatched value.', () => {
    const model = new TestModel();
    const fn = jest.fn((e: any) => expect(e).toBe('test'));

    model.getObservable().subscribe(fn);
    model.dispatch('test');

    expect(fn).toHaveBeenCalled();
  });
});

describe('set()', () => {
  it('Should load values properly.', () => {
    const model = new TestModel();
    model.setAttributes({
      foo: 'foo',
      bar: 'bar',
      string: 'string',
      number: 123,
      boolean: false,
      object: {
        foo: 'foo',
        bar: 'bar',
        string: 'substring',
        number: 456,
        boolean: false,
      },
      array: [1,2,3],
    });

    expect(model.getAttributes()).toEqual({
      string: 'string',
      number: 123,
      boolean: false,
      object: {
        string: 'substring',
        number: 456,
      },
      array: [1,2,3],
    });
  });

  it('Should set value properly.', () => {
    const model = new TestModel();

    model.set('string', 'test');
    model.set(['array', 2], 123);

    expect(model.getAttributes()).toEqual({
      string: 'test',
      array: [undefined, undefined, 123],
    });
  });

  it('Should not set array value by a string typed key.', () => {
    const model = new TestModel();

    expect(() => {
      model.set(['array', '2'], 123);
    }).toThrow(new Error('ArrayType:setCheck - nested attribute key must be a number'));
  });

  it('Should not set nested value to the primitive type.', () => {
    const model = new TestModel();

    expect(() => {
      model.set(['string', 'foo'], 'test');
    }).toThrow(new Error('Primitive types don\'t support nested value setting.'));
  });

  it('Should not set non string typed value to the string type.', () => {
    const model = new TestModel();

    expect(() => {
      model.set(['string'], 123);
    }).toThrow(new Error('StringType:typeCheck - the value must be a string'));
  });

  it('Should set string or number to the "mixed" field type.', () => {
    const model = new TestModel();

    model.set('mixed', 'test');
    expect(model.getAttributes()).toEqual({
      mixed: 'test',
    });

    model.set('mixed', true);
    expect(model.getAttributes()).toEqual({
      mixed: true,
    });
  });

  it('Should not set number to the "mixed" field type.', () => {
    const model = new TestModel();

    expect(() => {
      model.set('mixed', 123);
    }).toThrow(new Error('StringType:typeCheck - the value must be a boolean'));
  });
});

describe('canSet()', () => {
  it('It can set a value.', () => {
    const model = new TestModel();

    expect(model.canSet([])).toBe(true);
    expect(model.canSet('string')).toBe(true);
    expect(model.canSet(['string'])).toBe(true);
    expect(model.canSet('number')).toBe(true);
    expect(model.canSet('boolean')).toBe(true);
    expect(model.canSet('object')).toBe(true);
    expect(model.canSet(['object', 'string'])).toBe(true);
    expect(model.canSet(['object', 'number'])).toBe(true);
    expect(model.canSet('array')).toBe(true);
    expect(model.canSet(['array', 3])).toBe(true);
  });

  it('It can\'t set a value.', () => {
    const model = new TestModel();

    expect(model.canSet('foo')).toBe(false);
    expect(model.canSet(['bar'])).toBe(false);
    expect(model.canSet(['object', 'foo'])).toBe(false);
    expect(model.canSet(['a', 'b'])).toBe(false);
    expect(model.canSet(['array', '3'])).toBe(false);
  });
});

describe('scenarios', () => {
  it('AddScenarios and RemoveScenarios test', async () => {
    const model = new TestModel();

    expect(model.getScenarios()).toEqual([TestModel.SCENARIO_DEFAULT]);

    model.setScenarios('a');
    expect(model.getScenarios()).toEqual(['a']);

    model.addScenarios('b');
    expect(model.getScenarios()).toEqual(['a', 'b']);

    model.addScenarios(['a', 'b', 'c', 'd']);
    expect(model.getScenarios()).toEqual(['a', 'b', 'c', 'd']);

    model.removeScenarios(['a', 'd']);
    expect(model.getScenarios()).toEqual(['b', 'c']);

    model.addScenarios('a');
    expect(model.getScenarios()).toEqual(['b', 'c', 'a']);

    model.removeScenarios('a');
    expect(model.getScenarios()).toEqual(['b', 'c']);

    model.removeScenarios(['a', 'b', 'c', 'd']);
    expect(model.getScenarios()).toEqual([]);
  });

  it('isScenario', async () => {
    const model = new TestModel();

    expect(model.isScenario(TestModel.SCENARIO_DEFAULT)).toBe(true);
    expect(model.isScenario('unknown')).toBe(false);

    model.addScenarios(['a', 'b', 'c', 'd']);
    expect(model.isScenario(TestModel.SCENARIO_DEFAULT)).toBe(true);
    expect(model.isScenario('a')).toBe(true);
    expect(model.isScenario('b')).toBe(true);
    expect(model.isScenario('c')).toBe(true);
    expect(model.isScenario('d')).toBe(true);
    expect(model.isScenario('e')).toBe(false);
  });
});

describe('getType', () => {
  it('Should return certain type.', async () => {
    const model = new TestModel();

    expect(model.getType('number')).toBeInstanceOf(NumberType);
    expect(model.getType(['number'])).toBeInstanceOf(NumberType);
    expect(model.getType('string')).toBeInstanceOf(StringType);
    expect(model.getType('boolean')).toBeInstanceOf(BooleanType);
    expect(model.getType('object')).toBeInstanceOf(ObjectType);
    expect(model.getType(['object', 'string'])).toBeInstanceOf(StringType);
    expect(model.getType(['object', 'number'])).toBeInstanceOf(NumberType);
    expect(model.getType('array')).toBeInstanceOf(ArrayType);
    expect(model.getType(['array', 1])).toBeInstanceOf(NumberType);
    expect(model.getType(['mixed'])).toBeInstanceOf(OneOfType);
  });

  it('Should return null.', async () => {
    const model = new TestModel();

    expect(model.getType('foo')).toBe(null);
    expect(model.getType(['foo'])).toBe(null);
    expect(model.getType(['a', 'b', 'c'])).toBe(null);
    expect(model.getType(['object', 'string', 'foo'])).toBe(null);
    expect(model.getType(['array', '1'])).toBe(null);
  });
});

describe('validationState', () => {
  it('set and get test', () => {
    const model = new TestModel();
    const fn = jest.fn();
    model.getObservable().subscribe(fn);
    model.setValidationState(['test'], new SuccessState());

    const state = model.getValidationState(['test']);

    expect(fn).toHaveBeenCalled();
    expect(state).toBeInstanceOf(SuccessState);
    expect(state).toMatchObject({ path: ['test'] });
  });

  it('set version test', () => {
    const model = new TestModel();
    const fn = jest.fn();
    model.getObservable().subscribe(fn);

    const state1 = new SuccessState();
    const state2 = new ErrorState('Some Error');
    model.setValidationState(['test'], state2);
    model.setValidationState(['test'], state1);

    const state = model.getValidationState(['test']);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(state).toBeInstanceOf(ErrorState);
    expect(state).toMatchObject({ path: ['test'], message: 'Some Error' });
  });
});

describe('getFirstError', () => {
  it('Should return ErrorState object', () => {
    const model = new TestModel();
    model.setValidationState(['x'], new SuccessState());
    model.setValidationState(['y'], new SuccessState());
    model.setValidationState(['a'], new ErrorState('error'));
    model.setValidationState(['b'], new ErrorState('error'));
    model.setValidationState(['c'], new ErrorState('error'));
    model.setValidationState(['c'], new SuccessState());
    model.setValidationState(['d'], new SuccessState());

    const state = model.getFirstError();

    expect(state).toBeInstanceOf(ErrorState);
    expect(state).toMatchObject({ path: ['a'] });
  });

  it('Should return undefined', () => {
    const model = new TestModel();
    model.setValidationState(['x'], new SuccessState());
    model.setValidationState(['a'], new ErrorState('error'));
    model.setValidationState(['a'], new SuccessState());
    model.setValidationState(['d'], new SuccessState());

    const state = model.getFirstError();

    expect(state).toBe(undefined);
  });
});

describe('Validate', () => {
  it('Should reject and return error message', () => {
    const model = new ValidationModel();
  });
});
