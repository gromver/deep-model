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

function getTestModel(attributes?) {
  return Model.object(
    {
      string: new StringType(),
      number: new NumberType(),
      boolean: new BooleanType(),
      object: new ObjectType({
        properties: {
          string: new StringType(),
          number: new NumberType(),
        },
      }),
      array: new ArrayType({
        items: new NumberType(),
      }),
      mixed: [
        t.string(),
        t.boolean(),
      ],
    },
    attributes,
  );
}

function getValidationModel(attributes?) {
  return Model.object(
    {
      presence: t.string({
        validator: new PresenceValidator(),
      }),
    },
    attributes,
  );
}

describe('Dispatch', () => {
  it('Should receive dispatched value.', () => {
    const model = getTestModel();
    const fn = jest.fn((e: any) => expect(e).toBe('test'));

    model.getObservable().subscribe(fn);
    model.dispatch('test');

    expect(fn).toHaveBeenCalled();
  });
});

describe('set()', () => {
  it('Should load values properly.', () => {
    const model = getTestModel();
    model.set({
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

    expect(model.get()).toEqual({
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
    const model = getTestModel();

    model.set('string', 'test');
    model.set(['array', 2], 123);

    expect(model.get()).toEqual({
      string: 'test',
      array: [undefined, undefined, 123],
    });
  });

  it('Should not set array value by a string typed key.', () => {
    const model = getTestModel();

    expect(() => {
      model.set(['array', '2'], 123);
    }).toThrow(new Error('ArrayType:setCheck - nested attribute key must be a number'));
  });

  it('Should not set nested value to the primitive type.', () => {
    const model = getTestModel();

    expect(() => {
      model.set(['string', 'foo'], 'test');
    }).toThrow(new Error('Primitive types don\'t support nested value setting.'));
  });

  it('Should not set non string typed value to the string type.', () => {
    const model = getTestModel();

    expect(() => {
      model.set(['string'], 123);
    }).toThrow(new Error('StringType:typeCheck - the value must be a string'));
  });

  it('Should set string or number to the "mixed" field type.', () => {
    const model = getTestModel();

    model.set('mixed', 'test');
    expect(model.get()).toEqual({
      mixed: 'test',
    });

    model.set('mixed', true);
    expect(model.get()).toEqual({
      mixed: true,
    });
  });

  it('Should not set number to the "mixed" field type.', () => {
    const model = getTestModel();

    expect(() => {
      model.set('mixed', 123);
    }).toThrow(new Error('StringType:typeCheck - the value must be a boolean'));
  });
});

describe('canSet()', () => {
  it('It can set a value.', () => {
    const model = getTestModel();

    expect(model.canSet({})).toBe(true);
    expect(model.canSet('string', 'foo')).toBe(true);
    expect(model.canSet(['string'], 'foo')).toBe(true);
    expect(model.canSet('number', 2)).toBe(true);
    expect(model.canSet('boolean', false)).toBe(true);
    expect(model.canSet('object', {})).toBe(true);
    expect(model.canSet(['object', 'string'], 'foo')).toBe(true);
    expect(model.canSet(['object', 'number'], 2)).toBe(true);
    expect(model.canSet('array', [1, 2])).toBe(true);
    expect(model.canSet(['array', 3], 2)).toBe(true);
  });

  it('It can\'t set a value.', () => {
    const model = getTestModel();

    expect(model.canSet([])).toBe(false);
    expect(model.canSet(2)).toBe(false);
    expect(model.canSet('foo')).toBe(false);
    expect(model.canSet('foo','some value')).toBe(false);
    expect(model.canSet(['bar'], 'some value')).toBe(false);
    expect(model.canSet(['object', 'foo'], 'some value')).toBe(false);
    expect(model.canSet(['a', 'b'], 'some value')).toBe(false);
    expect(model.canSet(['array', '3'], 'string value')).toBe(false);
  });
});

describe('scenarios', () => {
  it('AddScenarios and RemoveScenarios test', async () => {
    const model = getTestModel();

    expect(model.getScenarios()).toEqual([Model.SCENARIO_DEFAULT]);

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
    const model = getTestModel();

    expect(model.isScenario(Model.SCENARIO_DEFAULT)).toBe(true);
    expect(model.isScenario('unknown')).toBe(false);

    model.addScenarios(['a', 'b', 'c', 'd']);
    expect(model.isScenario(Model.SCENARIO_DEFAULT)).toBe(true);
    expect(model.isScenario('a')).toBe(true);
    expect(model.isScenario('b')).toBe(true);
    expect(model.isScenario('c')).toBe(true);
    expect(model.isScenario('d')).toBe(true);
    expect(model.isScenario('e')).toBe(false);
  });
});

describe('getType', () => {
  it('Should return certain type.', async () => {
    const model = getTestModel();

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
    const model = getTestModel();

    expect(model.getType('foo')).toBe(undefined);
    expect(model.getType(['foo'])).toBe(undefined);
    expect(model.getType(['a', 'b', 'c'])).toBe(undefined);
    expect(model.getType(['object', 'string', 'foo'])).toBe(undefined);
    expect(model.getType(['array', '1'])).toBe(undefined);
  });
});

describe('validationState', () => {
  it('set and get test', () => {
    const model = getTestModel();
    const fn = jest.fn();
    model.getObservable().subscribe(fn);
    model.setValidationState(['test'], new SuccessState());

    const state = model.getValidationState(['test']);

    expect(fn).toHaveBeenCalled();
    expect(state).toBeInstanceOf(SuccessState);
    expect(state).toMatchObject({ path: ['test'] });
  });

  it('set version test', () => {
    const model = getTestModel();
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
    const model = getTestModel();
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
    const model = getTestModel();
    model.setValidationState(['x'], new SuccessState());
    model.setValidationState(['a'], new ErrorState('error'));
    model.setValidationState(['a'], new SuccessState());
    model.setValidationState(['d'], new SuccessState());

    const state = model.getFirstError();

    expect(state).toBe(undefined);
  });
});

describe('Validate', () => {
  it('Should reject and return error message', async () => {
    const model = getValidationModel({ presence: '' });

    await expect(model.validate()).rejects.toMatchObject({
      message: '{attribute} - object has invalid fields',
    });
  });
});

describe('isChanged', () => {
  it('Should return proper values', () => {
    const model = getTestModel({
      string: 'a',
      object: {
        string: 'b',
      },
    });

    expect(model.isChanged()).toBe(false);
    model.set('string', 'b');
    expect(model.isChanged()).toBe(true);
    model.set('string', 'a');
    model.set(['object', 'string'], 'b');
    expect(model.isChanged()).toBe(false);
    model.set(['object', 'string'], 'c');
    expect(model.isChanged()).toBe(true);
  });
});

describe('Test Model with primitive types', () => {
  it('Should set value', () => {
    const model = new Model({
      type: t.number(),
      value: -1,
    });
    expect(model.get()).toBe(-1);

    model.set([], 1);
    expect(model.get()).toBe(1);
    model.set([], 2);
    expect(model.get()).toBe(2);
  });

  it('Should not set value and throw an error', () => {
    const model = new Model({
      type: t.number(),
      value: 0,
    });

    expect(() => {
      model.set('2');
    }).toThrow();
    expect(() => {
      model.set([], false);
    }).toThrow();
    expect(() => {
      new Model({
        type: t.number(),
        value: '0',
      });
    }).toThrow();
  });
});

describe('Test Model with array types', () => {
  it('Should set value', () => {
    const model = new Model({
      type: t.array({
        items: t.number(),
      }),
      value: [1,2,3],
    });
    expect(model.get()).toEqual([1,2,3]);

    model.set([3,2,1]);
    expect(model.get()).toEqual([3,2,1]);
    model.set([1], 10);
    expect(model.get()).toEqual([3,10,1]);
    expect(model.get([1])).toEqual(10);
  });

  it('Should not set value and throw an error', () => {
    const model = new Model({
      type: t.array({
        items: t.number(),
      }),
      value: [],
    });

    expect(() => {
      model.set(1, '2');
    }).toThrow();
    expect(() => {
      model.set('string');
    }).toThrow();
    expect(() => {
      new Model({
        type: t.array({
          items: t.number(),
        }),
        value: 'string',
      });
    }).toThrow();
  });
});

describe('getValidationStates', () => {
  it('Should return proper states', () => {
    const model = getTestModel();
    const state = new SuccessState();
    model.setValidationState(['foo'], state);
    model.setValidationState(['a', 'b'], state);
    expect(model.getValidationStates()).toEqual(expect.objectContaining({
      '["foo"]': expect.any(SuccessState),
      '["a","b"]': expect.any(SuccessState),
    }));
  });

  it('Should return proper states for the specified path', () => {
    const model = getTestModel();
    const state = new SuccessState();
    model.setValidationState(['foo'], state);
    model.setValidationState(['a', 'b'], state);
    model.setValidationState(['a', 'c'], state);
    expect(model.getValidationStates(['a'])).toEqual(expect.objectContaining({
      '["a","b"]': expect.any(SuccessState),
      '["a","c"]': expect.any(SuccessState),
    }));
  });
});
