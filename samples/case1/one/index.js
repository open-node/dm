function Main(cnf, deps, _name, time) {
  if (!deps.two || !deps.three) throw Error("Lack two/three dependency");

  const sayHi = () => "hi from one";

  return { sayHi };
}

Main.Deps = ["two", "three"];
Main.Alias = ["_one", "1"];

module.exports = Main;
