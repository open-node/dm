function Main(cnf, deps) {
  if (!deps.two || !deps.three) throw Error("Lack two/three dependency");

  const sayHi = () => "hi from one";

  return { sayHi };
}

Main.Deps = ["two", "three"];

module.exports = Main;
