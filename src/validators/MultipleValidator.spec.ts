declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import MultipleValidator, { promiseAny } from './MultipleValidator';
import PresenceValidator from './PresenceValidator';
import ObjectValidator from './ObjectValidator';

describe('promiseAny', () => {
  it('Should process any.', () => {
    expect(promiseAny([
      Promise.reject(1),
      Promise.resolve(2),
      Promise.resolve(3),
    ])).resolves.toBe(2);

    expect(promiseAny([
      Promise.reject(1),
      Promise.reject(2),
      Promise.reject(3),
    ])).rejects.toEqual([1, 2, 3]);
  });
});

describe('isValidator', () => {
  it('Should return valid results.', () => {
    const validator1 = new MultipleValidator({
      validators: [new ObjectValidator],
    });

    expect(validator1.isValidator(MultipleValidator)).toBe(true);
    expect(validator1.isValidator(ObjectValidator)).toBe(true);
    expect(validator1.isValidator(PresenceValidator)).toBe(false);

    const validator2 = new MultipleValidator({
      validators: [new ObjectValidator, new PresenceValidator()],
    });

    expect(validator2.isValidator(MultipleValidator)).toBe(true);
    expect(validator2.isValidator(ObjectValidator)).toBe(true);
    expect(validator2.isValidator(PresenceValidator)).toBe(true);
  });
});
