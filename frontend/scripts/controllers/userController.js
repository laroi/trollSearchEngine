define(['./requestController', './storeController'], function (request, store) {

    var enableFeatures = function(){
         $('#create').show();
    }
    var disableFeatures = function(){
        $('#create').hide();
    }
    var regNewUser = function(userId, token, callback) {
        var url = 'https://graph.facebook.com/me?fields=id,name,picture,email,gender&access_token=' + token;
        request.get(url, function(err, data) {
            var postData = {
                fbId: data.id,
                name: data.name,
                picture: data.picture.data.url,
                gender: data.gender,
                email: data.email
            };
            request.post('/api/user', postData, function(err, data){
                callback(err, data);
            });
        })
    }
    var setToken = function(authResp, callback) {
        request.post('/api/token', {authResponse: authResp}, function(err, status, resp){
        if (err) {
            if (status === 404) {
                regNewUser(authResp.userId, authResp.accessToken, function(regErr, regData){
                if (!regErr) {
                        store.set('accessKey', authResp.accessToken);
                        store.set('userID', authResp.userID);
                        store.set('username', regData.username);
                        store.set('stars', regData.stars);
                        store.set('picture', regData.picture);
                    }
                    callback(regErr, regData);
                })
            } else {
                callback(err);
            }
        } else {
            store.set('accessKey', authResp.accessToken);
            store.set('userID', authResp.userID);
            request.post('/api'+resp.user, function(userErr, userData) {
                if (!userErr) {
                    store.set('username', userData.username);
                    store.set('stars', userData.stars);
                    store.set('picture', userData.picture);
                    callback();
                } else {
                    callback(userErr);
                }            
            });
        }
      });
    };
    var isUserLoggedIn = function() {
        var acessKey = store.get('accessKey'),
        isLoggedIn = false;
        if (acessKey) {
            isLoggedIn = true;
        }
        return isLoggedIn;
    }
    var init = function() {
        if (isUserLoggedIn()) {
            enableFeatures()
        } else {
            disableFeatures();
            $('#facebook_login').on('click', function(){
                FB.getLoginStatus(function(response) {
                  if (response.status === 'connected') {
                    setToken(response.authResponse, function(err){
                        if (!err) {
                            enableFeatures();
                        }
                    });
                  } else {
                    disableFeatures();
                    FB.login(function(res) {
                        if (res.status === 'connected') {
                           setToken(response.authResponse, function(err){
                                if (!err) {
                                    enableFeatures();
                                }
                            });
                        }
                    
                    });
                  }
                });

            });
        }
    }
    return {
        init: init
    }
});
