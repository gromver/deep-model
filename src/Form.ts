import { Subject } from 'rxjs/Subject';
import Model, { ModelConfig } from './Model';
import SetContext from './SetContext';
import Event from './events/Event';
import SetValueEvent from './events/SetValueEvent';
import ValidationStateEvent from './events/ValidationStateEvent';
import AnyType from './types/AnyType';
import ObjectType from './types/ObjectType';
import ArrayType from './types/ArrayType';
import Validator from './validators/Validator';
import PresenceValidator from './validators/PresenceValidator';
import State from './validators/states/State';
import ErrorState from './validators/states/ErrorState';
import PendingState from './validators/states/PendingState';
import Message from './validators/utils/Message';

const _ = {
  cloneDeep: require('lodash/cloneDeep'),
  keys: require('lodash/keys'),
  values: require('lodash/values'),
  isEqual: require('lodash/isEqual'),
  get: require('lodash/get'),
  set: require('lodash/set'),
};

export interface FormConfig {
  model: Model;
  scope?: (string | number)[];
}

export default class Form {
  private model: Model;
  // Скоуп формы - путь к полю модели которое будет обслуживать форма
  private scope: (string | number)[];
  // private observable: Subject<Event>;

  // static object(properties, value: {} = {}, scenarios?: string | string[], context?: {}) {
  //   return new Form({
  //     model: new Model({
  //       value,
  //       scenarios,
  //       context,
  //       type: new ObjectType({
  //         properties,
  //       }),
  //     }),
  //   });
  // }
  //
  // static array(items, value: {} = [], scenarios?: string | string[], context?: {}) {
  //   return new Form({
  //     model: new Model({
  //       value,
  //       scenarios,
  //       context,
  //       type: new ArrayType({
  //         items,
  //       }),
  //     }),
  //   });
  // }
  //
  // static value(type: AnyType, value: any, scenarios?: string | string[], context?: {}) {
  //   return new Form({
  //     model: new Model({
  //       type,
  //       value,
  //       scenarios,
  //       context,
  //     }),
  //   });
  // }

  constructor(config: FormConfig) {
    this.model = config.model;
    this.scope = config.scope || [];
  }

  getModel(): Model {
    return this.model;
  }

  getScope(): (string | number)[] {
    return this.scope;
  }

  protected normalizePath(path?: string | (string | number)[]): (string | number)[] {
    const pathArr = path ? (typeof path === 'string' ? [path] : path) : [];

    return [...this.scope, ...pathArr];
  }

  /**
   * Set value
   * model.set('value') => set model's value
   * model.set(foo, 'value') => set property value of the model's value
   * model.set(['foo', 'bar'], 'value') => set property value of the model's value
   * @param {[(string | number)] | string | any} path
   * @param value
   */
  set(path: string | (string|number)[] | any, value?: any) {
    // this.model.set.apply(this.model, arguments);
    if (arguments.length > 1) {
      this.model.set(this.normalizePath(path), value);
    } else {
      this.model.set(this.scope, path);
    }
  }

  /**
   * Get value
   * model.get() => get model's value
   * model.get('foo') => get property value of the model's value
   * model.get(['foo', 'bar']) => get property value of the model's value
   * @param {[(string | number)] | string} path
   * @returns {any}
   */
  get(path?: string | (string|number)[]) {
    // return this.model.get.apply(this.model, arguments);
    if (arguments.length > 1) {
      return this.model.get(this.normalizePath(path));
    }

    return this.model.get(this.scope);
  }

  // /**
  //  * Dispatch event
  //  * @param event
  //  */
  // dispatch(event: any) {
  //   this.observable.next(event);
  // }
  //
  // /**
  //  * Get Observable
  //  * @returns {Subject<any>}
  //  */
  // getObservable() {
  //   return this.observable;
  // }

  getValidationState(path?: string | (string | number)[]): State | undefined {
    if (arguments.length > 1) {
      return this.model.getValidationState(this.normalizePath(path));
    }

    return this.model.getValidationState(this.scope);
  }

  getFirstError(): State | undefined {
    return _.values(this.model.getValidationStates(this.scope))
      .find((state) => state instanceof ErrorState);
  }

  getErrors(): State[] {
    return _.values(this.model.getValidationStates(this.scope))
      .filter((state) => state instanceof ErrorState);
  }

  validate(): Promise<string | Message | void> {
    if (this.scope.length) {
      const formStates = this.model.getValidationStates(this.scope);
      const modelStates = this.model.getValidationStates();
      _.keys(formStates).forEach((k) => delete modelStates[k]);

      return this.model.validateAttribute(this.scope);
    }

    return this.model.validate();
  }

  validateAttribute(path: string | (string|number)[]): Promise<string | Message | void> {
    return this.model.validateAttribute(this.normalizePath(path));
  }

  validateAttributes(attributes: (string | (string|number)[])[])
  : Promise<(string | Message | void)[]> {
    return this.model.validateAttributes(attributes.map(this.normalizePath));
  }

  isChanged(path?: string | (string|number)[]) {
    return !_.isEqual(
      this.model.get(this.normalizePath(path)),
      this.model.getInitial(this.normalizePath(path)),
    );
  }

  isDirty(path?: string | (string|number)[]) {
    return !!_.values(this.model.getValidationStates(this.normalizePath(path))).length;
  }

  isValid(path?: string | (string|number)[]) {
    return !_.values(this.model.getValidationStates(this.normalizePath(path)))
      .find((state) => state instanceof ErrorState);
  }

  isPending(path?: string | (string|number)[]) {
    return !!_.values(this.model.getValidationStates(this.normalizePath(path)))
      .find((state) => state instanceof PendingState);
  }

  isRequired(path?: string | (string|number)[]) {
    const validator = this.model.getValidator(this.normalizePath(path));

    return validator ? (validator as Validator).isValidator(PresenceValidator) : false;
  }
}
