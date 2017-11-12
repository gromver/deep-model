declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import Model from './Model';
import PrimitiveType from './types/PrimitiveType';

describe('Dispatch', () => {
  it('Should receive dispatched value.', () => {
    const model = new Model(new PrimitiveType({}));
    const fn = jest.fn((e: any) => expect(e).toBe('test'));

    model.getObservable().subscribe(fn);
    model.dispatch('test');

    expect(fn).toHaveBeenCalled();
  });
});
