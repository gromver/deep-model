import CommonType from '../types/CommonType';
import TypeConfigPrimitive from './TypeConfigPrimitive';

export default interface TypeConfigObject extends TypeConfigPrimitive {
  rules: { [key: string]: CommonType };
}
