
import request from '../controllers/requestController';
import store from '../controllers/storeController';

    var updateUser = function (updateObj, callback) {
        var url = '/api/user/'+store.get('userId');
        request.put(url, updateObj, function(err, data) {
            callback(err, data);
        })
    };
    var setToken = function(email, password, callback) {
        if (email && password) {
            request.post('/api/token', {email: email, password:password}, function(err, status, resp){
                if (!err && resp.token) {
                    store.set('accessKey', resp.token);
                    store.set('userId', resp.user._id);
                    store.set('username', resp.user.name);
                    store.set('email', resp.user.email);
                    store.set('stars', resp.user.stars);
                    store.set('picture', resp.user.picture);
                    store.set('userType', resp.user.type);
                    enableFeatures();
                    //$('#request').on('click', showRequest); 
                    callback(err, resp.user);
                } else {
                    callback('Login not successful');
                }
          });
      } else {
        console.log('incorrect data', email, password);
        callback('Could not authenticate');
      }
    };
    var unsetToken = function(accessKey, callback) {
        request.del('/api/token/'+accessKey, function(err, data) {
            if (!err) {
                localStorage.clear();
                disableFeatures()                
                callback();
            } else {
                console.error(err);
                callback(err);
            }
        })
    };
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
             $('#request').css('color', '#555');
             $('#request').css('cursor', 'pointer');
             $('.fb_login').hide();
             $('.logut').show();
             //$('.user-photo').attr('src', store.get('picture'));
             
	     if (store.get('picture')) {
		$('.user-icon').removeClass('fa-user-circle')
             	$('.user-icon').removeClass('far')
             	$('.user-icon').css('background-image', 'url('+encodeURIComponent(store.get('picture').thumb)+')')
	     }
             $('.user-name').text(store.get('username'))
             $('#about_us').parent().css('border-bottom', '1px solid #555');
             //landingView.render({});       
        }
        var disableFeatures = function(){
            $('#create').hide();
            $('.fb_login').show();
            $('.isFavorite').prop("disabled", true)
            $('.isMine').prop("disabled", true);
            $('.logut').hide();
            $('.user-name').text('You')
            $('.user-icon').css('background-image', 'none') 
            $('.user-icon').addClass('fa-user-circle')
             $('.user-icon').addClass('far')
             $('#request').css('color', 'grey');
             $('#request').css('cursor', 'not-allowed');
             $('#request').off('click');
             $('#about_us').parent().css('border-bottom', 'none');
            disableAdminFeatures();
            //landingView.render({})       
        }
        var disableAdminFeatures = function () {
            $( ".isApproved" ).closest( "li" ).hide();
        }
        
        var enableAdminFeatures = function () {
            $( ".isApproved" ).closest( "li" ).show();
        }

    
    export default {
        setToken: setToken,
        updateUser: updateUser,
        disableFeatures: disableFeatures,
        enableFeatures:enableFeatures,
        unsetToken:unsetToken
    }

