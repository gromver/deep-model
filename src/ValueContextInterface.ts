import Model from './Model';

export default interface ModelContextInterface {
  model: Model;
  path: (string|number)[];
  attribute: string|number;
  value: any;
}
