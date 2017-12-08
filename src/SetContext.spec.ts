declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import SetContext from './SetContext';
import Model from './Model';

function getTestModel(attributes?) {
  return Model.object(
    {},
    attributes,
  );
}

describe('SetContext', () => {
  it('Should shift context.', () => {
    const model = getTestModel();
    const aContext = new SetContext({
      model,
      path: ['a', 'b', 'c'],
    });

    expect(aContext.get().attribute).toBe('a');
    const bContext = aContext.shift() as SetContext;
    expect(bContext.get().attribute).toBe('b');
    const cContext = bContext.shift() as SetContext;
    expect(cContext.get().attribute).toBe('c');
    const falseContext = cContext.shift();
    expect(falseContext).toBe(false);
  });
});
