declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import Model from './Model';
import Form from './Form';
import ObjectType from './types/ObjectType';
import ArrayType from './types/ArrayType';
import StringType from './types/StringType';
import NumberType from './types/NumberType';
import BooleanType from './types/BooleanType';
import * as t from './types';

import PresenceValidator from './validators/PresenceValidator';

import SuccessState from './validators/states/SuccessState';
import PristineState from './validators/states/PristineState';

function getTestModel(attributes?) {
  return Model.object(
    {
      string: new StringType(),
      number: new NumberType(),
      boolean: new BooleanType(),
      object: new ObjectType({
        properties: {
          string: new StringType({
            validator: new PresenceValidator(),
          }),
          number: new NumberType(),
        },
      }),
      pending: new ObjectType({
        properties: {
          a: new StringType({
            validator: () => new Promise((res) => setTimeout(res, 100)),
          }),
          b: new StringType(),
        },
      }),
      array: new ArrayType({
        items: new NumberType(),
      }),
      mixed: [
        t.string(),
        t.boolean(),
      ],
      presence: new StringType({
        validator: new PresenceValidator(),
      }),
    },
    attributes,
  );
}

describe('constructor', () => {
  it('Should construct', () => {
    const model = getTestModel();
    const scope = ['foo', 'bar'];
    const form = new Form({
      model,
      scope,
    });

    expect(form.getModel()).toBe(model);
    expect(form.getScope()).toBe(scope);
  });
});

describe('NormalizePath', () => {
  it('Should properly normalize', () => {
    const model = getTestModel();
    const form = new Form({
      model,
      scope: ['foo'],
    });

    expect(form.normalizePath()).toEqual(['foo']);
    expect(form.normalizePath('bar')).toEqual(['foo', 'bar']);
    expect(form.normalizePath(['bar', 1])).toEqual(['foo', 'bar', 1]);
  });
});

describe('Set & Get', () => {
  it('Should properly set & get, root case', () => {
    const model = getTestModel();
    const form = new Form({
      model,
      scope: [],
    });

    form.set('string', 'foo');
    form.set(['number'], 3);
    form.set(['object', 'string'], 'bar');

    expect(form.get()).toEqual({
      string: 'foo',
      number: 3,
      object: {
        string: 'bar',
      },
    });
    expect(form.get('string')).toEqual('foo');
    expect(form.get(['number'])).toEqual(3);
    expect(form.get(['object', 'string'])).toEqual('bar');
  });

  it('Should properly set & get, nested case', () => {
    const model = getTestModel();
    const form = new Form({
      model,
      scope: ['object'],
    });

    form.set('string', 'bar');
    form.set(['number'], 3);

    expect(form.get()).toEqual({
      string: 'bar',
      number: 3,
    });
    expect(form.get('string')).toEqual('bar');
    expect(form.get(['number'])).toEqual(3);
  });
});

describe('getValidationState()', () => {
  it('Should properly get validation state', async () => {
    const model = getTestModel();
    const form = new Form({
      model,
      scope: [],
    });

    form.set('string', 'foo');
    form.set(['number'], 3);
    form.set(['object', 'string'], 'bar');

    expect(form.getValidationState('string')).toBeInstanceOf(PristineState);
    expect(form.getValidationState(['number'])).toBeInstanceOf(PristineState);
    expect(form.getValidationState(['object', 'string'])).toBeInstanceOf(PristineState);

    await form.validate();

    expect(form.getValidationState('string')).toBeInstanceOf(SuccessState);
    expect(form.getValidationState(['number'])).toBeInstanceOf(SuccessState);
    expect(form.getValidationState(['object', 'string'])).toBeInstanceOf(SuccessState);
  });
});

describe('validate()', () => {
  it('Should properly validate', async () => {
    const model = getTestModel();
    const form = new Form({
      model,
      scope: ['object'],
    });

    model.set('string', 'foo');
    model.set(['number'], 3);
    form.set(['string'], 'bar');

    expect(model.getValidationState('string')).toBeInstanceOf(PristineState);
    expect(model.getValidationState(['number'])).toBeInstanceOf(PristineState);
    expect(form.getValidationState(['string'])).toBeInstanceOf(PristineState);

    await form.validate();

    expect(model.getValidationState('string')).toBeInstanceOf(PristineState);
    expect(model.getValidationState(['number'])).toBeInstanceOf(PristineState);
    expect(form.getValidationState(['string'])).toBeInstanceOf(SuccessState);
  });
});

describe('validateAttribute()', () => {
  it('Should properly validate attribute', async () => {
    const model = getTestModel();
    const form = new Form({
      model,
      scope: ['object'],
    });
    model.getObservable().subscribe((s) => console.log(s));
    form.set(['string'], 'bar');

    expect(form.getValidationState()).toBe(undefined);
    expect(form.getValidationState(['number'])).toBe(undefined);
    expect(form.getValidationState(['string'])).toBeInstanceOf(PristineState);

    await form.validateAttribute('string');

    expect(form.getValidationState()).toBe(undefined);
    expect(form.getValidationState(['number'])).toBe(undefined);
    expect(form.getValidationState(['string'])).toBeInstanceOf(SuccessState);
  });
});

describe('validateAttributes()', () => {
  it('Should properly validate attributes', async () => {
    const model = getTestModel();
    const form = new Form({
      model,
      scope: ['object'],
    });
    model.getObservable().subscribe((s) => console.log(s));
    form.set(['string'], 'bar');
    form.set(['number'], 3);

    expect(form.getValidationState()).toBe(undefined);
    expect(form.getValidationState(['number'])).toBeInstanceOf(PristineState);
    expect(form.getValidationState(['string'])).toBeInstanceOf(PristineState);

    await form.validateAttributes(['string', ['number']]);

    expect(form.getValidationState()).toBe(undefined);
    expect(form.getValidationState(['number'])).toBeInstanceOf(SuccessState);
    expect(form.getValidationState(['string'])).toBeInstanceOf(SuccessState);
  });
});

describe('isChanged()', () => {
  it('Should return false', () => {
    const model = getTestModel({
      object: {
        string: 'foo',
      },
    });
    const form = new Form({
      model,
      scope: ['object'],
    });

    expect(form.isChanged()).toBe(false);
    expect(form.isChanged('string')).toBe(false);
    expect(form.isChanged('number')).toBe(false);

    form.set('string', 'foo');
    expect(form.isChanged()).toBe(false);
    expect(form.isChanged('string')).toBe(false);
    expect(form.isChanged('number')).toBe(false);
  });

  it('Should return true', () => {
    const model = getTestModel({
      object: {
        string: 'foo',
      },
    });
    const form = new Form({
      model,
      scope: ['object'],
    });

    expect(form.isChanged()).toBe(false);
    expect(form.isChanged('string')).toBe(false);
    expect(form.isChanged('number')).toBe(false);

    form.set('string', 'bar');
    expect(form.isChanged()).toBe(true);
    expect(form.isChanged('string')).toBe(true);
  });
});

describe('isDirty()', () => {
  it('Should return properly values', () => {
    const model = getTestModel({
      object: {
        string: 'foo',
      },
    });
    const form = new Form({
      model,
      scope: ['object'],
    });

    expect(form.isDirty()).toBe(false);
    expect(form.isDirty('string')).toBe(false);
    expect(form.isDirty('number')).toBe(false);

    form.set('string', 'foo');
    expect(form.isDirty()).toBe(true);
    expect(form.isDirty('string')).toBe(true);
    expect(form.isDirty('number')).toBe(false);
  });
});

describe('isValid()', () => {
  it('Should return valid results', async () => {
    const model = getTestModel({
      object: {
        string: 'foo',
      },
    });
    const form = new Form({
      model,
      scope: ['object'],
    });

    expect(form.isValid()).toBe(true);
    expect(form.isValid('string')).toBe(true);
    expect(form.isValid('number')).toBe(true);

    await form.validate();

    expect(form.isValid()).toBe(true);
    expect(form.isValid('string')).toBe(true);
    expect(form.isValid('number')).toBe(true);

    form.set('string', '');

    await form.validate().catch(() => Promise.resolve());

    expect(form.isValid()).toBe(false);
    expect(form.isValid('string')).toBe(false);
    expect(form.isValid('number')).toBe(true);
  });
});

describe('isPending()', () => {
  it('Should return valid results', async () => {
    const model = getTestModel();
    const form = new Form({
      model,
      scope: ['pending'],
    });

    expect(form.isPending()).toBe(false);
    expect(form.isPending('a')).toBe(false);
    expect(form.isPending('b')).toBe(false);

    setTimeout(
      () => {
        expect(form.isPending()).toBe(true);
        expect(form.isPending('a')).toBe(true);
        expect(form.isPending('b')).toBe(false);
      },
      5,
    );

    await form.validate();

    expect(form.isPending()).toBe(false);
    expect(form.isPending('a')).toBe(false);
    expect(form.isPending('b')).toBe(false);
  });
});

describe('isRequired()', () => {
  it('Should return valid results', async () => {
    const model = getTestModel();
    const form = new Form({
      model,
      scope: ['object'],
    });

    expect(form.isRequired()).toBe(false);
    expect(form.isRequired('string')).toBe(true);
    expect(form.isRequired('number')).toBe(false);
  });
});

describe('getErrors()', () => {
  it('Should return valid errors', async () => {
    const model = getTestModel({
      object: {
        string: '',
      },
      presence: '',
    });

    let form = new Form({
      model,
      scope: [],
    });

    await form.validate().catch(() => Promise.resolve());

    expect(form.getErrors()).toHaveLength(4);

    form = new Form({
      model,
      scope: ['object'],
    });

    await form.validate().catch(() => Promise.resolve());

    expect(form.getErrors()).toHaveLength(2);
  });
});

describe('getFirstError()', () => {
  it('Should return valid error', async () => {
    const model = getTestModel({
      object: {
        string: 'foo',
      },
      presence: '',
    });

    const form = new Form({
      model,
      scope: [],
    });

    await form.validate().catch(() => Promise.resolve());

    expect(form.getFirstError()).toMatchObject({ path: ['presence'] });

    form.set(['object', 'string'], '');

    await form.validate().catch(() => Promise.resolve());
    expect(form.getFirstError()).toMatchObject({ path: ['object', 'string'] });
  });
});
