import { Map, fromJS } from 'immutable';
import { Subject } from 'rxjs/Subject';
import ModelContext from './ModelContext';
import PrimitiveType from './types/PrimitiveType';
import Event from './events/Event';
import SetValueEvent from './events/SetValueEvent';

export default class Model {
  static SCENARIO_DEFAULT = 'default';

  private model: PrimitiveType;
  private scenarios: [string];
  private attributes: Map<string, any>;
  private initialAttributes: Map<string, any>;
  private context: {};
  private observable: Subject<any>;

  constructor(model: PrimitiveType, attributes: {} = {}) {
    this.attributes = this.initialAttributes = fromJS(attributes);
    this.model = model;
    this.handleEvents = this.handleEvents.bind(this);
    this.observable = new Subject();
    this.observable.subscribe(this.handleEvents);
    this.setScenario(Model.SCENARIO_DEFAULT);
    this.setContext({});
  }

  handleEvents(event: Event) {
    // console.log('EVENT', event);
    switch (event.type) {
      case 'setValue':
        this.attributes.setIn((<SetValueEvent>event).path, (<SetValueEvent>event).value);
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

    this.model.set(new ModelContext(this, pathNormalized), value);
  }

  /**
   * Get value
   * @param {[(string | number)] | string} path
   * @returns {any}
   */
  get(path: (string|number)[] | string) {
    const pathNormalized = typeof path === 'string' ? [path] : path;

    return this.attributes.getIn(pathNormalized);
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
    return this.attributes.toJS();
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
