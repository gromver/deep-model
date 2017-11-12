declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import MultipleFilter from './MultipleFilter';

describe('MultipleFilter', () => {
  it('Should return composed filter.', () => {
    const filter = MultipleFilter(
      [
        (value: string) => value.trim(),
        (value: string) => value.toLowerCase(),
      ],
    );

    expect(filter('  FooBar')).toBe('foobar');
  });
});
