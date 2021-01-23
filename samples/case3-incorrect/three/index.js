function Main(cnf, deps, _name, time) {
  const sayHi = () => "hi from three";

  return { sayHi };
}

Main.Deps = ["two"];

module.exports = Main;
