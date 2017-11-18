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
import * as t from './types';

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

describe('Dispatch', () => {
  it('Should receive dispatched value.', () => {
    const model = new TestModel();
    const fn = jest.fn((e: any) => expect(e).toBe('test'));

    model.getObservable().subscribe(fn);
    model.dispatch('test');

    expect(fn).toHaveBeenCalled();
  });
});

describe('Set', () => {
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
