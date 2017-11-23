import * as _ from 'lodash';
import { Subject } from 'rxjs/Subject';
import SetContext from './SetContext';
import Event from './events/Event';
import SetValueEvent from './events/SetValueEvent';
import ValidationStateEvent from './events/ValidationStateEvent';
import AnyType from './types/AnyType';
import ObjectType from './types/ObjectType';
import Validator from './validators/Validator';
import State from './validators/states/State';

export default class Model {
  static SCENARIO_DEFAULT = 'default';

  private model: ObjectType;
  private context: {};
  private scenarios: string[];
  private attributes: {};
  private initialAttributes: {};
  private states: { [key: string]: State };
  private observable: Subject<any>;

  constructor(attributes: {} = {}) {
    this.attributes = this.initialAttributes = attributes;
    this.model = new ObjectType({
      rules: this.getRules(),
    });
    this.states = {};
    // this.handleEvents = this.handleEvents.bind(this);
    this.observable = new Subject();
    // this.observable.subscribe(this.handleEvents);
    this.setScenarios(Model.SCENARIO_DEFAULT);
    this.setContext({});
  }

  /**
   * Get model rules config
   * Must be extended!
   * @returns {{[p: string]: AnyType | (AnyType | (() => AnyType))[] | (() => AnyType)}}
   */
  getRules(): { [key: string]: (AnyType | (AnyType | (() => AnyType))[] | (() => AnyType)) } {
    throw new Error('Model:getRules - this method must be extended.');
  }

  /**
   * Process incoming events
   * @param {Event} event
   */
  // handleEvents(event: Event) {
  //   // console.log('EVENT', event);
  //   switch (event.type) {
  //     case 'setValue':
  //       _.set(this.attributes, (<SetValueEvent>event).path, (<SetValueEvent>event).value);
  //       break;
  //
  //     default:
  //       return;
  //   }
  // }

  /**
   * Set value and emit the SetValueEvent
   * @param {(string | number)[]} path
   * @param value
   */
  setValue(path: (string | number)[], value: any) {
    _.set(this.attributes, path, value);

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
   * @param {[(string | number)] | string} path
   * @param value
   */
  set(path: string | (string|number)[], value: any) {
    const pathNormalized = typeof path === 'string' ? [path] : path;

    if (pathNormalized.length) {
      this.model.set(new SetContext({
        value,
        model: this,
        path: pathNormalized,
      }));
    } else {
      this.model.apply(new SetContext({
        value,
        model: this,
        path: pathNormalized,
      }));
    }
  }

  /**
   * Get value
   * @param {[(string | number)] | string} path
   * @returns {any}
   */
  get(path: string | (string|number)[]) {
    const pathNormalized = typeof path === 'string' ? [path] : path;

    return path.length ? _.get(this.attributes, pathNormalized) : this.attributes;
  }

  /**
   * Set attributes
   * @param attributes
   */
  setAttributes(attributes) {
    this.set([], attributes);
  }

  /**
   * Get attributes
   * @returns {{}}
   */
  getAttributes() {
    return this.attributes;
  }

  /**
   * Can model set a value to the given path
   * @param {string | (string|number)[]} path
   * @returns {boolean}
   */
  canSet(path: string | (string|number)[]): boolean {
    const pathNormalized = typeof path === 'string' ? [path] : path;

    if (pathNormalized.length) {
      return this.model.canSet(new SetContext({
        value: this.get(pathNormalized),
        model: this,
        path: pathNormalized,
      }));
    } else {
      return true;
    }
  }

  getType(path: string | (string|number)[]): AnyType | null {
    const pathNormalized = typeof path === 'string' ? [path] : path;

    return path.length
      ? this.model.getType(new SetContext({
        model: this,
        path: pathNormalized,
      }))
      : this.model;
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
   * Is model has given scenario?
   * @param {string} scenario
   * @returns {boolean}
   */
  isScenario(scenario: string) {
    return this.scenarios.indexOf(scenario) !== -1;
  }

  /**
   * Validation
   */

  validate() {
    this.states = {};
    // todo решить какой будет ответ
    return this.model.validate(new SetContext({
      model: this,
      path: [],
    }));
  }

  validateAttribute(path: string | (string|number)[]) {
    const pathNormalized = typeof path === 'string' ? [path] : path;
    const type = this.getType(pathNormalized);

    return type ? type.validate(new SetContext({
      model: this,
      path: pathNormalized,
    })) : Promise.reject('Validator not found.');
  }

  validateAttributes(attributes: (string | (string|number)[])[]) {
    const jobs: Promise<any>[] = [];

    attributes.forEach((path) => {
      const pathNormalized: (string|number)[] = typeof path === 'string' ? [path] : path;
      const type = this.getType(pathNormalized);

      if (type) {
        jobs.push(type.validate(new SetContext({
          model: this,
          path: pathNormalized,
        })));
      }

      return Promise.all(jobs);
    });
  }

  getValidator(path: string | (string|number)[]): Validator | null {
    const type = this.getType(path);

    return type && type.getValidator();
  }
}
