import AnyType from '../types/AnyType';
import TypeConfigPrimitive from './TypeConfigPrimitive';

export default interface TypeConfigObject extends TypeConfigPrimitive {
  rules: { [key: string]: AnyType };
}
