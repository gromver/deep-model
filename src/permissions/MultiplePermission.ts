import ValueContext from '../ValueContext';

export default (permissions: [(context: ValueContext) => boolean])
  : (context: ValueContext) => boolean => {
  return (context: ValueContext): boolean => {
    return !permissions.some(
      (permission: (context: ValueContext) => boolean) => {
        return !permission(context);
      },
    );
  };
};
