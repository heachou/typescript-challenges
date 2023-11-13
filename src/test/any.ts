let a:any = 2

a.test()

let b:unknown = 200

// error “b”的类型为“未知”。
b.foo

if(typeof b === 'number') {
  console.log(b + 100)
}

