/**
 * 数组去重工具函数
 * @param {Array} array - 需要去重的数组
 * @param {String|Function} key - (可选) 对象数组去重的唯一键名或回调函数
 * @returns {Array} - 去重后的新数组
 */
function unique(array, key) {
  if (!Array.isArray(array)) {
    console.error('The first argument must be an array.')
    return []
  }

  // 1. 基础类型数组去重 (如果没有传 key)
  if (!key) {
    return [...new Set(array)]
  }

  // 2. 对象数组去重
  const map = new Map()
  return array.filter((item) => {
    // 支持传入属性名字符串，或自定义处理函数
    const identifier = typeof key === 'function' ? key(item) : item[key]

    if (identifier !== undefined && !map.has(identifier)) {
      map.set(identifier, true)
      return true
    }
    return false
  })
}

/**
 * 数组洗牌、采样工具函数
 * @param {Array} arr - 需要操作的数组
 * @returns {Array} - 操作后的数组
 * */
const ArrayUtils = {
  // 洗牌
  shuffle: (arr) => {
    const r = [...arr]
    for (let i = r.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[r[i], r[j]] = [r[j], r[i]]
    }
    return r
  },
  // 采样
  sample: (arr, n = 1) => {
    return ArrayUtils.shuffle(arr).slice(0, n)
  },
}

Function.prototype.myCall = function (context, ...args) {
  context = context ?? globalThis
  context = Object(context)

  const symbolFn = Symbol('fn')
  context[symbolFn] = this

  let result
  try {
    result = context[symbolFn](...args)
  } finally {
    delete context[symbolFn]
  }

  return result
}

Function.prototype.myApply = function (context, arrayArgs) {
  context = context ?? globalThis
  context = Object(context)

  arrayArgs = Array.isArray(arrayArgs) ? arrayArgs : []

  const symbolFn = Symbol('fn')
  context[symbolFn] = this

  let result
  try {
    result = context[symbolFn](...arrayArgs)
  } finally {
    delete context[symbolFn]
  }

  return result
}

Function.prototype.myBind = function (context, ...args) {
  const self = this

  const boundFn = function (...newArgs) {
    const finalContext = this instanceof boundFn ? this : context
    return self.apply(finalContext, [...args, ...newArgs])
  }

  boundFn.prototype = Object.create(self.prototype)

  return boundFn
}

/*
 * 手动实现instanceof
 *  */
function myInstanceOf(left, right) {
  if (typeof left !== 'object' || left === null) return false
  if (typeof right !== 'function') throw new TypeError('Expected function to be an function.')

  let prototype = right.prototype
  left = Object.getPrototypeOf(left)

  while (true) {
    if (left === null) return false
    if (left === prototype) return true
    left = Object.getPrototypeOf(left)
  }
}

/*
 * 手动实现new
 *  */
function myNew(Constructor, ...args) {
  const obj = Object.create(Constructor.prototype)
  const result = Constructor.apply(obj, args)
  return result instanceof Object ? result : obj
}

/*
 * 柯里化函数
 *  */
function curry(fn) {
  const fnLength = fn.length

  return function curried(...args) {
    if (args.length > fnLength) return fn.apply(this, args)

    return function (...nextArgs) {
      return curried.apply(this, args.concat(nextArgs))
    }
  }
}

function antCurry(fn) {
  return function (context, ...args) {
    return fn.call(context, ...args)
  }
}

/**
 * @description 简易深拷贝
 * @param target {object} 拷贝对象
 * @param cache {WeakMap} 递归遍历缓存
 */

export function deepClone(target, cache = new WeakMap()) {
  if (typeof target !== 'object') return target
  if (target === null) return target
  if (cache.get(target)) return cache.get(target) // 防止循环引用，而陷入死循环
  if (target instanceof Date) return new Date(target)
  if (target instanceof RegExp) return new RegExp(target)

  const cloneObj = new target.constructor()
  cache.set(target, cloneObj)
  for (const key in target) {
    if (Object.hasOwn(target, key)) {
      cloneObj[key] = deepClone(target[key], cache)
    }
  }
  return cloneObj
}
