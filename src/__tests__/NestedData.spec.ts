declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import Model from '../Model';
import * as t from '../types';
// import * as v from '../validators';

const itemRule = t.array({
  items: [
    t.object({
      properties: {
        name: t.string(),
        isGroup: t.boolean(),
        value: t.string(),
      },
      permission: (vc) => {
        if (vc.value.isGroup) {
          throw new Error();
        }
      },
    }),
    t.object({
      properties: {
        name: t.string(),
        isGroup: t.boolean(),
        items: () => itemRule,
      },
      permission: (vc) => {
        if (!vc.value.isGroup) {
          throw new Error();
        }
      },
    }),
  ],
});

class TestModel extends Model {
  rules() {
    return {
      items: itemRule,
    };
  }
}

const structure = {
  items: [
    {
      name: 'group 1',
      isGroup: true,
      dirtyValue: 'sdsf',
      items: [
        {
          name: 'sub group 1',
          isGroup: true,
          items: [
            {
              name: 'sub sub group 1',
              isGroup: true,
              items: [
                {
                  name: 'item 3',
                  isGroup: false,
                  value: 'v3',
                },
              ],
            },
            {
              name: 'item 2',
              isGroup: false,
              value: 'v2',
              dirtyValue: 'sdsf',
            },
          ],
        },
      ],
    },
    {
      name: 'item 1',
      isGroup: false,
      value: 'v1',
      dirtyValue: 'sdsf',
    },
  ],
};

describe('Nested test', () => {
  it('Should load nested data structure', () => {
    const model = new TestModel();
    model.setAttributes(structure);
    expect(model.getAttributes()).toEqual({
      items: [
        {
          name: 'group 1',
          isGroup: true,
          items: [
            {
              name: 'sub group 1',
              isGroup: true,
              items: [
                {
                  name: 'sub sub group 1',
                  isGroup: true,
                  items: [
                    {
                      name: 'item 3',
                      isGroup: false,
                      value: 'v3',
                    },
                  ],
                },
                {
                  name: 'item 2',
                  isGroup: false,
                  value: 'v2',
                },
              ],
            },
          ],
        },
        {
          name: 'item 1',
          isGroup: false,
          value: 'v1',
        },
      ],
    });
  });
});
