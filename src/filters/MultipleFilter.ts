export default (filters: [(value: any) => any]): (value: any) => any => {
  return (value: any): any => {
    return filters.reduce(
      (value: any, filter: (value: any) => any) => {
        return filter(value);
      },
      value,
    );
  };
};
