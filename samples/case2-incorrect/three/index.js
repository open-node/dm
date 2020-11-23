function Main(cnf, deps, _name, time) {
  const sayHi = () => "hi from three";

  return { sayHi };
}

Main.Deps = ["two"];
Main.Alias = ["3"];

module.exports = Main;
