# rx-form

Библиотека для создания валидируемых моделей и форм на базе js~~on~~ схем.

## Установка
```
npm install rx-form --save
```

## Обзор
Rx-form позоляет описывать модели данных любой сложности и вложенности.
Используя модель можно фильтровать и валидировать данные, приходящие в бэкенд, а 
также создавать формы и с их помощью строить пользовательские интерфейсы на
стороне клиента.

## Применение
Обработка и проверка данных при регистрации пользователя
```jsx harmony
import { Model, types, validators } from 'rx-form';

const model = Model.object({
  username: types.string({
    filter: (value) => value.trim(),
    validator: [
      validators.presence(),
      validators.string({
        minLength: 3,
      }),
    ],
  }),
  email: types.string({
    filter: [
      (value) => value.trim(),
      (value) => value.toLowerCase(),
    ],
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

// valid case
model.set({
  username: ' John  ',
  email: 'JOHN@SomeMail.com',
  password: '11aaAA',
  unknownProperty: 'abc',
});
model.validate().then(() => {
  console.log('OK!');
  console.log(model.get());
});
// OK!
// { 
//   username: 'John',
//   email: 'john@somemail.com',
//   password: '11aaAA'
// }


// invalid case
model.set({
  username: ' John  ',
  email: 'invalid email',
  password: '11aaAA',
});
model.validate().catch(() => {
  console.log('ERROR!');
  console.log(model.getFirstError().toString());
})
// ERROR!
// email - is not a valid email
```

## License
**rx-form** is released under the MIT license.
See the [LICENSE file] for license text and copyright information.

[LICENSE file]: https://github.com/gromver/rx-form/blob/master/LICENSE
