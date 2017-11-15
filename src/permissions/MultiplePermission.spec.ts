declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import MultiplePermission from './MultiplePermission';
import SetContext from '../SetContext';

describe('MultiplePermission', () => {
  it('Should return composed permission.', () => {
    const permission = MultiplePermission(
      [
        (context: SetContext) => context.value > 5,
        (context: SetContext) => context.value < 10,
      ],
    );

    const context = new SetContext(null as any, [], 6);
    expect(permission(context)).toBe(true);
    context.value = 5;
    expect(permission(context)).toBe(false);
    context.value = 10;
    expect(permission(context)).toBe(false);
  });
});
