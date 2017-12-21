import Model from './Model';
import Validator from './validators/Validator';
import PresenceValidator from './validators/PresenceValidator';
import State from './validators/states/State';
import ErrorState from './validators/states/ErrorState';
import PendingState from './validators/states/PendingState';
import Message from './validators/utils/Message';

const _ = {
  keys: require('lodash/keys'),
  values: require('lodash/values'),
  isEqual: require('lodash/isEqual'),
};

export interface FormConfig {
  model: Model;
  scope?: (string | number)[];
}

export default class Form {
  private model: Model;
  // Скоуп формы - путь к полю модели которое будет обслуживать форма
  private scope: (string | number)[];

  constructor(config: FormConfig) {
    this.model = config.model;
    this.scope = config.scope || [];

    this.normalizePath = this.normalizePath.bind(this);
  }

  getModel(): Model {
    return this.model;
  }

  getScope(): (string | number)[] {
    return this.scope;
  }

  normalizePath(path?: string | (string | number)[]): (string | number)[] {
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
    if (arguments.length > 0) {
      return this.model.get(this.normalizePath(path));
    }

    return this.model.get(this.scope);
  }

  getValidationState(path?: string | (string | number)[]): State | undefined {
    if (arguments.length > 0) {
      return this.model.getValidationState(this.normalizePath(path));
    }

    return this.model.getValidationState(this.scope);
  }

  getValidationStatus(path?: string | (string | number)[]): string | undefined {
    const state = arguments.length > 0
      ? this.getValidationState(path)
      : this.getValidationState();

    return state && state.getStatus();
  }

  getFirstError(): State | undefined {
    return _.values(this.model.getValidationStates(this.scope))
      .find((state) => state instanceof ErrorState);
  }

  getErrors(): State[] {
    return _.values(this.model.getValidationStates(this.scope))
      .filter((state) => state instanceof ErrorState);
  }
  // todo catch all errors and return true/false
  validate(): Promise<boolean> {
    if (this.scope.length) {
      const formStates = this.model.getValidationStates(this.scope);
      const modelStates = this.model.getValidationStates();
      _.keys(formStates).forEach((k) => delete modelStates[k]);

      return this.model.validateAttribute(this.scope).then(() => true).catch(() => false);
    }

    return this.model.validate()
      .then(() => true)
      .catch(() => false);
  }

  validateAttribute(path: string | (string|number)[]): Promise<boolean> {
    return this.model.validateAttribute(this.normalizePath(path))
      .then(() => true)
      .catch(() => false);
  }

  validateAttributes(attributes: (string | (string|number)[])[])
  : Promise<boolean> {
    return this.model.validateAttributes(attributes.map(this.normalizePath))
      .then(() => true)
      .catch(() => false);
  }

  isChanged(path?: string | (string|number)[]): boolean {
    return !_.isEqual(
      this.model.get(this.normalizePath(path)),
      this.model.getInitial(this.normalizePath(path)),
    );
  }

  isDirty(path?: string | (string|number)[]): boolean {
    return !!_.values(this.model.getValidationStates(this.normalizePath(path))).length;
  }

  isValid(path?: string | (string|number)[]): boolean {
    return !_.values(this.model.getValidationStates(this.normalizePath(path)))
      .find((state) => state instanceof ErrorState);
  }

  isPending(path?: string | (string|number)[]): boolean {
    return !!_.values(this.model.getValidationStates(this.normalizePath(path)))
      .find((state) => state instanceof PendingState);
  }

  isRequired(path?: string | (string|number)[]): boolean {
    const validator = this.model.getValidator(this.normalizePath(path));

    return validator ? (validator as Validator).isValidator(PresenceValidator) : false;
  }

  isSafe(path?: string | (string|number)[]): boolean {
    return this.model.canSet(this.normalizePath(path), undefined);
  }
}
