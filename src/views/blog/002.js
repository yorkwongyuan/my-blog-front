export default `
# 一起来钻vue3工具函数的牛角尖吧
前阵子打开vue3的源码, 看到了shared目录下的一堆通用方法, 发现有些方法写得很好, 有些看上去‘很简单’, 其实多看几遍,发现, 是我自己很简单, 只要钻下牛角尖, 就能发现些什么,归根到底还是自己之前很多技术细节没有深究到位, 因此, 决定写一篇文章做一下总结!
## toTypeString

定义位置: shared/src/index.ts 第66行

toTypeString主要是返回数据的类型, 使用了Object.prototype.toString.call的方法, 实现了对复杂数据类型的区分


const objectToString = Object.prototype.toString
const toTypeString = (val) => objectToString.call(val)

let arr = []
let obj = {}
let map = new Map()
let set = new Set()
console.log(toTypeString(obj))
console.log(toTypeString(arr))
console.log(toTypeString(map))
console.log(toTypeString(set))
// [object Object]
// [object Array]
// [object Map]
// [object Set]


## toRawType 方法

定义位置: shared/src/index.ts 第70行

这里需要注意的是前面我们的toTypeString返回了'[object xxType]', 现在则是使用slice方法来将xxType取出


export const toRawType = (value: unknown): string => {
  // extract "RawType" from strings like "[object RawType]"
  return toTypeString(value).slice(8, -1)
}


案例:


const objectToString = Object.prototype.toString
const toTypeString = (value) => {
  return objectToString.call(value)
}

const toRawType = (value) => {
  return toTypeString(value).slice(8, -1)
}

const str = toRawType('')
console.log('str', str) // 'String'
const num = toRawType(123)
console.log('num', num) // 'Number'


## EMPTY_OBJ

定义位置: shared/src/index.ts 第15行

注意这里typescript是通过readonly的方式来定义一个冻结对象的类型的, readonly 是只读修饰符


export const EMPTY_OBJ: { readonly [key: string]: any } = __DEV__
  ? Object.freeze({}) : {}



let emptyObj2 = Object.freeze({
  props: {
    name: 'jack',
    age: 12
  },
  total: 1000
})

// 无法修改第一层属性
emptyObj2.total = 0
console.log('emptyObj2.total', emptyObj2.total)
// 可以修改第二层对象的属性
emptyObj2.props.age = 13
console.log('emptyObj2.props.age', emptyObj2.props.age)
// 无法新建本不存在的属性
emptyObj2.props2 = {}
console.log('emptyObj2.props2', emptyObj2.props2)



let arr = Object.freeze([])
// arr.push(1) // 无法添加元素, 会直接报错
arr.length = 3
console.log('arr', arr)

let arr1 = Object.freeze([{name: 'jack'}])
// 对象内的属性可以修改
arr1[0].name = 'rose'
console.log('arr1[0].name', arr1[0].name) // rose


## NOOP空函数

定义位置: shared/src/index.ts 第21行

定义一个空函数, 这样写, 而不是function () {}这样定义, 是为了方便压缩, 这样压缩后的代码, 就都只是一个变量, 指向了一个空函数,而不是在使用的地方写上一个function () {}


export const NOOP = () => {}

let obj = function getName (cb => NOOP) {
// ... 代码省略 ...
}


## NO函数

定义位置: shared/src/index.ts 第26行

永远返回false的函数, 个人理解就是一个返回boolean值的函数的备选项


export const NO = () => false



// /packages/compiler-sfc/node_modules/@vue/compiler-ssr/
// src/transforms/ssrTransformElement.ts 第374行
const isVoidTag = context.options.isVoidTag || NO
...
// 395行, 执行isVoidTag这个函数,如果是NO, 那就永远返回false
if (!isVoidTag(node.tag)) {
	// push closing tag
	context.pushStringPart(</node.tag>)
}


## isOn方法

定义位置: shared/src/index.ts 第28行

利用正则来判断当前的事件名是否是on+EventName的格式, 注意:^在正则开头表示首位占位符, 其他地方都是非的含义, [^a-z]表示不是a到z的字母, 正则检验工具<https://regex101.com/>


const onRE = /^on[^a-z]/
export const isOn = (key: string) => onRE.test(key)


## isModelListener方法

定义位置: shared/src/index.ts 第31行

检验监听事件名是否是onUpdate:开头


export const isModelListener = (key: string) => key.startsWith('onUpdate:')


startsWith是es6当中的方法, 可以获取一个字符串是否以指定的子字符串开头, 返回Boolean类型

语法: string.startsWith(searchvalue, start), searchValue为指定的子字符串, start为开始的位数, 默认为0


let isModeListener = (key) => {
  return key.startsWith('onUpdate:')
}

console.log(isModeListener('onUpdate:change'))


## extend方法, 合并对象

定义位置: shared/src/index.ts 第33行

用于合并对象, 类似于继承


const extend = Object.assign
let obj1 = {name: 'jack'}
let obj2 = {name: 'rose', age: 18}

let obj = extend(obj1, obj2)
console.log('obj', obj) // { name: 'rose', age: 18 }
// 注意, 原本的obj1也会被改变
console.log('obj1', obj1) // { name: 'rose', age: 18 }


## remove方法

定义位置: shared/src/index.ts 第35行

删除数组中的某个元素, 但是注意了, 删除数组中的某个元素,使用splice方法, 其实是比较消耗性能的,


export const remove = <T>(arr: T[], el: T) => {
  const i = arr.indexOf(el)
  if (i > -1) {
    arr.splice(i, 1)
  }
}

let arr = [1, 2, 3]
remove(arr, 2)
// [ 1, 3 ] 'arr数据'
console.log(arr, 'arr数据')


所以在axios源码中(lib/core/interceptorManager.js), 使用以下的方式‘删除’数组中的元素:


// 第32行
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};
// ...

// 第46行
/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become null calling eject.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};


## hasOwn方法

定义位置: shared/src/index.ts 第43行

判断一个属性是否是一个对象本身的属性, 利用了Object.prototype.hasOwnProperty.call的形式来实现功能

注意这里的key is keyof typeof val, 这里的is是类型谓词, 实际上是在描述函数参数的类型


const hasOwnProperty = Object.prototype.hasOwnProperty
export const hasOwn = (
  val: object,
  key: string | symbol
): key is keyof typeof val => hasOwnProperty.call(val, key)


1.  注意这里的类型谓词写法, 这种声明函数类型, 后面写上'params is type' 的写法, 可以有效缩小参数的取值范围, 参考以下案例, 相当于是如果isString返回了true, 那str的类型肯定是string类型
1.  这种写法一般用于返回boolean类型的函数中, 事先将参数的类型范围确定


const isString = (str: any): str is string => typeof str === 'string'

function fn(strParams: any) {
  if (isStrings(strParams)) {
    strParams.join(',') // 编译报错
  }
}



const isString = (str: any): boolean => typeof str === 'string'

function fn(strParams: any) {
  if (isStrings(strParams)) {
    strParams.join(',') // 编译不会报错, 运行时报错
  }
}


## isArray

定义位置: shared/src/index.ts 第48行

判断一个对象是不是数组


const isArray = Array.isArray

const fakeArray = { __proto__: Array.prototype, length: 0 }

console.log('isArray(fakeArray)', isArray(fakeArray)) // false

console.log('fakeArray instanceof Array', fakeArray instanceof Array) // true


## isMap/isSet
定义位置: shared/src/index.ts 第49行

注意, 这里再一次使用到了类型谓词, params is type 这种类型的写法


export const isMap = (val: unknown): val is Map<any, any> =>
  toTypeString(val) === '[object Map]'
export const isSet = (val: unknown): val is Set<any> =>
  toTypeString(val) === '[object Set]'


### Map

Map是一种es6提供的新的数据类型, 一种键值对的数据结构, 相比于对象, 它其实也是键值对, 但是它的键不同于对象那种只能是字符串的键, 可以是各种类型


// 形式上, Map类型是二维数组
// 1. 定义一个函数作为键
let fn = function haha() { console.log('this is function') }
let m = new Map([['jack', 100], [fn, '我是函数的值']])

// 2. get方法获取元素
let result = m.get(fn)
console.log('haha -> result', result)
// haha -> result 我是函数的值

// 3. 通过Array.from可以转为普通的二维数组
let arr = Array.from(m)
console.log('haha -> arr', arr)
// haha -> arr [ [ 'jack', 100 ], [ [Function: haha], '我是函数的值' ] ]

// 4. set方法新增元素成员
let obj = {name: 'jack'}
m.set(obj, '28岁了都')
console.log('set新元素之后', m)
// set新元素之后 Map {
// 'jack' => 100,
//  [Function: haha] => '我是函数的值',
//  { name: 'jack' } => '28岁了都' }

// 5. has 判断是否包含某元素
m.has(fn)
console.log('haha -> m.has(fn)', m.has(fn)) // true

// 6. delete删除元素成员
m.delete(obj)
console.log('删除后的结果', Array.from(m))
// 删除后的结果 [ [ 'jack', 100 ], [ [Function: haha], '我是函数的值' ] ]

// 7. clear清空所有元素
m.clear()
console.log('清空后的结果', m)


遍历相关的方法主要有keys, entries, values, forEach


let fn = function haha() { console.log('this is function') }
let m = new Map([['jack', 100], [fn, '我是函数的值']])
m.forEach(item => {
  console.log('forEach -> item', item)
  // forEach -> item 100
  // forEach -> item 我是函数的值
})

// 1. keys 方法, 返回包含映射中键的迭代器对象
let it = m.keys()
console.log('it', it) // it [Map Iterator] { 'jack', [Function: haha] }
console.log(it.next().value) // jack
console.log(it.next().value) // [Function: haha]
console.log(it.next().value) // undefined
// 或者
for (let key of it) {
  console.log('for...of... -> key', key)
}
/**
 * 
  for...of... -> key jack
  for...of... -> key function haha() {
    console.log('this is function');
  }
 */

// 2. entries 方法, 返回包含映射中的键值的迭代器对象
let it = m.entries()
console.log(it.next().value) // [ 'jack', 100 ]
console.log(it.next().value) // [ [Function: haha], '我是函数的值' ]
console.log(it.next().value) // undefined
// 或者
for (let item of it) {
  console.log('for...of... -> entries', item)
}
/**
 * for...of... -> entries [ 'jack', 100 ]
 * for...of... -> entries [ [Function: haha], '我是函数的值' ]
 */

// 3. values 方法, 返回包含映射中的值的迭代器对象
let it = m.values()

console.log(it.next().value) // 100
console.log(it.next().value) // 我是函数的值
console.log(it.next().value) // undefined
// 或者
for (let value of it) {
	console.log('for...of... -> value', value)
}

// /**
//  * for...of... -> value 100
//  * for...of... -> value 我是函数的值
//  */


综合, 我们可以得出Map和Object的区别:

1.  Map的键可以是任意类型, Object只能是String或者Symbol
1.  Map的可以通过size属性获取元素数量, Object则必须手动计算

<!---->

3.  Map在频繁增减键值对的场景下, 性能较好
3.  Map中的数据是有序的, 而Object则是无序的

### Set

Set类型也是es6提供的一种新的数据类型,它允许你存入任意类型的唯一值, 无论是基本数据类型还是引用类型, 但是, 尽管NaN !== NaN, Set仍然认为这是同一个数据


// 1. NaN
let set = new Set([NaN, NaN])
// 尽管NaN !== NaN, 但是, 在Set中仍然被认为是相同的数据
console.log('NaN === NaN', NaN === NaN)
console.log('set', set)

// 2.add方法
let set = new Set()
let person1 = {
  name: '大明'
}
let person2 = {
  name: '小明'
}

set.add(person1)
set.add(person2)

console.log('add的结果', set)
// add的结果 Set { { name: '大明' }, { name: '小明' } }

console.log('Array.from', Array.from(set))
// Array.from [ { name: '大明' }, { name: '小明' } ]

// 3. delete方法
set.delete(person1)
console.log('delete之后', set) // delete之后 Set { { name: '小明' } }

// 4. has方法
console.log('has person1 -->', set.has(person1))
// has person1 --> false
console.log('has person2 -->', set.has(person2))
// has person2 --> true

// 5.清空
set.clear()
console.log('set clear -->', set) // set clear --> Set {}


遍历相关的方法, 主要有keys, entries, values, forEach


// 1. keys方法
let it = set.keys()
// console.log(it.next().value) // { name: '大明' }
// console.log(it.next().value) // { name: '小明' }
// console.log(it.next().value) // undefined

// 或者

for (let key of it) {
  console.log('for...of... -> keys', key)
}

/**
 * for...of... -> keys { name: '大明' }
 * for...of... -> keys { name: '小明' }
 */

// 2. entries 方法
let it = set.entries()
console.log(it.next().value) // { name: '大明' }
console.log(it.next().value) // { name: '小明' }
console.log(it.next().value) // undefined

// 或者

for (let key of it) {
  console.log('for...of... -> entries', key)
}

/**
 * for...of... -> entries [ { name: '大明' }, { name: '大明' } ]
 * for...of... -> entries [ { name: '小明' }, { name: '小明' } ]
 */

// 3. values
let it = set.values()
console.log(it.next().value) // { name: '大明' }
console.log(it.next().value) // { name: '小明' }
console.log(it.next().value) // undefined

// 或者

for (let key of it) {
  console.log('for...of... -> values', key)
}

/**
 * for...of... -> values { name: '大明' }
 * for...of... -> values { name: '小明' }
 */

// 4. forEach
set.forEach(item => {
  console.log('item', item)
})

/**
 * item { name: '大明' }
 * item { name: '小明' }
 */


## isDate

定义位置: shared/src/index.ts 第54行


export const isDate = (val: unknown): val is Date => val instanceof Date


这么做有一定的漏洞, 但一般还是可以判断


const isDate = (val) => val instanceof Date
let date = new Date()
let result = isDate({__proto__: Date.prototype, length: 0})
console.log('result', result) // result true


## isFunction

定义位置: shared/src/index.ts 第55行

判断是否是函数类型还是较为简单的


export const isFunction = (val: unknown): val is Function =>
  typeof val === 'function'


## isObject

定义位置: shared/src/index.ts 第59行

注意:

1.  typeof null === 'object', 所以必须确保val不为null.
1.  Record是typescript中的一种**工具类型**

<!---->

3.  类型谓词, 此处不再解释

所谓的工具类型, 其实可以理解为就是一种封装好了的方法, 就像我们日常开发时候所使用的util.js这类工具, 它无需引入, 可以直接使用, Record就是其中之一, 它的作用是限制一个对象的键值类型, 其两个泛型参数就是一个限制键类型, 一个限制值类型


export const isObject = (val: unknown): val is Record<any, any> =>
  val !== null && typeof val === 'object'


Record等工具类型的源码, 我们可以在node_modules/typescript/lib/lib.es5.d.ts中找到, 也可以直接点击Record自动跳转过去


// 第1469行代码
type Record<K extends keyof any, T> = {
    [P in K]: T;
};
// 从这里我们可以看出, 键的类型只能从K(第一个泛型参数中得到), 而值的类型只能是T


Record使用案例:


type Animal = 'dog' | 'cat' | 'pig'

interface Info {
  name: string;
  age: number
}

type AnimalInfo = Record<Animal, Info>

// animalInfo的键, 只能是dog, cat, pig中的一个
const animalInfo: AnimalInfo = {
  dog: {
    name: '阿旺',
    age: 2
  },
  cat: {
    name: '阿花',
    age: 1
  },
  pig: {
    name: '二师兄',
    age: 3
  }
}

console.log(animalInfo)


## isPlainObject 方法

定义位置: shared/src/index.ts 第75行

该方法作用是, 判断一个对象是否是纯粹的对象, 前面一个isObject方法, isObject([])是true, isObject({})也是true, 而此处的isPlainObject则仅限于真正的Object


export const isPlainObject = (val: unknown): val is object =>
  toTypeString(val) === '[object Object]'


## isPromise 方法

定义位置: shared/src/index.ts 第62行

判断是否是promise对象, 这里要注意的是Promise的类型, typescript 中 Promise<T>类型, 接受一个泛型参数T, 用以确定这个promise对象最终resolve的值的类型


export const isPromise = <T = any>(val: unknown): val is Promise<T> => {
  return isObject(val) && isFunction(val.then) && isFunction(val.catch)
}


思考一个问题: 我们如何控制声明Promise返回值的类型?

1.  使用这里的泛型方式声明


let promiseString:Promise<string> = new Promise(resolve => resolve('123'))
let promiseNumber:Promise<number> = new Promise(resolve => resolve(123'))


2.  单独声明resolve方法


let promiseString = new Promise((resolve: (params: string) => void, reject) => {
  resolve('123')
})


## isIntegerKey 方法

定义位置: shared/src/index.ts 第78行

主要是用于判断是否是数字型的字符串, 形如: '123', '888' 则为true, '123hello'则为false

这里我们需要关注parseInt这个方法, 这个方法主要是将字符串转为数字, 例如: '123name' -> 123; '123name888' -> 123

parseInt 的第一个参数大家都很熟悉, 就是要被转换的字符串, 但是第二个出现的概率可能相对偏低, 第二个表示的就是**进制, 一般默认是10, 也就是十进制!** 那么既然默认是10? 此处为何还要多写一次? 这当然是为了保证在不同的环境下运行结果能保证一致!


export const isString = (val: unknown): val is string => typeof val === 'string'
export const isIntegerKey = (key: unknown) =>
  isString(key) &&
  key !== 'NaN' &&
  key[0] !== '-' &&
  '' + parseInt(key, 10) === key
isIntegerKey('888hello') // 888


parseInt 第二个参数使用案例:

1.  第二个参数, 进制的表示


// 以二进制的方式解析'010'
const result = parseInt('010', 2)
console.log('result', result) // 2
// 我们都知道, 如果 '010'是二进制, 那么,转为10进制, 就是使用: 0*2^0 + 1*2^1 + 0*2^2 结果自然就
// 是2,同理我们可以知道用三进制来解析:
const result = parseInt('010', 3) // 结果自然就是3


2.  第二个参数的取值最大能达到多少呢?

我们知道, 十进制最大的数也就是9, 那么如果我要解析十进制以上的数字呢? 最常见的就是十六进制. 不错, 我们会用字母代替! 也就是a-z, 共26个字母, 那么我们大胆猜测下, 最大取值,是不是就是36?


// 继续用我们万年不变的老案例...:
const result = parseInt('010', 36)
console.log('result', result) // 36
// 那再往上加一呢:
const result = parseInt('010', 37)
console.log('result', result) // NaN


由此我们得知, parseInt最多只能取到36!

## makeMap方法

定义位置: shared/src/makeMap.ts 第8行

该方法主要是接受一个带逗号的字符串, 将该字符串以逗号拆分为一个个子字符串, 再用这些子字符串作为一个对象的键, 值全部为true; 返回一个方法, 这个方法可以检测出, 这个方法接受的参数是否是对象中的键!


export function makeMap(
  str: string,
  expectsLowerCase?: boolean
): (key: string) => boolean {
  const map: Record<string, boolean> = Object.create(null)
  const list: Array<string> = str.split(',')
  for (let i = 0; i < list.length; i++) {
    map[list[i]] = true
  }
  return expectsLowerCase ? val => !!map[val.toLowerCase()] : val => !!map[val]
}


类型上来看, 其实就是一个这样的方法:


(params1:string, params2?:boolean) => (key: string) => boolean


其返回了一个检测函数,该检测函数接受一个字符串, 返回是该字符串是否存在!


const fn = makeMap('dog,cat,bird')
const result1 = fn('fish')
console.log(result1) // false, 不存在fish
const result2 = fn('dog')
console.log(result2) // true, 存在dog


好了, 通过以上讲解,我们大体上知道了这个函数的作用, 现在我们来看看需要注意的点:

1.  工具类型Record<string, boolean>, 表示该对象键全部是string, 值全是boolean, 这里前面已经讲过了.
1.  创建对象为何要用Object.create(null) ? 而不是直接使用 const map = {} ?

语法: Object.create(proto, [propertiesObject]), 返回一个新的对象

第一个参数proto, 将会被挂在到新对象的原型对象上.

第二个参数propertiesObject, 对应了Object.defineProperties的第二个参数, 也就是所谓的属性描述符:

1.  value, 属性的值
1.  writable, 是否可以写, 默认为true

<!---->

3.  enumerable, 属性是否可枚举, 所谓可枚举, 就是能够被以下方法访问到

<!---->

1.  1.  for...in,能将该属性遍历出来
    1.  Object.keys, 能将该属性包含在返回的数组中

<!---->

1.  3.  JSON.stringify, 能够将其变为JSON字符串的一部分!

<!---->

4.  configurable, 默认true,如果为false, 则属性无法被改变, 无法被删除, 无法修改属性描述符
4.  set 存值函数

<!---->

6.  get 取值函数

我们来对比下, 使用Object.create(null)和{}的区别

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ff97b9b57a9b4ac88563836befc69f47~tplv-k3u1fbpfcp-zoom-1.image)

我们可以看到, Object.create(null), 创建的对象, 更为‘纯粹’, 这样, 当方法执行到map[val.toLowerCase()]时, 不会受到__proto__的影响.

3.  !!, 双感叹号, 将数据转为boolean类型

\


## cacheStringFunction方法

定义位置: shared/src/index.ts 第92行

这个函数的大概作用,相信大家一看就明白了, 参数是一个函数, 返回值也是一个函数;

返回的这个函数呢, 接受一个字符串参数, 如果我们第一次传入了一个参数, 计算结果就会被闭包缓存起来,下次再遇到相同的时候, 就不会再走fn方法重新计算了.这个函数本质上也是一个单例模式, 利用闭包, 保存了之前的计算结果.


const cacheStringFunction = <T extends (str: string) => string>(fn: T): T => {
  const cache: Record<string, string> = Object.create(null)
  return ((str: string) => {
    const hit = cache[str]
    return hit || (cache[str] = fn(str))
  }) as any
}


使用案例:

可以看到, hello被传入了两次, 但是函数实际执行运算, 只执行了一次, 然后值就被缓存起来了


let fn1 = cacheStringFunction((key) => {
  console.log('通过了计算得到', key + 'world')
  return key + 'world'
})

console.log(fn1('hello'))
console.log(fn1('hello'))
console.log(fn1('goodbye'))
/**
 * 
 * 通过了计算得到 helloworld
 * helloworld
 * helloworld
 * 通过了计算得到 goodbyeworld
 * goodbyeworld
 */


说完了函数的基本功能, 我们来说个需要关注的点, 那就是为何返回的函数要被as any? 去掉会如何?

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cf76fd6832774f3eb0b6423813f4095d~tplv-k3u1fbpfcp-zoom-1.image)

果不其然,报错了, 那么这个错误什么意思呢, 其实也很容易理解,我个人理解就是: **(str:string) => string 是符合T的类型要求, 但是, T也可以是另一种形式的子类,也就无法保证和参数的类型完全一致.** 举个例子, 假如以下函数不报错:


let testGenerics = <T extends {length: number}>(params: T, minNum: number): T =>{
  if (params.length >= minNum) {
    return params
  }else {
    return {length: minNum}
  }
}


那我们直接运行下


let data = testGenerics([1,2,3], 8)
// 此时的data,讲道理应该是Array类型
data.slice(0,1) // 直接报错, 因为根本就不是数组!


## camelize方法

定义位置: shared/src/index.ts 第104行

这个函数的作用也非常好理解, 就是将连字符转为驼峰写法.

这里我们要注意下replace第二个参数的用法.


const camelizeRE = /-(\\w)/g
/**
 * @private
 */
export const camelize = cacheStringFunction((str: string): string => {
  return str.replace(camelizeRE, (_, c) => (c ? c.toUpperCase() : ''))
})
// 使用案例
let str = 'on-handle-click'
const result = camelize(str)
console.log('result', result) // result onHandleClick


关于replace的使用:

replace的第一个参数非常好理解, 要么是字符串, 要么是正则, 总之就是需要被替换的字符串的文本模式,一个参考物.

我们要说的是第二个参数, 它可以有以下几种情况

1.  字符串, 最为常见, 这里就不展开了
1.  正则替换表达式

<!---->

1.  1.  $&, 用于无分组的情况


let str = '史记真是史家之绝唱,无韵之离骚'
let result = str.replace('史记', '《$&》') // 这里的$&就是‘史记’二字, 也就是用《史记》代替史记
console.log(result) // 《史记》真是史家之绝唱,无韵之离骚


b. $, 匹配到的数据的左边字符串


let str = '研究一下replace该怎么用'

let result = str.replace('replace', ',$前端技术') // 这里的$代表‘研究一下’, 
// 也就是用‘,研究一下前端技术’代替'replace'
console.log(result) // 研究一下,研究一下前端技术该怎么用


c.$' , 和 $相反, 代表匹配到的数据的右边字符串


let str = '研究一下replace该怎么用'

let result = str.replace('replace', ",vue3$',")
// 此处的$'就是replace右边的字符串, 也就是'该怎么用', 连起来就是
// 用“,vue3该怎么用,”代替“replace”
console.log(result) // 研究一下,vue3该怎么用,该怎么用


d. $1,$2,$3,.....$n, 表示第几个分组


let str = '西瓜,番薯,大番薯,咸鱼,萝卜,苹果'
let result = str.replace(/(西瓜)(.*)(苹果)/, "$1(水果)$2$3(水果)")
// 此处的$1代表'西瓜',$2代表',番薯,大番薯,咸鱼,萝卜,',$3代表'苹果'
console.log('result', result) // 西瓜(水果),番薯,大番薯,咸鱼,萝卜,苹果(水果)


3.  函数, 这里就是本案例的重点了

<!---->

1.  1.  有分组的情况


let str = '今年是2022年,时间好快'
let result = str.replace(/(今年).+?(时间).*/g, function () {
  console.log(arguments)
  // {'0': '今年是2022年,时间好快', 代表匹配到的字符串
  // '1': '今年', 分组1
  // '2': '时间', 分组2
  // '3': 0, 匹配到字符串开始的位置, 此处为0
  // '4': '今年是2022年,时间好快' } 原始字符串
})


我们可以得出结论,那就是有分组的情况下, 第二个参数开始就是依次展示每次分组匹配到的内容, 所以, 我们回到源码中, 此处的c, 实际上就是前面说的每次匹配到的第一个分组, 本案例中依次为: h, c两个, 然后将其改为大写, 直接return , 就能将 -x 替换为X,从而实现我们的目标.


let str = 'on-handle-click'
let result = str.replace(/-(\\w)/g, function () {
  console.log(arguments)
  // { '0': '-h', '1': 'h', '2': 2, '3': 'on-handle-click' }
  // { '0': '-c', '1': 'c', '2': 9, '3': 'on-handle-click' }
  return str.replace(camelizeRE, (_, c) => (c ? c.toUpperCase() : ''))
})


## hasChanged

定义位置: shared/src/index.ts 第130行

从字面意思就可以看出来, 这个方法的主要作用就是, 比较两个值是否不同!

Object.is(value1, value2);

参数: value1和value2为需要比较的两个变量

返回值: Boolean


// compare whether a value has changed, accounting for NaN.
export const hasChanged = (value: any, oldValue: any): boolean =>
  !Object.is(value, oldValue)


可能有人感到疑问, 两个值是否不同还需要封装?多此一举吧, 我直接 a !== b 不就行了? 我们来看几个例子:


// +0 和 -0问题
console.log(+0 === -0) // true
Object.is(+0, -1) // false

// NaN 问题
console.log(NaN === NaN) // false
Object.is(NaN, NaN) // true


由此可以看出, Object.is可以弥补 正负0 和 NaN比较上存在的问题. MDN网站上还提供了一个polyfill:


Object.is = function () {
	 // 如果两个值不同(有可能是正负0)
  if (x === y) {
    return x !== 0 || 1/x === 1/y
    /**
     * 如果x,y分别为+0 和 -0, 那么, 一个将会是Infinity 另一个是-Infinity
     */
    // 如果不同, 也可能是NaN
  } else {
    // 自己都不等于自己, 那肯定是NaN了
    return x !== x && y !==y
  }
}
console.log('NaN === NaN -->', Object.is(NaN, NaN))
console.log('+0 === -0 -->', Object.is(+0, -0))
// NaN === NaN --> true ⠼ : timing npm:load:cleanupLog Completed in 2ms
// +0 === -0 --> false


## def 方法

定义位置: shared/src/index.ts 第140行

代码同样很简单, 就是给对象obj, 加上一个可以被删除,其属性描述符可以被改变, 且不可枚举的属性key, 其值为value.

关于属性描述符, makeMap方法中已经提到了,这里不再展开


export const def = (obj: object, key: string | symbol, value: any) => {
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: false,
    value
  })
}


方法使用案例:


let person = {
  name: 'human',
  age: 100
}

def(person, 'gender', 'male')
console.log('person --> ', person) 
/**
 * nodejs 环境下 { name: 'human', age: 100 }
 * chrome 浏览器下 { name: 'human', age: 100, gender: 'male' }
 *  */ 
console.log('gender --> ', person.gender) // male


测试可枚举性, 按照我们之前说的for...in, Object.keys, JSON.stringify三种方法


// for...in
for (let key in person) {
  console.log('key', key)
  /**
   * key name
   * key age
   */
}

// JSON.stringify
console.log('JSON.stringify(person)', JSON.stringify(person))
// {"name":"human","age":100}

// Object.keys(person)
console.log('Object.keys(person)', Object.keys(person))
// [ 'name', 'age' ]


关于属性描述符的知识点, 还需要补充一下, 那就是 **属性描述符**可以细分为**数据描述符**和**存取描述符.** 注意, configurable 和 enumerable既是数据描述符又是存取描述符. 除了这两个属性之外, 其他不同的描述符不得共用!

1.  数据描述符

<!---->

1.  1.  writable , 只有writable为true的时候, 该属性才能被改变值
    1.  value, 属性的值

<!---->

2.  存取描述符

<!---->

1.  1.  get
    1.  set

## toNumber 方法

定义位置: shared/src/index.ts 第148行

该方法的意图是: 如果一个值无法被转为数字, 则原样返回!

我们这里需要关注的点是, isNaN这个方法


export const toNumber = (val: any): any => {
  const n = parseFloat(val)
  return isNaN(n) ? val : n
}


isNaN一看字面意思就知道: 判断一个值是否为NaN. 但他有一些怪异行为, 例如:


isNaN(undefined) // true
isNaN('undefined') // true
isNaN('haha') // true


很明显, 这个方法关心的根本不是一个值是否是NaN, 它似乎更关心**一个值是否无法被转为数字!** 所以, 我们有了Number.isNaN


Number.isNaN(undefined) // false
Number.isNaN('undefined') // false
Number.isNaN('haha') // false


所以, 一定要注意了, isNaN和Number.isNaN不是一回事!`