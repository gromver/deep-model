import * as _ from 'lodash';
import { Subject } from 'rxjs/Subject';
import SetContext from './SetContext';
import Event from './events/Event';
import SetValueEvent from './events/SetValueEvent';
import AnyType from './types/AnyType';
import ObjectType from './types/ObjectType';

export default class Model {
  static SCENARIO_DEFAULT = 'default';

  private model: ObjectType;
  private scenarios: string[];
  private attributes: {};
  private initialAttributes: {};
  private context: {};
  private observable: Subject<any>;

  constructor(attributes: {} = {}) {
    this.attributes = this.initialAttributes = attributes;
    this.model = new ObjectType({
      rules: this.getRules(),
    });
    this.handleEvents = this.handleEvents.bind(this);
    this.observable = new Subject();
    this.observable.subscribe(this.handleEvents);
    this.setScenario(Model.SCENARIO_DEFAULT);
    this.setContext({});
  }

  getRules(): { [key: string]: AnyType } {
    throw new Error('Model:getRules - this method must be extended.');
  }

  handleEvents(event: Event) {
    // console.log('EVENT', event);
    switch (event.type) {
      case 'setValue':
        _.set(this.attributes, (<SetValueEvent>event).path, (<SetValueEvent>event).value);
        break;

      default:
        return;
    }
  }

  dispatch(event: any) {
    this.observable.next(event);
  }

  /**
   * Set value
   * @param {[(string | number)] | string} path
   * @param value
   */
  set(path: (string|number)[] | string, value: any) {
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
  get(path: (string|number)[] | string) {
    const pathNormalized = typeof path === 'string' ? [path] : path;

    return path.length ? _.get(this.attributes, pathNormalized) : this.attributes;
  }

  /**
   * Get Observable
   * @returns {Subject<any>}
   */
  getObservable() {
    return this.observable;
  }

  setAttributes(attributes) {
    this.set([], attributes);
  }

  getAttributes() {
    return this.attributes;
  }

  setScenario(scenario) {

  }

  getScenario() {

  }

  setContext(context: {}) {
    this.context = context;
  }

  getContext() {

  }
}
