declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import DefaultValueFilter from './DefaultValueFilter';

describe('DefaultValueFilter', () => {
  it('Should return filter function that works properly.', () => {
    const filter = DefaultValueFilter('test');

    expect(filter('some value')).toBe('some value');
    expect(filter(undefined)).toBe('test');
  });
});
