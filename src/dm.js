/**
 * 初始化
 * @param String ext 加载的文件后缀
 *
 * @return Object dm
 */
function DM(_) {
  /**
   * 执行一个模块初始化
   * @param Function Main 模块函数
   * @param Array [args] 执行初始化的参数
   */
  const exec = (Main, args = []) => {
    if (Main.Before) {
      if (!_.isFunction(Main.Before)) throw Error(`Before must be a function`);
      args = Main.Before(...args);
    }
    // 这里考虑兼容ts的模式，ts下不便于直接export一个函数，将主函数命名为 main export
    const MainFn = Main.Main || Main.main || Main;
    if (!_.isFunction(MainFn)) throw Error(`Main must be a function`);
    const main = MainFn(...args);
    if (Main.After) {
      if (!_.isFunction(Main.After)) throw Error(`After must be a function`);
      Main.After(main, ...args);
    }

    return main;
  };

  /**
   * 全流程自动加载一个目录下的所有模块
   * @param Object modules 要执行初始化的模块字典 { [moduleName]: moduleFunction }
   * @param Object deps 接收执行后要挂载的对象 { [moduleName]: moduleFunction }
   * @param Array args 模块初始化传递的参数列表
   *
   * @return void
   */
  const auto = (modules, deps, args) => {
    // 获取全部即将初始化的模块名称，此时的 modules 是扁平的一级结构
    const names = new Set(Object.keys(modules));
    while (names.size) {
      // 记录此次迭代有多少个模块被排序了，如果某次迭代被排序的模块数量为0，
      // 那就要抛出异常了，说明依赖指定有问题，永远都不可能排序完毕
      let count = 0;
      /** 默认挂载函数 */
      const plugin = (name) => {
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
        if (Deps.every((d) => _.has(deps, d))) plugin(x);
      }

      if (count === 0) {
        const lacks = [];
        for (const x of names) {
          lacks.push(
            `${x}: ${_.filter(modules[x].Deps, (d) => !_.has(deps, d)).join(
              ","
            )}`
          );
        }
        throw Error(`Deps defined conflict, ${lacks.join(";")}`);
      }
    }
  };
  return { exec, auto };
}

module.exports = DM;
