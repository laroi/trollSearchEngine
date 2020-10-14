//define(['../config/config'], function (config) {

import config from  '../config/config'
    var get,
        set;
    get = function (key) {
        return JSON.parse(localStorage.getItem('troller')|| "{}")[key]
    };
    set = function (key, value) {
        var val = JSON.parse(localStorage.getItem('troller') || '{}');
        val[key] = value;
        localStorage.setItem('troller', JSON.stringify(val));
        return;
    };



export default {get:get, set:set}
//})
