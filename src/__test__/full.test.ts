import DM = require("../dm");
import _ = require("lodash");

describe("exec", () => {
  const dm = DM(_);
  type Gender = "male" | "female";
  interface MainInterface {
    get: () => { name: string; gender: Gender };
  }

  const Main = jest.fn((name: string, gender: Gender): MainInterface => {
    const get = () => ({
      name,
      gender
    });

    return { get } as MainInterface;
  });

  const Before = jest.fn((name: string, gender: Gender): [string, Gender] => {
    return [name + " Zhao", gender];
  });

  interface MainInterface {
    print: () => string;
  }

  const After = jest.fn((main: ReturnType<typeof Main>, name: String, gender: Gender) => {
    const print = () => {
      const { name, gender } = main.get();
      return `Name: ${name}, Gender: ${gender}`;
    };

    Object.assign(main, { print });
  });

  it("case1.1", () => {
    const main = dm.exec(Main, undefined, undefined, ["redstone", "male"]);
    expect(main.get()).toEqual({ name: "redstone", gender: "male" });
    expect(Main.mock.calls.length).toBe(1);
    expect(Main.mock.calls.pop()).toEqual(["redstone", "male"]);
    expect(Before.mock.calls.length).toBe(0);
    expect(After.mock.calls.length).toBe(0);
  });

  it("case1.2", () => {
    const main = dm.exec(Main, Before, undefined, ["redstone", "male"] as [string, Gender]);
    expect(main.get()).toEqual({ name: "redstone Zhao", gender: "male" });
    expect(Main.mock.calls.length).toBe(1);
    expect(Main.mock.calls.pop()).toEqual(["redstone Zhao", "male"]);
    expect(Before.mock.calls.length).toBe(1);
    expect(Before.mock.calls.pop()).toEqual(["redstone", "male"]);
    expect(Before.mock.results.pop()).toEqual({ type: "return", value: ["redstone Zhao", "male"] });
    expect(After.mock.calls.length).toBe(0);
  });

  it("case1.3", () => {
    const main = dm.exec(Main, Before, After, ["redstone", "male"] as [string, Gender]);
    expect(Main.mock.calls.length).toBe(1);
    expect(Main.mock.calls.pop()).toEqual(["redstone Zhao", "male"]);
    expect(Before.mock.calls.length).toBe(1);
    expect(Before.mock.calls.pop()).toEqual(["redstone", "male"]);
    expect(Before.mock.results.pop()).toEqual({ type: "return", value: ["redstone Zhao", "male"] });
    expect(After.mock.calls.length).toBe(1);
    expect(After.mock.calls.pop()).toEqual([main, "redstone Zhao", "male"]);
    console.log(main.print());
    expect(main.print()).toMatch("redstone Zhao");
  });
});
