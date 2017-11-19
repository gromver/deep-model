declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import ExceptScenariosPermission from './ExceptScenariosPermission';
import Model from '../Model';
import ValueContext from '../ValueContext';

class TestModel extends Model {
  getRules() {
    return {};
  }
}

describe('ExceptScenariosPermission', () => {
  it('Should return ExceptScenarios permission. The permission must works properly.', () => {
    const permission = ExceptScenariosPermission(['a', 'b']);
    const model = new TestModel();

    const context = new ValueContext({
      model,
      path: [],
      value: null,
      attribute: '',
    });
    expect(() => permission(context)).not.toThrow();
    model.setScenarios('a');
    expect(() => permission(context)).toThrow(new Error('ExceptScenarios - you have no access.'));
    model.setScenarios('b');
    expect(() => permission(context)).toThrow(new Error('ExceptScenarios - you have no access.'));
    model.setScenarios(['c', 'd']);
    expect(() => permission(context)).not.toThrow();
    model.setScenarios([]);
    expect(() => permission(context)).not.toThrow();
  });
});
