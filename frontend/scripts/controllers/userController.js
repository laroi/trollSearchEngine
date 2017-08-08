define(['./requestController', './storeController'], function (request, store) {

    var enableFeatures = function(){
         $('#create').show();
         $('#facebook_login').hide();
         $('.isFavorite').prop("disabled", false)
         $('.isMine').prop("disabled", false) 
         if (store.get('userType') === 'admin') {
            enableAdminFeatures();
         } else {
            disableAdminFeatures();
         }                
    }
    var disableFeatures = function(){
        $('#create').hide();
        $('#facebook_login').show();
        $('.isFavorite').prop("disabled", true)
        $('.isMine').prop("disabled", true);
        disableAdminFeatures();           
    }
    var disableAdminFeatures = function () {
        $( ".isApproved" ).closest( "li" ).hide();
    }
    
    var enableAdminFeatures = function () {
        $( ".isApproved" ).closest( "li" ).show();
    }
    var regNewUser = function(userId, token, callback) {
        var url = 'https://graph.facebook.com/me?fields=id,name,picture,email,gender&access_token=' + token;
        request.get(url, function(err, data) {
            var postData = {
                fbId: data.id,
                name: data.name,
                picture: data.picture.data.url,
                gender: data.gender,
                email: data.email,
                accessToken: token
            };
            request.post('/api/user', postData, function(err, status, data){
                callback(err, data);
            });
        })
    }
    var updateUser = function (updateObj, callback) {
        var url = '/api/user/'+store.get('userId');
        request.put(url, updateObj, undefined, function(err, data) {
            callback(err, data);
        })
    };
    var setToken = function(authResp, callback) {
        if (authResp && Object.keys(authResp).length > 0) {
            request.post('/api/token', {authResponse: authResp}, function(err, status, resp){
            if (err) {
                if (status === 404) {
                    regNewUser(authResp.userID, authResp.accessToken, function(regErr, regData){
                    if (!regErr && regData) {
                            store.set('accessKey', authResp.accessToken);
                            store.set('fbId', authResp.userID);
                            store.set('username', regData.user.username);
                            store.set('stars', regData.user.stars);
                            store.set('picture', regData.user.picture);
                            store.set('email', regData.user.email);
                            store.set('userType', regData.user.type);
                            store.set('userId', regData.user._id);
                        }
                        callback(regErr, regData.user);
                    })
                } else {
                    callback(err);
                }
            } else {
                if (authResp.accessToken && authResp.userID) {
                    store.set('accessKey', authResp.accessToken);
                    store.set('fbId', authResp.userID);
                    request.get('/api'+resp.user, function(userErr, userData) {
                        if (!userErr) {
                            store.set('userId', userData._id);
                            store.set('username', userData.name);
                            store.set('email', userData.email);
                            store.set('stars', userData.stars);
                            store.set('picture', userData.picture);
                            store.set('userType', userData.type);
                            callback(userErr, userData);
                        } else {
                            callback(userErr);
                        }            
                    });
                } else {
                    callback('Facebook Login not successful');
                }
            }
          });
      } else {
        console.log('auth resp not found', authResp);
        callback('Could not authenticate');
      }
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
                        setToken(response.authResponse, function(err, data){
                            if (!err && data) {
                                enableFeatures();
                            } else {
                                console.error('Some error happened ', err);
                                toastr.error('Could not authenticate you', 'Torller Says')
                            }
                        });
                      } else {
                        disableFeatures();
                        FB.login(function(res) {
                            if (res.status === 'connected') {
                               setToken(response.authResponse, function(err, data){
                                    if (!err && data) {
                                        enableFeatures();
                                    } else {                                    
                                        console.error('Some error happened ', err);
                                        toastr.error('Could not authenticate you', 'Troller Says')                                 
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
        init: init,
        updateUser: updateUser
    }
});
