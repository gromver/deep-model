# Типы данных

Типы данных служат для описания правил записи и валидации данных. Можно описать простые (any,
string, number, boolean), сложные (array, object) и составные (anyOf, oneOf, allOf) типы данных.
```jsx harmony
import { Model, types } from 'rx-form';

// простые типы
const string = types.string();
const number = types.number();

// составные
// строка либо число
const stringOrNumber = types.anyOf({
  types: [
    types.number(),
    types.string(),
  ],
});

// сложные
// массив чисел либо строк
const array = types.array({
  items: stringOrNumber,
});
// объект
const object = types.object({
  properties: {
    a: string,
    b: number,
    c: stringOrNumber,
    // ...
  }
});

// тип данных по своей сути представляет схему данных и используется моделью для работы с данными
// запись, обработка, валидация
const model = new Model({
  type: object,
});

model.set('a', 'some value');
model.set('b', 123);
model.set('c', ['foo', 1, 'bar']);

console.log(model.get()); // { a: 'some value', b: 123, c: ['foo', 1, 'bar'] }
```

### Жизненный цикл модели и типа данных
Основное АПИ которое предоставляет модель - это `set`, `get` и `validate`.

### Общие настройки типов
Все типы данных наследуются от типа AnyType и обладают общими своиствами:
- `permission` - определение права на запись данных
- `filter` - фильтрация и изменение данных
- `validator` - валидация данных

### `permission` - определение права на запись данных

