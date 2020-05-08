import "./css/styles.css";

// https://github.com/zloirock/core-js#babel
// import "core-js"; 
import "regenerator-runtime/runtime";

// import module_home from "./views/home";

// // module_home.load();

// const views = {

//     "home": module_home 
// }

// views["home"].load();

const xxx = [1,2,3,4];

const yyy = [99, ...xxx];

console.log(yyy);


(async () => {

    const module_home = await import("./views/home");

    console.log(module_home);

    module_home.load();



})()

class zzz {}