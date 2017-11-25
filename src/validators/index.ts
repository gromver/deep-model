import ArrayValidator, { ArrayValidatorConfig } from './ArrayValidator';
import CustomValidator, { CustomValidatorConfig } from './CustomValidator';
import MultipleValidator, { MultipleValidatorConfig } from './MultipleValidator';
import NumberValidator, { NumberValidatorConfig } from './NumberValidator';
import ObjectValidator, { ObjectValidatorConfig } from './ObjectValidator';
import OneOfTypeValidator, { OneOfTypeValidatorConfig } from './OneOfTypeValidator';
import PresenceValidator, { PresenceValidatorConfig } from './PresenceValidator';
import StringValidator, { StringValidatorConfig } from './StringValidator';

export const array =
  (config: ArrayValidatorConfig): ArrayValidator => new ArrayValidator(config);

export const custom =
  (config: CustomValidatorConfig): CustomValidator => new CustomValidator(config);

export const multiple =
  (config: MultipleValidatorConfig): MultipleValidator => new MultipleValidator(config);

export const number =
  (config?: NumberValidatorConfig): NumberValidator => new NumberValidator(config);

export const object =
  (config: ObjectValidatorConfig): ObjectValidator => new ObjectValidator(config);

export const oneOf =
  (config: OneOfTypeValidatorConfig): OneOfTypeValidator => new OneOfTypeValidator(config);

export const presence =
  (config?: PresenceValidatorConfig): PresenceValidator => new PresenceValidator(config);

export const string =
  (config?: StringValidatorConfig): StringValidator => new StringValidator(config);
