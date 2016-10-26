define(['../config/config'], function (config) {
    var callView,
        get,
        post,
        put,
        getErrMsg;
    get = function (url, callback) {
        $.ajax({
            url: url, 
            method: 'GET',
            dataType: 'JSON',
            success: function (data){
                callback(undefined, data);
            },
            error: function(xhr, status, err) {
                callback(getErrMsg(xhr.responseText), undefined);
            }
        }); 
    }
    post = function (url, postdata,  callback) {
        $.ajax({
            url: url, 
            method: 'POST',
            data: JSON.stringify(postdata),
            dataType: 'JSON',
            contentType: "application/json; charset=utf-8",
            success: function (data){
                callback(undefined, data);
            },
            error: function(xhr, status, err) {
                callback(getErrMsg(xhr.responseText), undefined);
            }
        }); 
    }
    getErrMsg = function (msg) {
    var ret_msg;
        try {
            ret_msg = JSON.parse(msg);
        }
        catch (e) {
            ret_msg = e;
        }
        return ret_msg;
    };
    postImage = function (url, postdata,  callback) {
        $.ajax({
            url: url, 
            method: 'POST',
            data: postdata,
            success: function (data){
                callback(undefined, data);
            },
            error: function(xhr, status, err) {
                callback(getErrMsg(xhr.responseText), undefined);
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
                callback(getErrMsg(xhr.responseText), undefined);
            }
        }); 
    }
    return {
        get: get,
        post: post,
        put: put,
        postImage: postImage
    }

})
