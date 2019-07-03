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
                callback(undefined, data);
            },
            error: function(xhr, status, err) {
                callback(getErrMsg(xhr.responseText), xhr.status);
            }
        }); 
    };
    let getImage = (url, filename, action) => {
        if (!url) {
            return Promise.reject('No url');
        }
        if (action === 'download') {
            return fetch(url + '?action='+action)
            .then(function(res){
              return res.blob()
            })
            .then(function(blob){
                var a = document.createElement('a');
                var url = window.URL.createObjectURL(blob);
                a.href = url;
                a.download = '"'+filename+'".jpg';
                document.body.appendChild(a);
                a.click();
                a.remove();
                //window.URL.revokeObjectURL(url);
                return
            })
            .catch((err) =>  {
                return Promise.reject(err)
            })
        } else if (action === 'share') {
             return fetch(url + '?action='+action)
            .then(function(res){
              return res.blob()
            })
            .then(function(blob){
                filename = filename+'.jpg';
                console.log(filename, blob.type)
                //return new File([blob], filename, {type: blob.type, lastModified: new Date()});            
                return new File(["test"], 'test.txt', {type: 'text/plain'});            
            })
            .catch((err) =>  {
                return Promise.reject(err)
            })
        }
        
        /*return new Promise ((resolve, reject)=> {
            $.ajax({
                url: url,
                method: 'GET',
                xhrFields: {
                    responseType: 'blob'
                },
                beforeSend: function (xhr){
                    if (store.get('accessKey')) {
                        xhr.setRequestHeader('Authorization', store.get('accessKey'));
                    }
                },
                success: function (data) {
                    var a = document.createElement('a');
                    var url = window.URL.createObjectURL(data);
                    a.href = url;
                    console.log(url);
                    //a.download = 'myfile.pdf';
                    a.click();
                    window.URL.revokeObjectURL(url);
                    resolve()
                },
                error: function(xhr, status, err) {
                    reject(getErrMsg(xhr.responseText), xhr.status);
                }
            });
        })*/    
    }
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
    /*getImage = function (url, callback) {
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
    } */
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
    put = function (url, postdata, callback) {
        if (postdata) {       
            postdata = JSON.stringify(postdata);
        }
        $.ajax({
            url: url, 
            method: 'PUT',
            data: postdata,
            contentType: "application/json; charset=utf-8",
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
