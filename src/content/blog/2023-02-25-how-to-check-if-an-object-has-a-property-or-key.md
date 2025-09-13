---
author: Jonathan Nenba
pubDatetime: 2023-02-25T02:35:18Z
modDatetime: 2023-02-25T02:35:18Z
title: 'How to check if an object has a property or key(Javascript).'
slug: how-to-check-if-an-object-has-a-property-or-key-javascript
featured: false
draft: false
tags:
  - javascript
  - object
  - property
  - key
description: Discover the different methods for checking whether an object has a specific property or key in JavaScript.
---

Hello everyone, today in this post I'm going to share with you some tips to check if a property exists in your javascript object, this also apply for the keys.

### hasOwnProperty

The `Object` data type in javascript allows you to store data structurally as a key/value.
`Object` have a certain number of properties that come from this data strcuture among which we `hasOwnProperty`, which is a method that indicates if an object has a specific property.

```javascript
const student = {
  firstName: 'Samy',
  lastName: 'Barba',
}
console.log(student.hasOwnProperty('firstName')); // true
console.log(student.hasOwnProperty('lastName')); // true
console.log(student.hasOwnProperty('age')); // false
```

The function returns a boolean(true/false), so if the property exists we get the value true, even if the property value null or undefined.

It is important to note that the function only checks the properties of our object, not the inherited ones. For example we know that the object has the method `toString`, so if we try to do:

```javascript
console.log(student.hasOwnProperty('toString')); // false
```

we will get false as a response, it does not correspond to a property proper to our object.

### in

one of the easiest ways to test the existence of a property is to use the in operator, its use is simple

```javascript
const student = {
  firstName: 'Samy',
  lastName: 'Barba',
}
console.log('firstName' in student); // true
console.log('age' in student); // false
```

I prefer this way because its syntax is short.

There is a big difference to note is that the `in` operator unlike the `hasOwnProperty` method allows to detect the own properties and also those inherited by the object.

```javascript
console.log('firstName' in student); // true
console.log('toString' in student); // true
```

### undefined check

Trying to access an object's property returns the value of this property, so what happens if it doesn't exist? In this case we get an undefined, so we can use this value to check if our object has the property or not.

```javascript
const student = {
  firstName: 'Samy',
  lastName: 'Barba',
}
console.log(student.firstName); // Samy
console.log(student.age); // undefined
```

In javascript the values `undefined` and `null` correspond to the value false in boolean.
one thing to keep in mind is that in case if the property exists and the value of this property is `undefined` we will get `undefined` but yet the object has the property, in most cases we use this method when we are sure that the property can not have as value `undefined`.

```javascript
const woman = {
  code: undefined,
}
console.log(woman.code); // undefined
```

### Reflect

Reflect is a built-in object that provides methods for interceptable JavaScript operations. The methods are the same as those of proxy handlers. Reflect is not a function object, so it's not constructible. [Reflect MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect)

class Reflection has a static `has` method which takes two arguments, the first one is the object and the second one is the property we want to check the existence of in our object. It return a boolean indicating whether or not the target has the property.

```javascript
const woman = {
  code: undefined,
}
console.log(Reflect.has(woman, 'code')); // true
console.log(Reflect.has(woman, 'power')); // false
```

In conclusion, we can say that there are mainly four ways to check the existence of a property or key: the `hasOwnProperty` method, the `in` operator, the undefined check by accessing the property and finally the `has` method of the `Reflect` class. Their use depends on the context of the different constraints. Which one did you like the most and which one you will use in your next code? Do you know any other way? If yes, share it with us in the comments section.

See you in a new post. Thanks
