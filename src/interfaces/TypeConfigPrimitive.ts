import ValueContext from '../ValueContext';

export default interface TypeConfigPrimitive {
  permission?: ((context: ValueContext) => void) | [(context: ValueContext) => void];
  validator?: [any];
  filter?: ((value: any) => any) | [(value: any) => any];
}
