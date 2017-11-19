import ValueContext from '../ValueContext';

export default (scenarios: string[]): (valueContext: ValueContext) => void => {
  return (valueContext: ValueContext): void => {
    const a = scenarios;
    const b = valueContext.model.getScenarios();

    if (a.find((i) => b.indexOf(i) !== -1)) {
      throw new Error('ExceptScenarios - you have no access.');
    }
  };
};


