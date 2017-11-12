import ValueContext from '../ValueContext';

export default interface TypeConfigPrimitive {
  permission?: ((context: ValueContext) => boolean) | [(context: ValueContext) => boolean];
  validator?: [any];
  filter?: ((value: any) => any) | [(value: any) => any];
}
