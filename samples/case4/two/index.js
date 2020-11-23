function Main(cnf, deps, _name, time) {
  const sayHi = () => "hi from two";

  return { sayHi };
}

module.exports = Main;
