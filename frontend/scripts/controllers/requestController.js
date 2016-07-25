define(['../config/config'], function (config) {
    var callView,
        get,
        post,
        put;
    get = function (url, callback) {
        $.ajax({
            url: url, 
            method: 'GET',
            dataType: 'JSON',
            success: function (data){
                callback(undefined, data);
            },
            error: function(xhr, status, err) {
                callback(JSON.parse(xhr.responseText), undefined);
            }
        }); 
    }
    post = function (url, postdata, callback) {
        $.ajax({
            url: url, 
            method: 'POST',
            data: postdata,
            dataType: 'JSON',
            contentType: "application/json; charset=utf-8",
            success: function (data){
                callback(undefined, data);
            },
            error: function(xhr, status, err) {
                callback(JSON.parse(xhr.responseText), undefined);
            }
        }); 
    }
    put = function (url, postdata, contenttype, callback) {
        $.ajax({
            url: url, 
            method: 'PUT',
            data: postdata,
            contentType: contenttype || "application/json; charset=utf-8",
            dataType: 'JSON',
            success: function (data){
                callback(undefined, data);
            },
            error: function(xhr, status, err) {
                callback(JSON.parse(xhr.responseText), undefined);
            }
        }); 
    }
    return {
        get: get,
        post: post,
        put: put
    }

})
