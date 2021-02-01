const fs = require("fs");
const path = require("path");
const Utils = require('./utils');

/**
 * 初始化
 * @param String ext 加载的文件后缀
 *
 * @return Object dm
 */
function DM(ext = "js", _) {
  const _require = require;
  const utils = Utils(_);

  const isFunction = v => typeof v === "function";

  /**
   * 加载一个目录为模块
   * @param String dir 读取路径
   *
   * @return Object 模块加载后的对象
   */
  const load = dir => {
    const Main = _require(dir);
    if (!isFunction(Main)) throw Error(`${dir} required isnt function`);

    // 尝试加载执行 before hook
    for (const x of ["Before", "After"]) {
      const file = path.resolve(dir, `${x}.${ext}`);
      if (fs.existsSync(file)) {
        Main[x] = _require(file);
        if (!isFunction(Main[x])) throw Error(`${file} required isnt function`);
      }
    }

    return Main;
  };

  /**
   * 加载并初始化模块，从磁盘上, 仅读取一级，不递归
   * @param String dir 读取路径
   * @param Set<string> ignores 要忽略的名称集合
   *
   * @return Object 模块初始化后的对象{ [name]: Main },
   */
  const loadDir = (dir, ignores = new Set()) => {
    // 自动添加忽略 . .. 两个目录
    ignores.add(".");
    ignores.add("..");

    const modules = {};

    for (const x of fs.readdirSync(dir)) {
      // 出现在忽略范围，直接略过
      if (ignores.has(x)) continue;
      // 计算模块根路径
      const _dir = path.resolve(dir, x);
      const stats = fs.statSync(_dir);
      // 模块路径必须为目录, 不是目录的直接略过
      if (!stats.isDirectory()) continue;

      modules[x] = load(_dir);
    }

    return modules;
  };

  /**
   * 执行一个模块初始化
   * @param Function Main 模块函数
   * @param Array [args] 执行初始化的参数
   */
  const exec = (Main, args = []) => {
    if (isFunction(Main.Before)) args = Main.Before(...args);
    const main = Main(...args);
    if (isFunction(Main.After)) Main.After(main, ...args);

    return main;
  };

  /**
   * 全流程自动加载一个目录下的所有模块
   * @param String dir 要加载的目录
   * @param Set<string> opt.ignores 要忽略的名称集合
   * @param Object opt.deps 目前已有的模块
   * @param Array opt.args 模块初始化传递的参数列表
   * @param Object opt.defaults 默认模块 { [name]: Main }
   * @param Function opt.set 挂载函数 opt.set(deps, name, main)
   *
   * @return void
   */
  const auto = (dir, { ignores, deps, args, defaults }) => {
    if (!defaults) defaults = {};

    const modules = loadDir(dir, ignores);
    for (const name of Object.keys(defaults)) {
      if (modules[name]) throw Error(`Name ${name} exists already`);
      modules[name] = defaults[name];
    }

    // 获取全部即将初始化的模块名称，此时的 modules 是扁平的一级结构
    const names = new Set(Object.keys(modules));
    while (names.size) {
      // 记录此次迭代有多少个模块被排序了，如果某次迭代被排序的模块数量为0，
      // 那就要抛出异常了，说明依赖指定有问题，永远都不可能排序完毕
      let count = 0;
      /** 默认挂载函数 */
      const plugin = name => {
        const main = exec(modules[name], args);
        if (_.has(deps, name)) throw Error(`Name ${name} duplicate`);
        _.set(deps, name, main);
        names.delete(name);
        count += 1;
      };

      for (const x of names) {
        const { Deps } = modules[x];
        if (!Array.isArray(Deps) || !Deps.length) {
          plugin(x);
          continue;
        }
        if (Deps.every(d => _.has(deps, d))) plugin(x);
      }

      if (count === 0)
        throw Error(`Deps defined conflict, ${Array.from(names)}`);
    }
  };

  return { load, loadDir, exec, auto, utils };
}

module.exports = DM;
