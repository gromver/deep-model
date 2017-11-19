export default (defaultValue: any): (value: any) => any => {
  return (value: any): any => {
    return value === undefined ? defaultValue : value;
  };
};
