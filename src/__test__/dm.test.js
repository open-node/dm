const _ = require("lodash");
const DM = require("../dm");
const case1 = require("../../samples/case1");
const case2 = require("../../samples/case2-incorrect");
const case3 = require("../../samples/case3-incorrect");
const case4 = require("../../samples/case4");
const case5 = require("../../samples/case5-incorrect");
const case6 = require("../../samples/case6-incorrect");

describe("Dependency Injection Manager.", () => {
  describe("exec", () => {
    it("case1, no hooks", () => {
      const dm = DM(_);
      const Main = jest.fn();
      Main.mockReturnValueOnce({
        sayHi() {
          return "Hi";
        },
      });
      const main = dm.exec(Main);
      expect(main.sayHi()).toBe("Hi");
      expect(Main.mock.calls.length).toBe(1);
      expect(Main.mock.calls.pop()).toEqual([]);
    });

    it("case2, before hook only", () => {
      const dm = DM(_);
      const Main = jest.fn();
      Main.Before = jest.fn();
      Main.mockReturnValueOnce({
        sayHi() {
          return "Hi";
        },
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
      const dm = DM(_);
      const Main = jest.fn();
      Main.After = jest.fn();
      Main.mockReturnValueOnce({
        sayHi() {
          return "Hi";
        },
      });
      const main = dm.exec(Main);
      expect(main.sayHi()).toBe("Hi");

      expect(Main.After.mock.calls.length).toBe(1);
      expect(Main.After.mock.calls.pop()).toEqual([main]);

      expect(Main.mock.calls.length).toBe(1);
      expect(Main.mock.calls.pop()).toEqual([]);
    });

    it("case4, before And after hook both exists", () => {
      const dm = DM(_);
      const Main = jest.fn();
      Main.Before = jest.fn();
      Main.After = jest.fn();
      Main.Before.mockReturnValueOnce([1, 2, 3]);
      Main.mockReturnValueOnce({
        sayHi() {
          return "Hi";
        },
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
      const dm = DM(_);
      const deps = {};
      dm.auto(case1, deps, [{}, deps]);

      expect(deps.one.sayHi()).toBe("hi from one");
      expect(deps.two.sayHi()).toBe("hi from two");
      expect(deps.three.sayHi()).toBe("hi from three");
    });

    it("case2-incorrect", () => {
      const dm = DM(_);
      const deps = {};
      expect(() => {
        dm.auto(case2, deps, [{}, deps]);
      }).toThrow("Deps defined conflict");
    });

    it("case3-incorrect", () => {
      const dm = DM(_);
      const deps = {};
      expect(() => {
        dm.auto(case3, deps, [{}, deps]);
      }).toThrow("Deps defined conflict");
    });

    it("case6, module must be funciton", () => {
      const dm = DM(_);
      const deps = {};
      expect(() => {
        dm.auto(case5, deps, [{}, deps]);
      }).toThrow("Main must be a function");
    });

    it("case7, module hooks must be funciton", () => {
      const dm = DM(_);
      const deps = {};
      expect(() => {
        dm.auto(case6, deps, [{}, deps]);
      }).toThrow("Before must be a function");
    });
  });
});
