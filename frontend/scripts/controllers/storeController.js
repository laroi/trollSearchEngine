define(['../config/config'], function (config) {
    var get,
        set;
    get = function (key) {
        return JSON.parse(localStorage.getItem('troller'))[key]
    };
    set = function (key, value) {
        var val = JSON.parse(localStorage.getItem('troller'));
        val[key] = value;
        localStorage.setItem('troller', val);
        return;
    };
    return {
        get: get,
        set: set
    }

})
