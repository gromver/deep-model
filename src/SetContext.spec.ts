declare const jest;
declare const describe;
declare const it;
declare const expect;
declare const require;

import SetContext from './SetContext';
import Model from './Model';
import PrimitiveType from './types/StringType';

describe('SetContext', () => {
  it('Should iterate.', () => {
    const model = new Model(new PrimitiveType({}));
    const context = new SetContext(model,[1,2,3]);

    // const iter = context[Symbol.iterator]();
    // // iter.next();
    // const clone = context.clone();
    // const cloneIter = clone[Symbol.iterator]();
    // // for (const i of context) {
    // //   console.log(i);
    // // }
    // console.log(cloneIter.next(), cloneIter.next(), cloneIter.next());
    // expect(context.next()).toBe();

    console.log(context.get());
    context.shift();
    console.log(context.get());
    context.shift();
    console.log(context.get());
    context.shift();
    console.log(context.get());
    context.shift();
    console.log(context.get());
    context.shift();
    console.log(context.get());
  });
});
