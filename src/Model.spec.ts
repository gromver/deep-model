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

const getModel = (attributes?) => new Model(
  new ObjectType({
    rules: {
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
    },
  }),
  attributes,
);

describe('Dispatch', () => {
  it('Should receive dispatched value.', () => {
    const model = getModel();
    const fn = jest.fn((e: any) => expect(e).toBe('test'));

    model.getObservable().subscribe(fn);
    model.dispatch('test');

    expect(fn).toHaveBeenCalled();
  });

  it('Should load values properly.', () => {
    const model = getModel();
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
    const model = getModel();

    model.set('string', 'test');
    console.log('AA', model.getAttributes());
    expect(model.getAttributes()).toEqual({
      string: 'test',
    });
  });

});
