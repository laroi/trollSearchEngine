define(['../config/config', './storeController'], function (config, store) {
    var callView,
        get,
        post,
        put,
        del,
        getErrMsg;
    get = function (url, callback) {
        $.ajax({
            url: url, 
            method: 'GET',
            dataType: 'JSON',
            beforeSend: function (xhr){
                if (store.get('accessKey')) {
                    xhr.setRequestHeader('Authorization', store.get('accessKey'));
                }
            },
            success: function (data){
                callback(undefined, undefined, data);
            },
            error: function(xhr, status, err) {
                callback(getErrMsg(xhr.responseText), xhr.status);
            }
        }); 
    };
    del = function (url, callback) {
        $.ajax({
            url: url, 
            method: 'DELETE',
            dataType: 'JSON',
            beforeSend: function (xhr){
                if (store.get('accessKey')) {
                    xhr.setRequestHeader('Authorization', store.get('accessKey'));
                }
            },
            success: function (data){
                callback(undefined, data);
            },
            error: function(xhr, status, err) {
                callback(getErrMsg(xhr.responseText));
            }
        }); 
    }
    getImage = function (url, callback) {
        $.ajax({
            url: url, 
            method: 'GET',
            beforeSend: function (xhr){
                if (store.get('accessKey')) {
                    xhr.setRequestHeader('Authorization', store.get('accessKey'));
                }
            },
            success: function (data){
                callback(undefined, data);
            },
            error: function(xhr, status, err) {
                callback(getErrMsg(xhr.responseText));
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
            beforeSend: function (xhr){
                if (store.get('accessKey')) {
                    xhr.setRequestHeader('Authorization', store.get('accessKey'));
                }
            },
            success: function (data){
                callback(undefined, undefined, data);
            },
            error: function(xhr, status, err) {
                callback(getErrMsg(xhr.responseText), xhr.status);
            }
        }); 
    }
    _post = (url = ``, data = {}) => {
        // Default options are marked with *
        return fetch(url, {
            method: "POST", // *GET, POST, PUT, DELETE, etc.
                       
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                'Authorization': store.get('accessKey')
                // "Content-Type": "application/x-www-form-urlencoded",
            },
            body: JSON.stringify(data), // body data type must match "Content-Type" header
        })
        .then(response => response.json()) // parses response to JSON
        .catch(error => console.error('Error:', error))
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
            beforeSend: function (xhr){
                if (store.get('accessKey')) {
                    xhr.setRequestHeader('Authorization', store.get('accessKey'));
                }
            },
            success: function (data){
                callback(undefined, data);
            },
            error: function(xhr, status, err) {
                callback(getErrMsg(xhr.responseText), undefined);
            }
        }); 
    };
    putImage = function (url, postData, callback) {
        $.ajax({
            url: url, 
            method: 'PUT',
            data: postData,
            beforeSend: function (xhr){
                if (store.get('accessKey')) {
                    xhr.setRequestHeader('Authorization', store.get('accessKey'));
                }
            },
            success: function (data){
                callback(undefined, data);
            },
            error: function(xhr, status, err) {
                callback(getErrMsg(xhr.responseText), undefined);
            }
        }); 
    };
    put = function (url, postdata, contenttype, callback) {
        if (postdata) {       
            postdata = JSON.stringify(postdata);
        }
        $.ajax({
            url: url, 
            method: 'PUT',
            data: postdata,
            contentType: contenttype || "application/json; charset=utf-8",
            dataType: 'JSON',
            beforeSend: function (xhr){
                if (store.get('accessKey')) {
                    xhr.setRequestHeader('Authorization', store.get('accessKey'));
                }
            },
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
        del:del,
        postImage: postImage,
        getImage: getImage,
        putImage: putImage,
        _post: _post
    }

})
