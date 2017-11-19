import ValueContext from '../ValueContext';

export default (permissions: ((valueContext: ValueContext) => void)[])
  : (valueContext: ValueContext) => void => {
  return (valueContext: ValueContext): void => {
    permissions.forEach((permission: (context: ValueContext) => void) => permission(valueContext));
  };
};
