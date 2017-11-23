declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import MultipleValidator, { promiseAny } from './MultipleValidator';

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
