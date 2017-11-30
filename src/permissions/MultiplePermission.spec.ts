declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import MultiplePermission from './MultiplePermission';
import Model from '../Model';
import ValueContext from '../ValueContext';

class TestModel extends Model {
  rules() {
    return {};
  }
}

describe('MultiplePermission', () => {
  it('Should return composed permission. The permission must works properly.', () => {
    const permission = MultiplePermission(
      [
        (context: ValueContext) => {
          if (context.value <= 5) {
            throw new Error('Value must be greater than 5');
          }
        },
        (context: ValueContext) => {
          if (context.value >= 10) {
            throw new Error('Value must be less than 10');
          }
        },
      ],
    );

    const context = new ValueContext({
      path: [],
      value: 6,
      model: new TestModel(),
      attribute: '',
    });
    expect(() => permission(context)).not.toThrow();
    context.value = 5;
    expect(() => permission(context)).toThrow(new Error('Value must be greater than 5'));
    context.value = 10;
    expect(() => permission(context)).toThrow(new Error('Value must be less than 10'));
  });
});
