"use strict";

import * as ZOMBI from "../js/zombi";

let started = false;

let me = null;

const render = (view, params, fragment) => {

    me = view;
    
    ZOMBI.log(`I am a module! ${JSON.stringify(params)}, running on ${me}`, `VIEW:${me}`);

    if(started) {

        ZOMBI.log(`I was already started`, `VIEW:${me}`);


    } else {


        ZOMBI.log(`This is the first time I run`, `VIEW:${me}`);

    }

    started = true;

}

const hide = (view, params, fragment) => {

    ZOMBI.log(`You are going ${me} -> ${view}`, `VIEW:${me}`);

}

const reload = (params) => {

    ZOMBI.log(`You are reloading ${me}`);

}

export default { render, hide, reload };

