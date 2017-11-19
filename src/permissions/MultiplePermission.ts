import ValueContext from '../ValueContext';

// export default (permissions: [(context: ValueContext) => boolean])
//   : (context: ValueContext) => boolean => {
//   return (context: ValueContext): boolean => {
//     return !permissions.some(
//       (permission: (context: ValueContext) => boolean) => {
//         return !permission(context);
//       },
//     );
//   };
// };

export default (permissions: ((valueContext: ValueContext) => void)[])
  : (valueContext: ValueContext) => void => {
  return (valueContext: ValueContext): void => {
    permissions.forEach((permission: (context: ValueContext) => void) => permission(valueContext));
  };
};

