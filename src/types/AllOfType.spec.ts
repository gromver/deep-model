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
    const type = t.allOf({
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

    expect(() => type.applyCheck(createSetContext('foo'))).toThrow(
      'AllOfType::applyCheck - there are exists at least one not suitable type.',
    );
    expect(() => type.applyCheck(createSetContext(11))).toThrow(
      'AllOfType::applyCheck - there are exists at least one not suitable type.',
    );
    expect(() => type.applyCheck(createSetContext(false))).toThrow(
      'AllOfType::applyCheck - there are exists at least one not suitable type.',
    );

    const type2 = t.allOf({
      types: [
        t.number({
          permission: ({ value }) => {
            if (value > 10) {
              throw new Error('fail');
            }
          },
        }),
        t.number({
          permission: ({ value }) => {
            if (value < 0) {
              throw new Error('fail');
            }
          },
        }),
      ],
    });
    expect(() => type2.applyCheck(createSetContext(0))).not.toThrow();
    expect(() => type2.applyCheck(createSetContext(10))).not.toThrow();
    expect(() => type.applyCheck(createSetContext(11))).toThrow(
      'AllOfType::applyCheck - there are exists at least one not suitable type.',
    );
    expect(() => type.applyCheck(createSetContext(-1))).toThrow(
      'AllOfType::applyCheck - there are exists at least one not suitable type.',
    );
  });
});

describe('setCheck', () => {
  it('Should check set value properly', () => {
    const type = t.allOf({
      types: [
        t.object({
          properties: {
            a: t.allOf({
              types: [
                t.number({
                  permission: ({ value }) => {
                    if (value < 0) {
                      throw new Error('fail');
                    }
                  },
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
            a: t.number({
              permission: ({ value }) => {
                if (value > 5) {
                  throw new Error('fail');
                }
              },
            }),
          },
        }),
      ],
    });

    expect(() => type.setCheck(createSetContext(0))).not.toThrow();
    expect(() => type.setCheck(createSetContext(5))).not.toThrow();
    expect(() => type.setCheck(createSetContext(6))).toThrow(
      'AllOfType::setCheck - there are exists at least one not suitable type.',
    );
    expect(() => type.setCheck(createSetContext(() => {}))).toThrow(
      'AllOfType::setCheck - there are exists at least one not suitable type.',
    );
    expect(() => type.setCheck(createSetContext(1, ['c']))).toThrow(
      'AllOfType::setCheck - there are exists at least one not suitable type.',
    );
  });
});

describe('set', () => {
  it('Should set value properly', () => {
    const type = t.allOf({
      types: [
        t.object({
          properties: {
            a: t.allOf({
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

    expect(() => type.setCheck(createSetContext(11))).toThrow(
      'AllOfType::setCheck - there are exists at least one not suitable type.',
    );

    expect(() => type.setCheck(createSetContext(9))).toThrow(
      'AllOfType::setCheck - there are exists at least one not suitable type.',
    );
  });
});

describe('getValidator', () => {
  it('Should get validator properly', () => {
    const type = t.allOf({
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
    expect(type.getValidator(createSetContext(11))).toBe(undefined);
    expect(type.getValidator(createSetContext(10))).toEqual(expect.objectContaining({
      validators: expect.arrayContaining([
        expect.any(v.PresenceValidator),
        expect.any(v.NumberValidator),
      ]),
    }));
  });
});

describe('getType', () => {
  it('Should get type properly', () => {
    const type = t.allOf({
      types: [
        t.object({
          properties: {
            a: t.allOf({
              types: [
                t.number({
                  permission: ({ value }) => {
                    if (value < 0) {
                      throw new Error('fail');
                    }
                  },
                  validator: v.presence(),
                }),
                t.number({
                  permission: ({ value }) => {
                    if (value > 10) {
                      throw new Error('fail');
                    }
                  },
                  validator: v.number(),
                }),
              ],
            }),
          },
        }),
        t.object({
          properties: {
            a: t.number({
              permission: ({ value }) => {
                if (value > 5) {
                  throw new Error('fail');
                }
              },
              validator: v.number(),
            }),
          },
        }),
      ],
    });

    expect(type.getType(createSetContext(0))).toEqual(expect.objectContaining({
      types: expect.arrayContaining([expect.any(t.AllOfType)]),
    }));
    expect(type.getType(createSetContext(5))).toEqual(expect.objectContaining({
      types: expect.arrayContaining([expect.any(t.AllOfType)]),
    }));
    expect(type.getType(createSetContext(6))).toBe(undefined);
  });
});
