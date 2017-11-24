import AnyType, { AnyTypeConfig } from './AnyType';
import OneOfType from './OneOfType';
import SetContext from '../SetContext';
import ValueContext from '../ValueContext';
import Validator from '../validators/Validator';
import ObjectValidator from '../validators/ObjectValidator';
import MultipleValidator from '../validators/MultipleValidator';

export interface ObjectTypeConfig extends AnyTypeConfig {
  rules: { [key: string]: AnyType | (AnyType | (() => AnyType))[] | (() => AnyType) };
  validatorConfig?: {};
}

export default class ObjectType extends AnyType {
  protected rules: { [key: string]: AnyType | (AnyType | (() => AnyType))[] | (() => AnyType) };
  protected validatorConfig: { [key: string]: any };

  constructor(config: ObjectTypeConfig) {
    super(config);

    this.rules = config.rules;
    this.validatorConfig = config.validatorConfig || {};
    this.normalizeRule = this.normalizeRule.bind(this);
  }

  private getRules(): { [key: string]: AnyType } {
    const rules = {};

    for (const k in this.rules) {
      rules[k] = this.normalizeRule(this.rules[k]);
    }

    return rules;
  }

  private normalizeRule(rule: AnyType | (AnyType | (() => AnyType))[] | (() => AnyType)): AnyType {
    if (typeof rule === 'function') {
      return this.normalizeRule(rule());
    } else if (Array.isArray(rule)) {
      const rules = [...rule].map(this.normalizeRule);

      return new OneOfType({ rules });
    } else if (rule instanceof AnyType) {
      return rule;
    }

    throw new Error('ObjectType:normalizeRule - Invalid rule description.');
  }

  protected applyValue(setContext: SetContext) {
    // смотрим правила и записываем по полям
    const rules = this.getRules();
    const { value } = setContext.get();

    for (const k in value) {
      // todo hasOwnProperty check
      const v = value[k];
      const rule = rules[k];

      if (rule) {
        const nextSetContext = setContext.push(k, v);
        rule.apply(nextSetContext);
      }
    }
  }

  protected setValue(setContext: SetContext) {
    const { attribute } = setContext.get();
    const rule = this.getRules()[attribute];

    const nextSetContext = setContext.shift();

    if (nextSetContext) {
      rule.set(nextSetContext);
    } else {
      rule.apply(setContext);
    }
  }

  /**
   * Проверка типа для вложенного значения
   * @param valueContext ValueContext
   * @throws {Error}
   */
  protected setCheck(valueContext: ValueContext) {
    const { attribute } = valueContext;
    const rules = this.getRules();

    if (!rules[attribute]) {
      throw new Error(`ObjectType:typeCheckNested - unknown attribute "${attribute}"`);
    }
  }

  protected canSetValue(setContext: SetContext): boolean {
    const { attribute } = setContext.get();
    const rule = this.getRules()[attribute];

    const nextSetContext = setContext.shift();

    return nextSetContext
      ? rule.canSet(nextSetContext)
      : rule.canApply(setContext);
  }

  protected getTypeValue(setContext: SetContext): AnyType | null {
    const { attribute } = setContext.get();
    const rule = this.getRules()[attribute];

    const nextSetContext = setContext.shift();

    if (nextSetContext) {
      return rule.getType(nextSetContext);
    } else {
      return rule;
    }
  }

  /**
   * Проверка типа
   * @param valueContext ValueContext
   * @throws {Error}
   */
  protected typeCheck(valueContext: ValueContext) {
    const value = valueContext.value;

    if (value !== undefined && (value.constructor !== Object)) {
      throw new Error('ObjectType:typeCheck - the value must be an instance of object');
    }
  }

  getValidator(setContext: SetContext) {
    // return new Promise((resolve, reject) => {
    //   const rules = this.getRules();
    //   const valueContext = setContext.get();
    //   const jobs: Promise<string | Message | void>[] = [];
    //
    //   for (const k in valueContext.value) {
    //     // todo hasOwnProperty check
    //     const v = valueContext.value[k];
    //     const rule = rules[k];
    //
    //     if (rule) {
    //       const nextSetContext = setContext.push(k, v);
    //       jobs.push(rule.validate(nextSetContext));
    //     }
    //   }
    //
    //   Promise.all(jobs).then((warnings) => {
    //     resolve();
    //   }).catch((error) => {
    //     reject(error);
    //   });
    // });
    let validator = this.validator;

    if (validator) {
      // if (!validator.isValidator(ObjectValidator)) {
      //   validator = new MultipleValidator({
      //     validators: [
      //       new ObjectValidator({
      //         isSilent: true,
      //       }),
      //       validator,
      //     ],
      //   });
      // }
      validator = new MultipleValidator({
        validators: [
          new ObjectValidator({
            setContext,
            rules: this.getRules(),
            ...this.validatorConfig,
          }),
          validator,
        ],
      });
    } else {
      validator = new ObjectValidator({
        setContext,
        rules: this.getRules(),
        ...this.validatorConfig,
      });
    }

    return validator;
  }
}
