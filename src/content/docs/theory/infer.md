---
title: 套路一：模式匹配做提取
description:  学习一些类型体操的套路，熟悉这些套路之后，各种类型体操逻辑就能够很顺畅的写出来。 首先，我们来学习类型体操的第一个套路：模式匹配做提取。
lang: zh-CN
---

TypeScript 类型编程的代码看起来比较复杂，但其实这些逻辑用 JS 大家都会写，之所以到了类型体操就不会了，那是因为还不熟悉一些套路。
所以，这节开始我们就来学习一些类型体操的套路，熟悉这些套路之后，各种类型体操逻辑就能够很顺畅的写出来。
首先，我们来学习类型体操的第一个套路：模式匹配做提取。

## 模式匹配

我们知道，字符串可以和正则做模式匹配，提取子组，之后可以用1，2等饮用匹配到的子组。

```js
'abc'.replace(/a(b)c/,'$1,$1,$1') // 'b,b,b'
```

Typescript的类型也可以做模式匹配

比如这样一个Promise类型：

```ts
type p = Promise<'hello'>
```
我们想要提取value的类型，可以这样做：

```ts
type GetValueType<T> = T extends Promise<infer Value> ? Value : never

type Res = GetValueType<Promise<number>> // res number

```
通过extends 对传入的参数T做模式匹配，其中值的类型是需要提取的，通过infer 声明一个局部变量value来保存。如果匹配，返回匹配到的Value,否则返回never代表没匹配到.

这就是Typescript类型的模式匹配：

**Typescript 类型的模式匹配是通过 extends 对类型参数做匹配，结果保存到通过 infer 声明的局部类型变量里，如果匹配就能从该局部变量里拿到提取出的类型。**

这个模式匹配的套路有多有用呢？我们来看下在数组、字符串、函数、构造器等类型里的应用。


## 数组类型

### First

数组类型想提取第一个元素的类型怎么做呢？

```ts
type First<T extends unknown[]> = T extends [infer first,...unknown] ? first : never
// type First<T> = T extends unknown[] ? T extends [infer first,...Rest] ? first : never : never
```
类型参数 Arr 通过 extends 约束为只能是数组类型，数组元素是 unkown 也就是可以是任何值。

> any 和unknown 的区别：any 和 unknown 都代表任意类型，但是 unknown 只能接收任意类型的值，而 any 除了可以接收任意类型的值，也可以赋值给任意类型（除了 never）。类型体操中经常用 unknown 接受和匹配任何类型，而很少把任何类型赋值给某个类型变量。

### Last

可以提取第一个元素，当然也可以提取最后一个元素，修改下模式类型就行：

```ts
type GetLast<Arr extends unknown[]> = 
    Arr extends [...unknown[], infer Last] ? Last : never;
```

### PopArr

我们分别取了首尾元素，当然也可以取剩余的数组，比如取去掉了最后一个元素的数组：

```ts
type PopArr<Arr extends unknown[]> = Arr extends [] 
  ? [] 
  : Arr extends [...infer Rest,unknown] 
    ? Rest 
    : never
```

### ShiftArr

同理可得 ShiftArr 的实现：

```ts
type shiftArr<Arr extends unknown[]> = Arr extends []
  ? []
  : Arr extends [unknown,...infer Rest] 
    ? Rest
    : never
```

## 字符串类型

字符串类型也同样可以做模式匹配，匹配一个模式字符串，把需要提取的部分放到 infer 声明的局部变量里。

### StartsWith

```ts
type StartsWith<Str extends string,Prefix extends string> = Str extends `${Prefix}${string}` ? true : false
```
需要声明字符串 Str、匹配的前缀 Prefix 两个类型参数，它们都是 string。

用 Str 去匹配一个模式类型，模式类型的前缀是 Prefix，后面是任意的 string，如果匹配返回 true，否则返回 false。

### Replace

字符串可以匹配一个模式类型，提取想要的部分，自然也可以用这些再构成一个新的类型。

比如实现字符串替换：
```ts
type ReplaceStr<
    Str extends string,
    From extends string,
    To extends string
> = Str extends `${infer Prefix}${From}${infer Suffix}` 
        ? `${Prefix}${To}${Suffix}` : Str;
```
声明要替换的字符串 Str、待替换的字符串 From、替换成的字符串 3 个类型参数，通过 extends 约束为都是 string 类型。

用 Str 去匹配模式串，模式串由 From 和之前之后的字符串构成，把之前之后的字符串放到通过 infer 声明的局部变量 Prefix、Suffix 里。用 Prefix、Suffix 加上替换到的字符串 To 构造成新的字符串类型返回。



### trim

能够匹配和替换字符串，那也能实现去掉空白字符的Trim:

不过因为我们不知道有多少个空白字符，所以只能一个个的匹配和去掉，需要递归实现。

先实现TrimRight
```ts
type TrimRight<Str extends string> = Str extends `${infer Rest}${' ' | '\n' | '\t'}` ? TrimRight<Rest> : Str
```

然后实现 TrimLeft

```ts
type TrimLeft<Str extends string> = Str extends `${' ' | '\n' | '\t'}${infer Rest}` ? TrimLeft<Rest>: Str
```

两者结合：

```ts
type Trim<Str extends string> = TrimLeft<TrimRight<Str>>
```

## 函数

函数同样也可以做类型匹配，比如提取参数、返回值的类型。

### GetParameters

函数类型可以通过模式匹配来提取参数的类型：

```ts
type GetParameters<Func extends Function> = Func extends (...args: infer Args) => unknown ? Args : []
```

类型参数 Func 是要匹配的函数类型，通过 extends 约束为 Function。
Func 和模式类型做匹配，参数类型放到用 infer 声明的局部变量 Args 里，返回值可以是任何类型，用 unknown。

返回提取到的参数类型 Args。

同理，我们也可以提取返回值类型：

```ts
type GetReturnType<Func extends Function> = Func extends (...args:any[])=>infer R ? R : never
```
Func 和模式类型做匹配，提取返回值到通过 infer 声明的局部变量 ReturnType 里返回。
参数类型可以是任意类型，也就是 any[]（注意，这里不能用 unknown，这里的解释涉及到参数的逆变性质，具体原因逆变那一节会解释）。

### GetThisParammeterType

方法里可以调用 this，比如这样：

```ts
class Dog{
  name: string
  constructor(name: string){
    this.name = name
  }
  hello(){
    return `hello `+ this.name
  }
}

const tom = new Dog('tom')

tom.hello()

```

用`对象.方法名`的方式调用的时候，this就只想那个对象。但是方法也可以用call和apply调用：

```ts
tom.hello.call({
  abc: "test"
})
```
当使用call调用的时候，this就变了，但是呢，这里却没有检查出来this指向的错误。如何让编译器能够检查出 this 指向的错误呢？

可以在方法声明时指定 this 的类型：

```ts
class Dong {
    name: string;

    constructor() {
        this.name = "dong";
    }

    hello(this: Dong) {
        return 'hello, I\'m ' + this.name;
    }
}

const dong = new Dong()
dong.hello()
dong.hello.call({
  x:123
})
```
提示如下图所示：

![this_call.png](/this_call.png)

这样，当 call/apply 调用的时候，就能检查出 this 指向的对象是否是对的：
如果没有报错，说明没开启 strictBindCallApply 的编译选项，这个是控制是否按照原函数的类型来检查 bind、call、apply.
这里的this类型同样也可以通过模式匹配提取出来：

```ts
type GetThisParameterType<T> = T extends (this:infer ThisType,...args:any[])=>any
  ? ThisType
  : unknown

type GetThisParameterTypeRes = GetThisParameterType<typeof dong.hello> // type GetThisParameterTypeRes = Dong
```

## 构造器

构造器和函数的区别是，构造器是用于创建对象的，所以可以被 new。同样，我们也可以通过模式匹配提取构造器的参数和返回值的类型：

### GetInstanceType

构造器类型可以用interface声明，使用 new():xxx的语法。
比如：

```ts
interface Person{
  name: string
}

interface PersonConstructor{
  new(name:string):Person
}
```

这里的 PersonConstructor 返回的是Person类型的实例对象，这个也可以通过模式匹配取出来。

```ts
type GetInstanceType<
    ConstructorType extends new (...args: any) => any
> = ConstructorType extends new (...args: any) => infer InstanceType 
        ? InstanceType 
        : any;
```

类型参数 ConstructorType 是待处理的类型，通过 extends 约束为构造器类型。

用 ConstructorType 匹配一个模式类型，提取返回的实例类型到 infer 声明的局部变量 InstanceType 里，返回 InstanceType。

这样就能取出构造器对应的实例类型


### GetConstructorParameters

GetInstanceType 是提取构造器返回值类型，那同样也可以提取构造器的参数类型：

```ts
type GetConstructorParameters<ConstructorType extends new(...args:any[])=>any> = ConstructorType extends new(...args:infer ParametersType)=>any ? ParametersType: any
```

类型参数 ConstructorType 为待处理的类型，通过 extends 约束为构造器类型。

用 ConstructorType 匹配一个模式类型，提取参数的部分到 infer 声明的局部变量 ParametersType 里，返回 ParametersType。

## 索引类型

索引类型也同样可以用模式匹配提取某个索引的值的类型，这个用的也挺多的，比如 React 的 index.d.ts 里的 PropsWithRef 的高级类型，就是通过模式匹配提取了 ref 的值的类型：

![ref.png](/ref.png)

我们简化一下那个高级类型，提取 Props 里 ref 的类型：

### GetRefProps

我们通过模式匹配的方式来提取 ref 的值的类型：

```ts
type GetRefProps<Props> = 
    'ref' extends keyof Props
        ? Props extends { ref?: infer Value | undefined}
            ? Value
            : never
        : never;
```
类型参数 Props 为待处理的类型。
通过 keyof Props 取出 Props 的所有索引构成的联合类型，判断下 ref 是否在其中，也就是 'ref' extends keyof Props。

在 ts3.0 里面如果没有对应的索引，Obj[Key] 返回的是 {} 而不是 never，所以这样做下兼容处理。
如果有 ref 这个索引的话，就通过 infer 提取 Value 的类型返回，否则返回 never。

## 总结

就像字符串可以匹配一个模式串提取子组一样，TypeScript 类型也可以匹配一个模式类型提取某个部分的类型。

**TypeScript 类型的模式匹配是通过类型 extends 一个模式类型，把需要提取的部分放到通过 infer 声明的局部变量里，后面可以从这个局部变量拿到类型做各种后续处理。**

模式匹配的套路在数组、字符串、函数、构造器、索引类型、Promise 等类型中都有大量的应用。

[案例合并](https://www.typescriptlang.org/play?#code/PTAEm8fRo9UZXlFmTR1TUPexgAOUFj-pCEVoeH1CcyoWUTAtBUAXjQNeUAoMkUABQCcB7AWwEsBnAUwC4yAXATwAO7UAHF2PAGoBDADYBXdgBVB7ADzUAfKAC8NUOwAePdgDsAJqxoMWHVcxMAzdrVDT57LQH5XshaE6gJuwAbs4A3BT8QqLibgoASuyscjI8OjGSvkoq6tZsagDkAOZyUiZFBRoaERRUgA6mgCN+qLVgYjwAYsy0rDy8Khmd3TyqAIK0LobG5pZyJgDWJvQA7iYA2gC6WrpjE0amFqCr9k4ugz0ANKAAdDezC8tr6+ug3mdpAUGhtDVRwm1viWSqXS-y6PVUqwAjOcAEznADMmwivwGYJ4gJSPBhIPEbwhSJaGQAMlIen1om0SeCdvo9tNQHdFisNltQDTJvtLKsbldGQ8Npdjs5QFSeM9vKL-IEQuFIv1KaT0UlMTieKKIdC4YjquS-uJRRjUtjdArwSyalRqPQBDtdTRrTtRuNaVMDnzmZt0uy6QcNi9Ds8At7XVyeUKXICeJd3SZxaBI1LPrK7VaBIa0rpU46obCEQSUan08b7TbxvidYSAMoAC2YDh4tpRNbrDbLwc5DPmTMerPb9L93j9QedHP7McuYccwsjcYTHxl3zl0Wb9fT6RXrdoGtz2uR-Q3RfXtfr2YJlDAgHVtQBk3oAmOWa59AlZ4UloPFYAHVmDxq9wm8-Xx+X7VqoT67CGoA9LQ9hFJcdDsA4zAGC6HaQdBrKgch9IAAYACQAN5wQhBgAL74ah5TEVh-o8LQfgBA4sgcD8+7-m+n7fmuuhPi+bFAaoxSlOUoBlGYoBmPQ5QFJcAllBUOp-jxgEccqRrrqxSnATJQkiWJEkVNJ4mSRWD6JAIMhSAAxlwdqmeZVmgSBNGYQc5EwaA7TWM5liuZcij0F5EE0Wh6SPk5o4HLheHhlY8GIaReEeUw8XRZWcgOERlH+pFhFxfhfnxal6VxVRASgcx0S2ZZ7CcfG7BmVVDkAEQiIJRQlLJBSWAARkkaQOFB+ygGwLyNZcjWeKNoCNQAInphlFI18n9JVVmHroK3sE1UhdRZk3jXts3lPNi01A+ihQYwv79OdzCMKB8TMEU1bDBh4XeUF5ToWFPqWJF0WRvFBSgEDAA+wMADomKDEM8AUmXeDdd00Q9T3DJGWilTR5XCIjKPPTViP3Y9z38e1QmgBTlPAxWKKEzRRLwS933ga5X1gR2kVA9DBSQ9z4Ow8lU4Rr18OgHTtAM-Wqjo1KZVLjjF2S0qQIZmLF2gUr-FUxT82VNjau3Q5r0-YFUGfTo4t48M4ua6BVT67jKmq+LWva-NlN6xQD6AL+KdT3lQbTUC+UiMOIzisHagfB6HxjdKo7SzBZAUJyYFk8MwEmsinSdvaAAAUPIvkUrABNFYzFwAlDoWgxv65eWPOXz60HtAh2H3Q1VHrcx+Hqh5yYbcBD5wlFFwgRyIwPW0FX2haKze7RC3bex6wa0ZEvPdx3nM9zx9RQVgH4iJDwci0CYyhCJHR-iKf585NnyeJ+nmfpA-ucFzcRcl8JJh8BsO9DSFrVE+Z8L7CG8MfW+YDEwLn1pA0BKhDTAhNNfEBd8hB9wHqHIee8AEFF1gfVo4hFC1lYBvduYCyAWXMqwSwh0iigDwmQKmWCx6uRqFTCyElIJyDTvQWg29GHMO1hTb8bArisPSI1Y6EQqbEQoFTas7AZAyHoHnMR396FVyYSIimtAb5n2BkolR9BLgAElwYFEYMDUAABqUAGiJFt1kZTeR8iqHcLSO7XQQQligHodvCI80rjGNUYEigwTQn0CuBZWQMg854QMEkzgkJiIV31m0EhbByGxzAaoRQrJFABXUaQ0uQCsmsDAROT+tBi4BDKH-dYACGn+gqdAgIMYMnENITk5wYDASqgqb02geTfj0AcLpcoITlGqMIaAQAIeaAAIEwAFmr+yITwMxJgehlCspQlEbRNnbNTtkDBABhTxtE+EjP6LnXx+dC61O-g05pv8tDCIproc5WyaK8J4Pw6Btz2B+I-lcL+9Tf4AOioc58xzoHvO1t4aFOyTnCHhVTcFfAaj2FjgxKyNBw4SSESwweptoIRHcdi5wuLhDUAJSYL5PCrlEspr4-uJLXIVwCLS7oElyXywyEi2FiCkiqkFbsnI3LWASQZT8q5cy2gysuX82gwyI77PEIq35-DVWqHhZqq5AKTZ3JBWCn+fAXl8DIKyfVyrDXgWNQ8upgCTg0Gju3SpKgLXwu8Kqyh6LpRN35Qqi5WqVVupXgMlBPAbXavDb3SV0qQ1yotGAQARL6AFR9KAzRD5KgcHQa0Jcr65vzQIVguQC2snhQUfRDgga5zmOwPg4yrAFrRZTH1DBS0BTwqAGtngykuriMIMGswzCxSCGYeRuiEU+HcG2kRjdnDzpgYGotiQ82dtXiKqN66S1lp7X2gI0JAgkvwXpOGNN5TXw3QWwExY2i7s3aoA98F+2djHQhCdlxWEBDPZJYiFYgA)
