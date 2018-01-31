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

// для поля 'someField' схема не определена, установить значение не получиться
model.set('someField', 'value');  // throws 'ObjectType:setCheck - unknown attribute "someField"' exception
```

### Общие настройки типов
Все типы данных наследуются от типа AnyType и обладают общими своиствами:
- `permission` - определение права на запись данных
- `filter` - фильтрация и изменение данных
- `validator` - валидация данных

#### `model.set(attribute?, value)` - установка значения
Установка значения проходит в несколько этапов:
1. `canSet` - поиск аттрибута в схеме, если для аттрибута тип не описан - выбрасывается исключение
2. `typeCheck` - сверка типа значения с типом аттрибута, если не совпадает - выбрасывается исключение
3. `permissionCheck` - проверка права на запись (опциональна), если не проходит - выбрасывается исключение 
4. `filter` - изменение значения перед записью (опционально)

#### `permission` - определение права на запись данных
Можно управлять доступом на запись аттрибута, запрещая запись при определенных условиях, сценариях
работы с данными, а так же "отключать" определенные правила в составных типах данных (anyOf, oneOf, allOf)
```jsx harmony
import { Model, types } from 'rx-form';

const model = new Model({
  type: types.object({
    greaterThan5: types.number({
      // permission - это функция (массив функций), принимающая ValueContext и возвращающая
      // false, либо выбрасывающая исключение в случае отказа в доступе
      permission: ({ value }) => value > 5,
    }),
    lessThan10: types.number({
      permission: ({ value }) => {
        if (value >= 10) {
          // 
          throw new Error('The set value must be less than 10')
        }
      },
    }),
    greaterThan5AndLessThan10: types.number({
      permission: [
        ({ value }) => value > 5,
        ({ value }) => value < 10,
      ],
    }),
  }),
});

model.set({
  greaterThan5: 6,
  lessThan10: 9,
  greaterThan5AndLessThan10: 20,
});

console.log(model.get()); // { greaterThan5: 6, lessThan10: 9 }

model.set('greaterThan5AndLessThan10', 7);
console.log(model.get()); // { greaterThan5: 6, lessThan10: 9, greaterThan5AndLessThan10: 7 }

try {
  model.set('greaterThan5', 0);
} catch(e) {
  console.log(e);   // 
}

try {
  model.set('lessThan10', 20);
} catch(e) {
  console.log(e);   // 'The set value must be less than 10'
}
```

#### `filter` - фильтрация и изменение данных
В некоторых случаях полезно перед установкой значения обработать и нормализовать его:
```jsx harmony
import { Model, types } from 'rx-form';

const model = new Model({
  type: types.object({
    integer: types.number({
      // filter - это функция (массив функций), принимающая записываемое значение и возвращающая
      // модифицированное значение
      filter: (value) => Math.ceil(value),
    }),
    email: types.string({
      filter: [
        (value) => value.trim(),
        (value) => value.toLowerCase(),
      ],
    }),
  }),
});

model.set({
  integer: 5.8,
  email: '  JOHN@SomeMail.com  ',
});

console.log(model.get()); // { integer: 6, email: 'john@somemail.com' }
```

#### `validator` - валидация данных
```jsx harmony
import { Model, types, validators } from 'rx-form';

const model = new Model({
  type: types.object({
    age: types.number({
      // объект валидатор класса Validator
      validator: validators.number({
        greaterThanOrEqualTo: 16,
      }),
    }),
    password: types.string({
      // функция валидатор вида (context: ValueContext) => Promise<void | string | Message>
      validator: ({ value }) => {
        if (value.length < 3) {
          return Promise.reject('Password must be greater than 3 characters');
        }

        return Promise.resolve();
      },
    }),
    email: types.string({
      // массив объектов/функций валидаторов
      validator: [
        validators.presence(),
        validators.email(),
        ({ value }) => {
          if (value === 'registeredUser@mail.com') {
            return Promise.reject(`Email ${value} is already registered in the system.`);
          }
          
          return Promise.resolve();
        }, 
      ],
    }),
  }),
});

model.set({
  age: 16,
  password: 'asdfgh',
  email: 'john@mail.com',
});

model.validate().then(() => {
  console.log('OK!');
});
```

### Простые типы
Простые типы не поддерживают установку внутренних полей и записываются как есть
1. `AnyType`
2. `NumberType`
3. `StringType`
4. `BooleanType`

### Сложные типы
Сложные типы поддерживают установку внутренних полей
1. `ObjectType`
2. `ArrayType`

### Составные типы
Составные типы определяются списком внутренних типов.
1. `AnyOfType`
2. `OneOfType`
2. `AllOfType`
