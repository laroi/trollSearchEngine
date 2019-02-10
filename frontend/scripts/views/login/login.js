define([
'../../controllers/requestController',
'../../controllers/storeController',
'../../controllers/urlController',
'../../controllers/userController',
 'text!./login.html',
 'handlebars'
], function (request, store, url, user, html, Handlebars) {
     var source   = $(html).html(),
        template = Handlebars.compile(source);
        let moveFocus = (e) => {
            if (e.keyCode == 13) {
                $('#login-password').focus()
                return false; // prevent the button click from happening
            }
        }
        var loginView = function () {
            var render;
            render = function () {
                    var html = template();
                    $('#authModel').empty().append(html);
                    $('#login-modal').modal({show: true}); 
                    //$('#login-modal').on('hidden.bs.modal', gotoHome);
                    $('#btn-login').on('click', login)
                    require([ 'app/views/register/register'], (register) => {
                        let showReg = () => {
                            $('#login-modal').modal( 'hide' ).data( 'bs.modal', null );
                            register.render();
                        }
                        $('#btn-show-login').on('click', showReg);
                    })
                    $('#login-email').on("keypress", moveFocus);
                    require(['app/views/request/request'], (requestView) => {
                        let keyPressLogin = (e) => {
                            if (e.keyCode == 13) {
                                login();
                                return false; // prevent the button click from happening
                            }
                        }
                        var showRequest = (e) => {
                            requestView.render();
                        };
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
                                        url.navigate('landing', undefined, true);
                                        $('#request').on('click', showRequest);
                                    }
                                })
                            } else {
                                toastr.error('Please fill username and password', 'FTM Says')   
                            }
                        };
                        $('#login-password').on("keypress", keyPressLogin);
                    });
            }
            return {
                render: render
            }
        }
        return loginView();
})
