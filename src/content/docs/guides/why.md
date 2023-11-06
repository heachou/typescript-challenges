---
title: 为什么Typescript类型编程叫做类型体操
description: 简单类型系统、泛型、类型编程的类型系统
---

## 简单类型系统

变量、函数、类等都可以声明类型，编译器会基于声明的类型做类型检查，类型不匹配时会报错。

这是最基础的类型系统，能保证类型安全，但有些死板。

比如一个 add 函数既可以做整数加法、又可以做浮点数加法，却需要声明两个函数：


```c
int add(int a, int b) {
    return a + b;
}

double add(double a, double b) {
    return a + b;
}
```

因此，我们需要更灵活的类型系统。要是类型可以传参数就好了。传入 int 类型，返回 int 类型，传入 double 类型，返回 double 类型。

## 泛型

泛型是一种参数化的类型，可以用来抽象类型，使类型可以传参。泛型可以用在函数、类、接口等地方。泛型的英文是 generic，中文翻译为泛型、通用、普遍。
他可以表示为一个类型变量，比如 T、U、V 等，也可以是一个类型参数，比如 Array\<T\>、Promise\<T\> 等。

```ts
function add<T>(a: T, b: T): T {
    return a + b;
}
```

现在，我们可以用 add 函数来做整数加法、浮点数加法了：

```ts
add(1, 2); // 3
add(1.1, 2.2); // 3.3
```

声明的时候会把变化的类型用泛型表示，使用的时候再传入具体的类型。
但是如果我们需要返回一个对象的某个属性值的函数，就不行了：

```ts
function getPropValue<T>(obj: T, key): key对应的属性值类型 {
    return obj[key];
}
```
这时候就需要可编程的类型系统了。

## 类型编程的类型系统

类型编程的类型系统是一种可编程的类型系统，可以用来抽象类型，使类型可以传参，也可以用来做类型运算，使类型可以计算。
因此 **对传入的类型参数（泛型）做各种逻辑运算，产生新的类型，这就是类型编程**

```ts
function getPropValue<
    T extends object,
    Key extends keyof T
>(obj: T, key: Key): T[Key] {
    return obj[key];
}
```

这个类型 GetPropValue 接受两个类型参数，第一个参数是对象的类型，第二个参数是对象的属性名，返回值是对象的属性值的类型。

### 类型系统可以有多复杂？

类型逻辑是对类型参数的各种处理，可以实现很多强大的功能

比如实现这个parseQueryString的类型：

![ParseQueryString](/parseQueryString.awebp)

他可以对传入的字符串类型参数做解析，返回解析以后的结果。typescript的类型系统可以对泛型做各种逻辑运算，实现很多强大的功能。下面我们来实现这个类型。

```ts
type ParseParam<Param extends string> = Param extends `${infer Key}=${infer Value}`
    ? { [K in Key]: Value }
    : {};

type MergeValues<One,Other> = One extends Other 
  ? One  
  : Other extends unknown[] 
    ? [One,...Other] 
    : [One,Other];

type MergeParams<
    OneParam extends Record<string, any>,
    OtherParam extends Record<string, any>
> = {
  [Key in keyof OneParam | keyof OtherParam]: 
    Key extends keyof OneParam
        ? Key extends keyof OtherParam
            ? MergeValues<OneParam[Key], OtherParam[Key]>
            : OneParam[Key]
        : Key extends keyof OtherParam 
            ? OtherParam[Key] 
            : never
}
type ParseQueryString<Str extends string> = 
    Str extends `${infer Param}&${infer Rest}`
        ? MergeParams<ParseParam<Param>, ParseQueryString<Rest>>
        : ParseParam<Str>;
```
ps. 代码中的 infer 关键字是用来推断类型的，比如 infer Key，就是推断出 Key 的类型。

pps. 代码中的 ? 是条件类型，比如 `Param extends ${infer Key}=${infer Value} ? { [K in Key]: Value } : {}`，就是如果 Param 是 `${infer Key}=${infer Value}` 类型，就返回 `{ [K in Key]: Value }`，否则返回 `{}`。


TypeScript 的类型系统是图灵完备的，也就是能描述各种可计算逻辑。简单点来理解就是循环、条件等各种 JS 里面有的语法它都有，JS 能写的逻辑它都能写。
但是很多类型编程的逻辑写起来比较麻烦，因此被称之为类型体操。