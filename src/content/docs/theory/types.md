---
title: TS支持哪些类型
description: 介绍typescript类型系统自持哪些类型和类型运算.
lang: zh-CN
---

我们知道，JavaScript是一种动态类型语言，它的变量类型是在运行时确定的，而TypeScript是一种静态类型语言，它的变量类型是在编译时确定的。
TypeScript的类型系统是JavaScript类型系统的超集，它支持JavaScript中的所有类型，并且还提供了一些新的类型，比如元组、枚举、任意类型、void类型、never类型等。
并且TypeScript还支持类型运算，比如联合类型、交叉类型、类型别名等。那么，TypeScript支持哪些类型呢？它的类型系统是如何设计的呢？本文将详细介绍TypeScript的类型系统。

## 类型系统

静态类型系统的目的把类型检查从运行时提前到编译时，这样可以在编译时就发现类型错误，而不是在运行时才发现。这样可以提高代码的健壮性，减少不必要的运行时错误。那ts类型系统中肯定要把js中的类型都包含进来，
也就是number、string、boolean、null、undefined、symbol、object、等,还有他们的包装类型Number、Boolean、String、Object、Symbol等。

这些很容易理解，给js添加静态类型，没有必要重新造一套基础类型吧，直接服用js的基础类型就行。复合类型方面，js有class,array，这些typescript类型系统都是支持的，typescript又多家了三种类型：Tuple(元组)、
Interface(接口)、Enum(枚举).

## 元组

元组就是元素数量和类型都是固定的数组，比如`[string,number]`就是一个元组类型，它的第一个元素是string类型，第二个元素是number类型。元组的元素可以是不同的类型，比如`[string,number]`和`[number,string]`是不同的类型。

```ts
type Tuple = [string,number];
```

## 接口

接口可以描述函数、对象、构造器的结构.接口是一种类型，它是对其他类型的一个抽象，它只定义了这些类型应该有的成员，而没有提供具体的实现。接口可以继承其他接口，这和类的继承是一样的。

对象：
```ts
interface IPerson {
    name: string;
    age: number;
}

class Person implements IPerson {
    name: string;
    age: number;
    constructor(name: string, age: number) {
        this.name = name;
        this.age = age;
    }
}

interface IStudent extends IPerson {
    grade: number;
}

class Student extends Person implements IStudent {
    grade: number;
    constructor(name: string, age: number, grade: number) {
        super(name, age);
        this.grade = grade;
    }
}

const obj: IStudent = {
    name: 'Tom',
    age: 18,
    grade: 3
}
```

函数：
```ts
interface IFunc {
    (a: number, b: number): number;
}

const add: IFunc = (a, b) => a + b;
```

构造器：
```ts
interface PersonConstructor {
    new (name: string, age: number): IPerson;
}

function createPerson(ctor: PersonConstructor, name: string, age: number): IPerson {
    return new ctor(name, age);
}

```
对象类型、class 类型在 TypeScript 里也叫做索引类型，也就是索引了多个元素的类型的意思。对象可以动态添加属性，如果不知道会有什么属性，可以用可索引签名：

```ts
interface IObj {
    [key: string]: string;
}

const obj: IObj = {
    name: 'Tom',
    age: '18'
}
obj.grade = 100;
```
总之，**接口可以用来描述函数、构造器、索引类型（对象、class、数组）等复合类型**。


## 枚举

`枚举(Enum)`是一系列值的复合：
  
  ```ts
  enum Color {
      Red,
      Green,
      Blue
  }

  const color: Color = Color.Red;
  ```

枚举的值可以是数字或字符串，如果没有给枚举成员赋值，那么它的值就是它的索引。枚举的值是只读的，不能修改。

```ts
enum Color {
    Red,
    Green,
    Blue
}

Color.Red = 1; // error
```

## 字面量类型

TypeScript 还支持字面量类型，也就是类似 1111、'aaaa'、\{ a: 1\} 这种值也可以做为类型。

其中，字符串的字面量类型有两种，一种是普通的字符串字面量，比如 'aaa'，另一种是模版字面量，比如 aaa${string}，它的意思是以 aaa 开头，后面是任意 string 的字符串字面量类型。

所以想要约束以某个字符串开头的字符串字面量类型时可以这样写:

比如以 `#`号开始

```ts
function func(str: `#${string}`){

}

func("#abc")
```


## 特殊类型 void 、never、any、unknown

- never 代表不可达，比如函数抛出异常的时候，返回值就是never
- void 表示空，可以是undefined或 never
- any 表示任意类型，任何类型都可以赋值给它，它也可以赋值给任何类型（除了never）
- unknown 是未知类型，任何类型都可以赋值给它，但是它不可以赋值给别的类型。

这些就是 TypeScript 类型系统中的全部类型了，大部分是从 JS 中迁移过来的，比如基础类型、Array、class 等，也添加了一些类型，比如 枚举（enum）、接口（interface）、元组等，还支持了字面量类型和 void、never、any、unknown 的特殊类型。

## 类型的装饰

除了描述类型的结构外，typescript的类型系统还支持描述类型的属性，比如是否可选，是否只读等：

```ts
interface IPerson{
  readonly name: string
  age?: number
}

type tuple = [string,number?]

```

## typescript 类型系统中的类型运算

我们知道了 TypeScript 类型系统里有哪些类型，那么可以对这些类型做什么类型运算呢？

### 条件 extends ? :

typescript 里的条件判断是 `extends ? :`叫做条件类型(Condition Type) 比如：

```ts
type res = 1 extends 2 ? true : false;
// type res = false
```

这就是typescript 类型系统里的if else.

但是，上面这样的逻辑没啥意义，静态的值自己就能算出结果来，为什么要用代码去判断呢？

所以，类型运算逻辑都是用来做一些动态的类型的运算的，也就是对类型参数的运算。

```ts
type isTwo<T> = T extends 2 ? true : false

type res = isTwo<1> // false
type res2 = isTwo<2> // true

```

这种类型也叫做`高级类型`

**高级类型的特点是传入类型参数，经过一系列类型运算逻辑后，返回新的类型。**

### 推导： infer

如何提取类型的一部分呢？答案是 infer。
比如提取元组类型的第一个元素：

```ts
type First<Tuple extends unknown[]> = Tuple extends [infer T,...infer R] ? T : never;

type res = First<[1,2,3]>;

```
注意，第一个 extends 不是条件，条件类型是 extends ? :，这里的 extends 是约束的意思，也就是约束类型参数只能是数组类型。
因为不知道数组元素的具体类型，所以用 unknown。

### 联合： ｜

联合类型（Union）类似 js 里的或运算符 |，但是作用于类型，代表类型可以是几个类型之一。

```ts
type Union = 1 | 2 | 3;
```

### 交叉： &

交叉类型（Intersection）类似 js 中的与运算符 &，但是作用于类型，代表对类型做合并。

```ts
type ObjType = {a: number } & {c: boolean};
```

注意，同一类型可以合并，不同的类型没法合并，会被舍弃：

```ts
type res = 'aaa' & 222 // never
```

### 映射类型

对象、class 在typescript对婷的类型是索引类型(index Type),那么如何对索引类型作修改呢？

答案是 `映射类型`。

```ts
type MapType<T> = {
  [Key in keyof T]?:T[Key]
}
```

keyof T 是查询索引类型中所有的索引，叫做`索引查询`。
T[Key] 是取索引类型某个索引的值，叫做`索引访问`
in 是用于遍历联合类型的运算符。

