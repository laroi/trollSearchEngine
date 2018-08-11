define([
'../../controllers/requestController',
'../../controllers/storeController',
'../../controllers/urlController',
'../../controllers/userController',
'scripts/views/request/request',
 'text!./login.html',
 '../register/register'
], function (request, store, url, user, requestView, html, register) {
     var source   = $(html).html(),
        template = Handlebars.compile(source);
       
        let login = () => {
            let email = $('#login-email').val().trim(),
                password = $('#login-password').val().trim();
            if (email && password) {            
                user.setToken(email, password, function(err, data) {
                    if (err) {
                        console.error('Some error happened ', err);
                        toastr.error('Could not authenticate you', 'Troller Says')    
                    } else {
                        $('#login-modal').modal( 'hide' ).data( 'bs.modal', null );
                        url.navigate('landing', true);
                        $('#request').on('click', showRequest);
                    }
                })
            } else {
                toastr.error('Please fill username and password', 'FTM Says')   
            }
        };
        var showRequest = (e) => {
                requestView.render();
            };
        let showReg = () => {
            $('#login-modal').modal( 'hide' ).data( 'bs.modal', null );
           register.render();
        }
        
        var loginView = function () {
            var render;
            render = function () {
                    var html = template();
                    $('#authModel').empty().append(html);
                    $('#login-modal').modal({show: true}); 
                    //$('#login-modal').on('hidden.bs.modal', gotoHome);
                    $('#btn-login').on('click', login)
                    $('#btn-show-login').on('click', showReg);
                   
            }
            return {
                render: render
            }
        }
        return loginView();
})
