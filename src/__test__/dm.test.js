const DM = require("../dm");

describe("Dependency Injection Manager.", () => {
  describe("exec", () => {
    it("case1, no hooks", () => {
      const dm = DM();
      const Main = jest.fn();
      Main.mockReturnValueOnce({
        sayHi() {
          return "Hi";
        }
      });
      const main = dm.exec(Main);
      expect(main.sayHi()).toBe("Hi");
      expect(Main.mock.calls.length).toBe(1);
      expect(Main.mock.calls.pop()).toEqual([]);
    });

    it("case2, before hook only", () => {
      const dm = DM();
      const Main = jest.fn();
      Main.Before = jest.fn();
      Main.mockReturnValueOnce({
        sayHi() {
          return "Hi";
        }
      });
      Main.Before.mockReturnValueOnce([1, 2, 3]);
      const main = dm.exec(Main);
      expect(main.sayHi()).toBe("Hi");

      expect(Main.Before.mock.calls.length).toBe(1);
      expect(Main.Before.mock.calls.pop()).toEqual([]);

      expect(Main.mock.calls.length).toBe(1);
      expect(Main.mock.calls.pop()).toEqual([1, 2, 3]);
    });

    it("case3, after hook only", () => {
      const dm = DM();
      const Main = jest.fn();
      Main.After = jest.fn();
      Main.mockReturnValueOnce({
        sayHi() {
          return "Hi";
        }
      });
      const main = dm.exec(Main);
      expect(main.sayHi()).toBe("Hi");

      expect(Main.After.mock.calls.length).toBe(1);
      expect(Main.After.mock.calls.pop()).toEqual([main]);

      expect(Main.mock.calls.length).toBe(1);
      expect(Main.mock.calls.pop()).toEqual([]);
    });

    it("case4, before And after hook both exists", () => {
      const dm = DM();
      const Main = jest.fn();
      Main.Before = jest.fn();
      Main.After = jest.fn();
      Main.Before.mockReturnValueOnce([1, 2, 3]);
      Main.mockReturnValueOnce({
        sayHi() {
          return "Hi";
        }
      });
      const main = dm.exec(Main);
      expect(main.sayHi()).toBe("Hi");

      expect(Main.Before.mock.calls.length).toBe(1);
      expect(Main.Before.mock.calls.pop()).toEqual([]);

      expect(Main.After.mock.calls.length).toBe(1);
      expect(Main.After.mock.calls.pop()).toEqual([main, 1, 2, 3]);

      expect(Main.mock.calls.length).toBe(1);
      expect(Main.mock.calls.pop()).toEqual([1, 2, 3]);
    });
  });

  describe("auto", () => {
    it("case1", () => {
      const dm = DM();
      const deps = {};
      dm.auto(`${__dirname}/../../samples/case1/`, new Set(), deps, [{}, deps]);

      expect(deps.one).toBe(deps["1"]);
      expect(deps._one).toBe(deps["1"]);
      expect(deps.three).toBe(deps["3"]);

      expect(deps.one.sayHi()).toBe("hi from one");
      expect(deps.two.sayHi()).toBe("hi from two");
      expect(deps.three.sayHi()).toBe("hi from three");
    });

    it("case2-incorrect", () => {
      const dm = DM();
      const deps = {};
      expect(() => {
        dm.auto(`${__dirname}/../../samples/case2-incorrect/`, new Set(), deps, [{}, deps]);
      }).toThrow("Deps defined conflict");
    });

    it("case3-incorrect", () => {
      const dm = DM();
      const deps = {};
      expect(() => {
        dm.auto(`${__dirname}/../../samples/case3-incorrect/`, new Set(), deps, [{}, deps]);
      }).toThrow("Name two duplicate");
    });

    it("case4, add ignores", () => {
      const dm = DM();
      const deps = {};
      expect(() => {
        dm.auto(`${__dirname}/../../samples/case1/`, new Set(["two"]), deps, [{}, deps]);
      }).toThrow("Deps defined conflict");
    });

    it("case5, file will be ignored, module must be directory", () => {
      const dm = DM();
      const deps = {};
      dm.auto(`${__dirname}/../../samples/case4/`, undefined, deps, [{}, deps]);

      expect(deps.one).toBe(deps["1"]);
      expect(deps._one).toBe(deps["1"]);
      expect(deps.three).toBe(deps["3"]);

      expect(deps.one.sayHi()).toBe("hi from one");
      expect(deps.two.sayHi()).toBe("hi from two");
      expect(deps.three.sayHi()).toBe("hi from three");
    });

    it("case6, module must be funciton", () => {
      const dm = DM();
      const deps = {};
      expect(() => {
        dm.auto(`${__dirname}/../../samples/case5-incorrect/`, new Set(["two"]), deps, [{}, deps]);
      }).toThrow("required isnt function");
    });

    it("case7, module hooks must be funciton", () => {
      const dm = DM();
      const deps = {};
      expect(() => {
        dm.auto(`${__dirname}/../../samples/case6-incorrect/`, new Set(["two"]), deps, [{}, deps]);
      }).toThrow("required isnt function");
    });
  });
});
