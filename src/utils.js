const fs = require("fs");

function Utils(_) {
  const utils = {
    /**
     * 文件名称到moduleName的转换
     * example, twe cases
     * case1. filename => filename
     * case2. file-name => fileName
     */
    file2Module(file) {
      return file.replace(/(-\w)/g, m => m[1].toUpperCase());
    },

    /**
     * 读取录下的所有模块，之后返回数组
     * params
     *   dir 要加载的目录
     *   exts 要加载的模块文件后缀，多个可以是数组, 默认为 coffee
     *   excludes 要排除的文件, 默认排除 index
     */
    readdir(dir, ext, exclude) {
      const exts = _.isString(ext) ? [ext] : ext;
      const excludes = _.isString(exclude) ? [exclude] : exclude;
      return _.chain(fs.readdirSync(dir))
        .map(x => x.split("."))
        .filter(
          x => _.includes(exts, x[1] || "") && !_.includes(excludes, x[0])
        )
        .map(x => x[0])
        .value();
    },

    /**
     * 兼容 es6 的 export
     */
    es6import(obj) {
      const isES6 = _.size(obj) === 1 && hasOwnProperty.call(obj, "default");
      return isES6 ? obj.default : obj;
    },

    /** 根据设置的路径，获取对象 */
    getModules(_path, exts, excludes) {
      const modules = {};

      if (!_.isString(_path)) return _path;
      if (!fs.existsSync(_path)) return modules;

      _.each(utils.readdir(_path, exts, excludes), file => {
        const name = utils.file2Module(file);
        /* eslint-disable global-require */
        /* eslint-disable import/no-dynamic-require */
        try {
          modules[name] = utils.es6import(require(`${_path}/${file}`));
        } catch (e) {
          console.error(_path, file, e);
        }
        /* eslint-enable import/no-dynamic-require */
        /* eslint-enable global-require */
      });

      return modules;
    },

    /** 深度加载目录 */
    deepGetModules(dir) {
      const obj = {};
      for (const x of fs.readdirSync(dir)) {
        const stat = fs.lstatSync(`${dir}/${x}`);
        if (stat.isFile()) {
          const arr = x.split(".");
          arr.pop();
          const name = arr.join(".");
          /* eslint-disable global-require */
          /* eslint-disable import/no-dynamic-require */
          obj[utils.file2Module(name)] = utils.es6import(
            require(`${dir}/${x}`)
          );
          /* eslint-enable import/no-dynamic-require */
          /* eslint-enable global-require */
        } else if (stat.isDirectory()) {
          const sub = utils.deepGetModules(`${dir}/${x}`);
          if (_.size(sub)) obj[utils.file2Module(x)] = sub;
        }
      }

      return obj;
    },

    /** 初始化模块, 包含加载和执行 */
    initModules(_path, exts, excludes, ...args) {
      const items = utils.getModules(_path, exts, excludes);
      const modules = {};
      for (const key of Object.keys(items)) {
        modules[key] = items[key](...args);
      }

      return modules;
    },

    /**
     * 提取一个对象上的方法
     * @memberof U
     * @params {object} object 要被提取的对象
     *
     * @return {array[path: string, fn: function]}
     */
    pickMethods(obj, _path = [], ret = []) {
      for (const key of Object.keys(obj)) {
        const newPath = _path.slice();
        newPath.push(key);
        if (_.isFunction(obj[key])) {
          ret.push([newPath.join("."), obj[key]]);
        } else {
          utils.pickMethods(obj[key], newPath, ret);
        }
      }
      return ret;
    }
  };

  return utils;
}

module.exports = Utils;
