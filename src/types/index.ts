import AnyType, { AnyTypeConfig } from './AnyType';
import ArrayType, { ArrayTypeConfig } from './ArrayType';
import BooleanType from './BooleanType';
import FunctionType from './FunctionType';
import NumberType from './NumberType';
import ObjectType, { ObjectTypeConfig } from './ObjectType';
import StringType from './StringType';
import OneOfType, { OneOfTypeConfig } from './OneOfType';
import AnyOfType, { AnyOfTypeConfig } from './AnyOfType';
import AllOfType, { AllOfTypeConfig } from './AllOfType';

export {
  AnyType, AnyTypeConfig,
  ArrayType, ArrayTypeConfig,
  BooleanType,
  FunctionType,
  NumberType,
  ObjectType, ObjectTypeConfig,
  StringType,
  OneOfType, OneOfTypeConfig,
  AnyOfType, AnyOfTypeConfig,
  AllOfType, AllOfTypeConfig,
};

export const any = (config?: AnyTypeConfig): AnyType => new AnyType(config);
export const array = (config: ArrayTypeConfig): ArrayType => new ArrayType(config);
export const boolean = (config?: AnyTypeConfig): BooleanType => new BooleanType(config);
export const func = (config?: AnyTypeConfig): FunctionType => new FunctionType(config);
export const number = (config?: AnyTypeConfig): NumberType => new NumberType(config);
export const object = (config: ObjectTypeConfig): ObjectType => new ObjectType(config);
export const string = (config?: AnyTypeConfig): StringType => new StringType(config);
export const oneOf = (config: OneOfTypeConfig): OneOfType => new OneOfType(config);
export const anyOf = (config: AnyOfTypeConfig): AnyOfType => new AnyOfType(config);
export const allOf = (config: AllOfTypeConfig): AllOfType => new AllOfType(config);
