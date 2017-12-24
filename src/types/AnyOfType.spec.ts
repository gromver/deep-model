declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import Model from '../Model';
import SetContext from '../SetContext';
import ValueContext from '../ValueContext';
import * as t from '../types';
import * as v from '../validators';

const model = Model.object({});

function createSetContext(value, path = ['a']) {
  return new SetContext({
    value,
    model,
    path,
  });
}

describe('applyCheck', () => {
  it('Should check apply value properly', () => {
    const type = t.anyOf({
      types: [
        t.string({
          validator: [v.presence(), v.string()],
        }),
        t.number({
          permission: ({ value }) => {
            if (value > 10) {
              throw new Error('fail');
            }
          },
        }),
      ],
    });

    expect(() => type.applyCheck(createSetContext('foo'))).not.toThrow();
    expect(() => type.applyCheck(createSetContext(2))).not.toThrow();
    expect(() => type.applyCheck(createSetContext(true))).toThrow(
      'AnyOfType::applyCheck - there are no suitable types detected.',
    );
    expect(() => type.applyCheck(createSetContext(11))).toThrow(
      'AnyOfType::applyCheck - there are no suitable types detected.',
    );
  });
});

describe('setCheck', () => {
  it('Should check set value properly', () => {
    const type = t.anyOf({
      types: [
        t.object({
          properties: {
            a: t.anyOf({
              types: [
                t.string({
                  validator: [v.presence(), v.string()],
                }),
                t.number({
                  permission: ({ value }) => {
                    if (value > 10) {
                      throw new Error('fail');
                    }
                  },
                }),
              ],
            }),
          },
        }),
        t.object({
          properties: {
            a: t.boolean(),
          },
        }),
        t.object({
          properties: {
            b: t.string(),
          },
        }),
      ],
    });

    expect(() => type.setCheck(createSetContext('foo'))).not.toThrow();
    expect(() => type.setCheck(createSetContext(2))).not.toThrow();
    expect(() => type.setCheck(createSetContext(true))).not.toThrow();
    expect(() => type.setCheck(createSetContext('foo', ['b']))).not.toThrow();
    expect(() => type.setCheck(createSetContext(11))).toThrow(
      'AnyOfType::setCheck - there are no suitable types detected.',
    );
    expect(() => type.setCheck(createSetContext(() => {}))).toThrow(
      'AnyOfType::setCheck - there are no suitable types detected.',
    );
    expect(() => type.setCheck(createSetContext(1, ['b']))).toThrow(
      'AnyOfType::setCheck - there are no suitable types detected.',
    );
    expect(() => type.setCheck(createSetContext(1, ['c']))).toThrow(
      'AnyOfType::setCheck - there are no suitable types detected.',
    );
  });
});

describe('set', () => {
  it('Should set value properly', () => {
    const type = t.anyOf({
      types: [
        t.object({
          properties: {
            a: t.anyOf({
              types: [
                t.number({
                  permission: ({ value }) => {
                    if (value !== 10) {
                      throw new Error('fail');
                    }
                  },
                  filter: (value) => {
                    return value * 10;
                  },
                }),
                t.number({
                  permission: ({ value }) => {
                    if (value < 10) {
                      throw new Error('fail');
                    }
                  },
                  filter: (value) => {
                    return value * 10;
                  },
                }),
              ],
            }),
          },
        }),
      ],
    });

    type.set(createSetContext(10));
    expect(model.get('a')).toBe(1000);

    type.set(createSetContext(11));
    expect(model.get('a')).toBe(110);

    type.set(createSetContext(20));
    expect(model.get('a')).toBe(200);

    expect(() => type.setCheck(createSetContext(9))).toThrow(
      'AnyOfType::setCheck - there are no suitable types detected.',
    );
  });
});

describe('getValidator', () => {
  it('Should get validator properly', () => {
    const type = t.anyOf({
      types: [
        t.number({
          permission: ({ value }) => {
            if (value !== 10) {
              throw new Error('fail');
            }
          },
          validator: v.presence(),
        }),
        t.number({
          permission: ({ value }) => {
            if (value < 10) {
              throw new Error('fail');
            }
          },
          validator: v.number(),
        }),
      ],
    });

    expect(type.getValidator(createSetContext(9))).toBe(undefined);
    expect(type.getValidator(createSetContext(10))).toEqual(expect.objectContaining({
      validators: expect.arrayContaining([
        expect.any(v.PresenceValidator),
        expect.any(v.NumberValidator),
      ]),
    }));
    expect(type.getValidator(createSetContext(11))).toEqual(expect.objectContaining({
      validators: expect.arrayContaining([
        expect.any(v.NumberValidator),
      ]),
    }));
  });
});

describe('getType', () => {
  it('Should get type properly', () => {
    const type = t.anyOf({
      types: [
        t.object({
          properties: {
            a: t.anyOf({
              types: [
                t.string({
                  validator: [v.presence(), v.string()],
                }),
                t.number({
                  permission: ({ value }) => {
                    if (value > 10) {
                      throw new Error('fail');
                    }
                  },
                }),
              ],
            }),
          },
        }),
        t.object({
          properties: {
            a: t.boolean(),
          },
        }),
        t.object({
          properties: {
            b: t.string(),
          },
        }),
      ],
    });

    expect(type.getType(createSetContext('foo'))).toEqual(expect.objectContaining({
      types: expect.arrayContaining([expect.any(t.AnyOfType)]),
    }));
    expect(type.getType(createSetContext(false))).toEqual(expect.objectContaining({
      types: expect.arrayContaining([expect.any(t.BooleanType)]),
    }));
    expect(type.getType(createSetContext('foo', ['b']))).toEqual(expect.objectContaining({
      types: expect.arrayContaining([expect.any(t.StringType)]),
    }));
    expect(type.getType(createSetContext('foo', ['c']))).toBe(undefined);
  });
});
