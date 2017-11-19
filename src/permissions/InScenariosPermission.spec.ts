declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import InScenariosPermission from './InScenariosPermission';
import Model from '../Model';
import ValueContext from '../ValueContext';

class TestModel extends Model {
  getRules() {
    return {};
  }
}

describe('InScenariosPermission', () => {
  it('Should return InScenarios permission. The permission must works properly.', () => {
    const permission = InScenariosPermission(['a', 'b']);
    const model = new TestModel();

    const context = new ValueContext({
      model,
      path: [],
      value: null,
      attribute: '',
    });
    expect(() => permission(context)).toThrow(new Error('InScenarios - you have no access.'));
    model.setScenarios('a');
    expect(() => permission(context)).not.toThrow();
    model.setScenarios('b');
    expect(() => permission(context)).not.toThrow();
    model.setScenarios(['a', 'b', 'c']);
    expect(() => permission(context)).not.toThrow();
  });
});
