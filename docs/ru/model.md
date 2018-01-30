# Model
Model - класс для работы с данными. Модель осуществляет 3 основных функции:
- `set(path?, value)` - установка значения
- `get(path?)` - получение значения
- `validate()` - валидация данных
Создание модели
```jsx harmony
import { Model, types } from 'rx-form';

const model = new Model({
  // обязательный параметр - тип данных описывающий схему модели данных
  type: types.any(),

  // при создании модели можно указать начальное значение
  // начальное значение устанавливается как есть, в не зависимости от схемы данных
  value: 'some initial value'
});

console.log(model.get());   // some initial value

model.set(123); // установим новое значение
console.log(model.get());   // 123
```
Для создания моделей основных типов данных (object, array, any) есть упрощенные методы

```jsx harmony
import { Model, types } from 'rx-form';

// Создание моделей для объектов
let objectModel = Model.object({
  foo: types.string()
}, { foo: 'bar' });
// аналогично
objectModel = new Model({
  type: types.object({
    properties: {
      foo: types.string()
    },
  }),
  value: { foo: 'bar' }
});

// Создание моделей для массивов
let arrayModel = Model.array(types.string(), ['foo', 'bar']);
// аналогично
arrayModel = new Model({
  type: types.array({
    items: types.string(),
  }),
  value: ['foo', 'bar']
});

// Создание моделей для любых типов даных, как правило примитивных (string, number, boolean и тд.)
let numberModel = Model.value(types.number(), 123);
// аналогично
numberModel = new Model({
  type: types.number(),
  value: 123
});
```

## Установка значения - set(path?, value)
`Model:set()` - имеет 2 формы записи
- `set(path: string | (string|number)[] | any, value?: any)` - установка значения `value` полю с 
адресом `path`, данная форма применима для сложных типов (`object`, `array`)
- `set(value?: any)` - установка значения `value` непосредственно модели, данная форма 
применима для любых типов и является эквивалентом записи `model.set([], 'some value')`

Процесс установки значений тесно взаимосвязан со схемой данных модели, схема определяет
какие значения и куда можно установить, если установить значение по несуществующему в схеме адресу, 
либо значение не будет удовлетворять условиям схемы (проверка типа данных / проверка на доступ к 
данным) - модель выкинет исключение сообщающее об этом.
```jsx harmony
import { Model, types } from 'rx-form';

// Модель с примитивным типом (string)
const stringModel = Model.value(types.string(), '');
stringModel.set('foo');
console.log(stringModel.get()); // foo
// тоже самое
stringModel.set([], 'bar');
console.log(stringModel.get()); // bar

// попробуем установить вложенное значение
try {
  stringModel.set('someNestedAttribute', 'bar');
} catch (e) {
  console.log(e); // throws 'Primitive types don't support nested value setting.' exception
}

// попробуем установить значение с типом "не строка"
try {
  stringModel.set(123);
} catch (e) {
  console.log(e); // throws 'StringType:typeCheck - the value must be a string' exception
}


// Создадим модель с объектным типом (object)
const objectModel = Model.object({
  foo: types.string(),
});
objectModel.set({
  foo: 'bar',
  someOtherField: 'abc',
});
console.log(objectModel.get()); // { foo: 'bar' } - отфильтрованны значения не входящие в схему
// тоже самое
objectModel.set([], {
  foo: 'bar',
  someOtherField: 'abc',
});
console.log(objectModel.get()); // { foo: 'bar' }

// попробуем установить вложенное значение
objectModel.set('foo', 'foo');
console.log(objectModel.get()); // { foo: 'foo' }

// попробуем установить вложенное значение, передав значение с не верным типом
try{
  objectModel.set('foo', 123);
} catch (e) {
  console.log(e); // throws 'StringType:typeCheck - the value must be a string' exception
}

// попробуем установить значение в поле не прописанное в схеме даннных
try{
  objectModel.set('someOtherField', 'foo');
} catch (e) {
  console.log(e); // throws 'ObjectType:setCheck - unknown attribute "someOtherField"' exception
}


// Создадим модель с типом массив (array)
const arrayModel = Model.array(types.string());
arrayModel.set(['foo', 'bar']);
console.log(arrayModel.get()); // ['foo', 'bar']

// изменим значение
arrayModel.set(0, 'bar');
console.log(arrayModel.get()); // ['bar', 'bar']
arrayModel.set(4, 'abc');
console.log(arrayModel.get()); // ['bar', 'bar', undefined, undefined, 'abc ]

// попробуем установить вложенное значение, передав значение с не верным типом
try{
  arrayModel.set(['foo', 123, 'abc']);
} catch (e) {
  console.log(e); // throws 'StringType:typeCheck - the value must be a string' exception
}
console.log(arrayModel.get()); // ['foo'] - запись прекращается на 1 невалидном значении
try{
  arrayModel.set(0, 123);
} catch (e) {
  console.log(e); // throws 'StringType:typeCheck - the value must be a string' exception
}
console.log(arrayModel.get()); // ['foo']

// индексы массивов должны иметь числовой тип
try{
  arrayModel.set('0', 'bar');
} catch (e) {
  console.log(e); // throws 'ArrayType:setCheck - nested attribute key must be a number' exception
}
console.log(arrayModel.get()); // ['foo']
```

## Получение значения - get(path?)
`Model:get()` - имеет 2 формы записи
- `get(path: string | (string|number)[] | any): any` - получение значения поля с 
адресом `path`, данная форма применима для сложных типов (`object`, `array`)
- `get(): any` - получение значения непосредственно модели, данная форма 
применима для любых типов и является эквивалентом записи `model.get([])`

Процесс получения значений не зависит от схемы данных модели, модель возвращает текущее значение 
либо `undefined` если значение не установлено.
```jsx harmony
import { Model, types } from 'rx-form';


// Создадим модель с примитивным типом (string)
const stringModel = Model.value(types.string(), '');
stringModel.set('foo');
console.log(stringModel.get()); // foo
// тоже самое
stringModel.set([], 'bar');
console.log(stringModel.get([])); // bar
// попробуем вложенное значение не поддерживаемое текущей схемой
console.log(stringModel.get(['foo'])); // undefined
console.log(stringModel.get(['foo', 'bar'])); // undefined


// Создадим модель с типом объект (object)
const objectModel = Model.object({
  foo: types.string(),
});
objectModel.set('foo', 'bar');
console.log(objectModel.get()); // { foo: 'bar' }
console.log(objectModel.get([])); // { foo: 'bar' }
console.log(objectModel.get('foo')); // 'bar'
console.log(objectModel.get(['foo'])); // 'bar'
// попробуем вложенное значение не поддерживаемое текущей схемой
console.log(objectModel.get(['abc'])); // undefined
console.log(objectModel.get(['abc', 123])); // undefined


// Создадим модель с типом массив (array)
const arrayModel = Model.array(types.string());
arrayModel.set(['foo', 'bar']);
console.log(arrayModel.get()); // ['foo', 'bar']
console.log(arrayModel.get([])); // ['foo', 'bar']
console.log(arrayModel.get(0)); // 'foo'
console.log(arrayModel.get([0])); // 'foo'
console.log(arrayModel.get('0')); // 'foo'
// попробуем вложенное значение не поддерживаемое текущей схемой
console.log(arrayModel.get('abc')); // undefined
console.log(arrayModel.get([0, 'foo'])); // undefined
```

## Валидация данных - validate*() методы
В API модели существует 3 метода для валидации данных:
- `validate(): Promise` - валидация всей модели
- `validateAttribute(path: string | (string|number)[]): Promise` - валидация поля модели
- `validateAttributes(attributes: (string | (string|number)[])[]): Promise` - валидация полей модели
Все 3 метода используется при валидации форм на клиенте, на стороне бекенда как правило 
применяется только метод `validate()`.
```jsx harmony
import { Model, types, validators } from 'rx-form';

// Модель регистрации пользователя
const model = Model.object({
  username: types.string({
    validator: [
      validators.presence(),
      validators.string({
        minLength: 3,
      }),
    ],
  }),
  email: types.string({
    validator: [
      validators.presence(),
      validators.email(),
    ],
  }),
  password: types.string({
    validator: [
      validators.presence(),
      validators.string({
        pattern: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s).*$/,
      }),
    ],
  }),
});

async function run() {
  // установим валидные данные
  model.set({
    username: 'John',
    email: 'john@somemail.com',
    password: '11aaAA',
  });

  await model.validate().then(() => {
    // модель валидна
    console.log(model.getFirstError()); // undefined
  });

  // очистим поле username
  model.set('username', '');
  await model.validate().catch(() => {
    // модель не валидна
    console.log(model.getFirstError().toString()); // username - can't be blank
  });

  // введем имя длинной менее 3 букв
  model.set('username', 'Jo');
  await model.validate().catch(() => {
    // модель не валидна
    console.log(model.getFirstError().toString()); // username - is too short (minimum is 3 characters)
  });

  // введем не валидный емеил
  model.set('email', 'invalid email');
  await model.validate().catch(() => {
    // модель не валидна
    // первая ошибка по прежнему на поле username
    console.log(model.getFirstError().toString()); // username - is too short (minimum is 3 characters)
    // статус проверки для поля email
    console.log(model.getValidationState('email').toString()); // email - is not a valid email
    console.log(model.getValidationState('email').getStatus()); // error
    // статус поля password валиден
    console.log(model.getValidationState('password').toString()); // ''
    console.log(model.getValidationState('password').getStatus()); // success
  });

  // введем валидный емеил
  model.set('email', 'valid@email.com');
  // проверим поле email
  await model.validateAttribute('email').then(() => {
    // поле валидно
    // статус проверки для поля email
    console.log(model.getValidationState('email').toString()); // ''
    console.log(model.getValidationState('email').getStatus()); // success
  });

  // введем валидное имя и неправильный пароль
  model.set('username', 'John');
  // проверим поля username и password
  model.set('password', '123');
  await model.validateAttributes(['username', 'password']).catch(() => {
    // есть не валидные поля
    // статус проверки для поля username
    console.log(model.getValidationState('username').toString()); // ''
    console.log(model.getValidationState('username').getStatus()); // success
    // статус проверки для поля username
    console.log(model.getValidationState('password').toString()); // 'password - is invalid'
    console.log(model.getValidationState('password').getStatus()); // error
  });
}

run();
```

## Model API
