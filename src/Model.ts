import { Subject } from 'rxjs/Subject';
import SetContext from './SetContext';
import Event from './events/Event';
import SetValueEvent from './events/SetValueEvent';
import ValidationStateEvent from './events/ValidationStateEvent';
import AnyType from './types/AnyType';
import ObjectType from './types/ObjectType';
import ArrayType from './types/ArrayType';
import Validator from './validators/interfaces/ValidateInterface';
import State from './validators/states/State';
import ErrorState from './validators/states/ErrorState';
import PristineState from './validators/states/PristineState';
import Message from './validators/utils/Message';

const _ = {
  cloneDeep: require('lodash/cloneDeep'),
  values: require('lodash/values'),
  entries: require('lodash/entries'),
  isEqual: require('lodash/isEqual'),
  get: require('lodash/get'),
  set: require('lodash/set'),
};

export interface ModelConfig {
  value: any;
  type: AnyType;
  context?: {};
  scenarios?: string | string[];
}

export default class Model {
  static SCENARIO_DEFAULT = 'default';

  private type: AnyType;
  private context: {};
  private scenarios: string[];
  private value: any;
  private initialValue: any;
  private states: { [key: string]: State };
  private observable: Subject<Event>;

  static object(properties, value: {} = {}, scenarios?: string | string[], context?: {}) {
    return new Model({
      value,
      scenarios,
      context,
      type: new ObjectType({
        properties,
      }),
    });
  }

  static array(items, value: {} = [], scenarios?: string | string[], context?: {}) {
    return new Model({
      value,
      scenarios,
      context,
      type: new ArrayType({
        items,
      }),
    });
  }

  static value(type: AnyType, value: any, scenarios?: string | string[], context?: {}) {
    return new Model({
      type,
      value,
      scenarios,
      context,
    });
  }

  constructor(config: ModelConfig) {
    /**
     * Начальное значение сохраняем как есть, возможно есть смысл пропускать значение через
     * механизм установки (set) значения с применением к значению прав доступа и фильтров
     */
    this.initialValue = _.cloneDeep(config.value);
    this.value = _.cloneDeep(config.value);
    this.type = config.type;
    this.states = {};
    this.observable = new Subject();
    this.setScenarios(config.scenarios || Model.SCENARIO_DEFAULT);
    this.setContext(config.context || {});

    // check if we have valid initial value type
    if (!this.canApply(this.value)) {
      throw new Error('You should specify proper initial value');
    }
  }

  /**
   * Set value and emit the SetValueEvent
   * @param {(string | number)[]} path
   * @param value
   */
  setValue(path: (string | number)[], value: any) {
    if (path.length) {
      _.set(this.value, path, value);
    } else {
      this.value = value;
    }

    this.setValidationState(path, new PristineState());

    this.dispatch(new SetValueEvent(path, value));
  }

  /**
   * Set the validation state along the supplied path
   * @param {(string | number)[]} path
   * @param {State} state
   */
  setValidationState(path: (string | number)[], state: State) {
    const key = JSON.stringify(path);
    const curState = this.states[key];

    if (curState && curState.getVersion() > state.getVersion()) {
      return;
    }

    state.setPath(path);
    this.states[key] = state;

    this.dispatch(new ValidationStateEvent(path, state));
  }

  /**
   * Get the validation state along the supplied path
   * @param {string | (string | number)[]} path
   * @returns {State}
   */
  getValidationState(path: string | (string | number)[]): State | undefined {
    const pathNormalized = typeof path === 'string' ? [path] : path;

    return this.states[JSON.stringify(pathNormalized)];
  }

  getValidationStates(path?: string | (string | number)[]): { [key: string]: State } {
    if (path) {
      const pathNormalized = typeof path === 'string' ? [path] : path;
      const pattern = JSON.stringify(pathNormalized).slice(0, -1);
      const states = {};

      _.entries(this.states).forEach(([k, v]) => {
        if (k.indexOf(pattern) === 0) {
          states[k] = v;
        }
      });

      return states;
    }

    return this.states;
  }

    /**
   * Dispatch event
   * @param event
   */
  dispatch(event: any) {
    this.observable.next(event);
  }

  /**
   * Get Observable
   * @returns {Subject<any>}
   */
  getObservable() {
    return this.observable;
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
    let pathNormalized;
    let valueNormalized;

    if (arguments.length > 1) {
      pathNormalized = typeof path === 'string' ? [path] : path;
      valueNormalized = value;
    } else {
      pathNormalized = [];
      valueNormalized = path;
    }

    if (pathNormalized.length) {
      this.type.set(new SetContext({
        model: this,
        path: pathNormalized,
        value: valueNormalized,
      }));
    } else {
      this.type.apply(new SetContext({
        model: this,
        path: pathNormalized,
        value: valueNormalized,
      }));
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
    if (path) {
      const pathNormalized = typeof path === 'string' ? [path] : path;

      return path.length ? _.get(this.value, pathNormalized) : this.value;
    }

    return this.value;
  }

  getInitial(path?: string | (string|number)[]) {
    if (path) {
      const pathNormalized = typeof path === 'string' ? [path] : path;

      return path.length ? _.get(this.initialValue, pathNormalized) : this.initialValue;
    }

    return this.initialValue;
  }

  isChanged() {
    return !_.isEqual(this.value, this.initialValue);
  }

  /**
   * Can the model set the stored value to the given path
   * @param {string | (string|number)[]} path
   * @param value
   * @returns {boolean}
   */
  canSet(path: string | (string|number)[] | any, value?: any): boolean {
    let pathNormalized;
    let valueNormalized;

    if (arguments.length > 1) {
      pathNormalized = typeof path === 'string' ? [path] : path;
      valueNormalized = value;
    } else {
      pathNormalized = [];
      valueNormalized = path;
    }

    if (pathNormalized.length) {
      return this.type.canSet(new SetContext({
        value: valueNormalized,
        model: this,
        path: pathNormalized,
      }));
    } else {
      return this.type.canApply(new SetContext({
        value: valueNormalized,
        model: this,
        path: pathNormalized,
      }));
    }
  }

  /**
   * Can the model apply the given value
   * @param value
   * @returns {boolean}
   */
  canApply(value: any): boolean {
    return this.type.canApply(new SetContext({
      value,
      model: this,
      path: [],
    }));
  }

  getType(path: string | (string|number)[]): AnyType | void {
    const pathNormalized = typeof path === 'string' ? [path] : path;

    return path.length
      ? this.type.getType(new SetContext({
        model: this,
        path: pathNormalized,
      }))
      : this.type;
  }

  /**
   * Context
   */

  /**
   * Set context
   * @param {{}} context
   */
  setContext(context: {}) {
    this.context = context;
  }

  /**
   * Get context
   * @returns {{}}
   */
  getContext() {
    return this.context;
  }

  /**
   * scenarios
   */

  /**
   * Set scenarios
   * @param {string | string[]} scenario
   */
  setScenarios(scenario: string | string[]) {
    this.scenarios = typeof scenario === 'string' ? [scenario] : scenario;
  }

  /**
   * Get scenarios
   * @returns {string[]}
   */
  getScenarios(): string[] {
    return this.scenarios;
  }

  /**
   * Add scenarios
   * @param {string | string[]} scenario
   */
  addScenarios(scenario: string | string[]) {
    const newSc = typeof scenario === 'string' ? [scenario] : scenario;
    const curSc = this.scenarios;

    newSc.forEach((sc) => curSc.indexOf(sc) === -1 && curSc.push(sc));
  }

  /**
   * Remove scenarios
   * @param {string | string[]} scenario
   */
  removeScenarios(scenario: string | string[]) {
    const remSc = typeof scenario === 'string' ? [scenario] : scenario;

    this.scenarios = this.scenarios.filter((sc) => remSc.indexOf(sc) === -1);
  }

  /**
   * Is type has given scenario?
   * @param {string} scenario
   * @returns {boolean}
   */
  isScenario(scenario: string) {
    return this.scenarios.indexOf(scenario) !== -1;
  }

  /**
   * Validation
   */

  validate(): Promise<string | Message | void> {
    this.states = {};

    return this.type.validate(new SetContext({
      model: this,
      path: [],
    }));
  }

  validateAttribute(path: string | (string|number)[]): Promise<string | Message | void> {
    const pathNormalized = typeof path === 'string' ? [path] : path;
    const type = this.getType(pathNormalized);

    // return type ? type.validate(new SetContext({
    //   model: this,
    //   path: pathNormalized,
    //   cursor: pathNormalized.length - 1,
    // })) : Promise.reject('Validator not found.');
    return type ? type.validate(new SetContext({
      model: this,
      path: pathNormalized,
      cursor: pathNormalized.length - 1,
    })) : Promise.resolve();
    // return type ? type.validate(new SetContext({
    //   model: this,
    //   path: pathNormalized,
    //   cursor: pathNormalized.length - 1,
    // })) : new AnyType().validate(new SetContext({
    //   model: this,
    //   path: pathNormalized,
    //   cursor: pathNormalized.length - 1,
    // }));
  }

  validateAttributes(attributes: (string | (string|number)[])[])
  : Promise<(string | Message | void)[]> {
    const jobs: Promise<any>[] = [];

    attributes.forEach((path) => {
      const pathNormalized: (string|number)[] = typeof path === 'string' ? [path] : path;
      const type = this.getType(pathNormalized);

      if (type) {
        jobs.push(type.validate(new SetContext({
          model: this,
          path: pathNormalized,
          cursor: pathNormalized.length - 1,
        })));
      }/* else {
        jobs.push(new AnyType().validate(new SetContext({
          model: this,
          path: pathNormalized,
          cursor: pathNormalized.length - 1,
        })));
      } */
    });

    return Promise.all(jobs);
  }

  getValidator(path: string | (string|number)[]): Validator | void {
    const pathNormalized = typeof path === 'string' ? [path] : path;
    const type = this.getType(pathNormalized);

    return type && type.getValidator(new SetContext({
      model: this,
      path: pathNormalized,
      cursor: pathNormalized.length - 1,
    }));
  }

  getFirstError(): State | undefined {
    return _.values(this.states).find((state) => state instanceof ErrorState);
  }

  getErrors(): State[] {
    return _.values(this.states).filter((state) => state instanceof ErrorState);
  }
}
