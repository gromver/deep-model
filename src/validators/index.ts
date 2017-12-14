import Validator from './Validator';
import ArrayValidator, { ArrayValidatorConfig } from './ArrayValidator';
import CustomValidator, { CustomValidatorConfig } from './CustomValidator';
import MultipleValidator, { MultipleValidatorConfig } from './MultipleValidator';
import NumberValidator, { NumberValidatorConfig } from './NumberValidator';
import ObjectValidator, { ObjectValidatorConfig } from './ObjectValidator';
import OneOfTypeValidator, { OneOfTypeValidatorConfig } from './OneOfTypeValidator';
import PresenceValidator, { PresenceValidatorConfig } from './PresenceValidator';
import StringValidator, { StringValidatorConfig } from './StringValidator';
import EmailValidator, { EmailValidatorConfig } from './EmailValidator';
import RangeValidator, { RangeValidatorConfig } from './RangeValidator';
import UrlValidator, { UrlValidatorConfig } from './UrlValidator';
import DateValidator, { DateValidatorConfig } from './DateValidator';
import CompareValidator, { CompareValidatorConfig } from './CompareValidator';

export {
  ArrayValidator, ArrayValidatorConfig,
  CustomValidator, CustomValidatorConfig,
  MultipleValidator, MultipleValidatorConfig,
  NumberValidator, NumberValidatorConfig,
  ObjectValidator, ObjectValidatorConfig,
  OneOfTypeValidator, OneOfTypeValidatorConfig,
  PresenceValidator, PresenceValidatorConfig,
  StringValidator, StringValidatorConfig,
  Validator,
  EmailValidator, EmailValidatorConfig,
  RangeValidator, RangeValidatorConfig,
  UrlValidator, UrlValidatorConfig,
  DateValidator, DateValidatorConfig,
  CompareValidator, CompareValidatorConfig,
};

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

export const email =
  (config?: EmailValidatorConfig): EmailValidator => new EmailValidator(config);

export const range =
  (config: RangeValidatorConfig): RangeValidator => new RangeValidator(config);

export const url =
  (config?: UrlValidatorConfig): UrlValidator => new UrlValidator(config);

export const date =
  (config?: DateValidatorConfig): DateValidator => new DateValidator(config);

export const compare =
  (config: CompareValidatorConfig): CompareValidator => new CompareValidator(config);
