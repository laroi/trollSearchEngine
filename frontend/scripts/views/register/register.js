define([
'../../controllers/requestController',
'../../controllers/storeController',
'../../controllers/urlController',
'../../controllers/userController',
 'text!./register.html'
], function (request, store, url, user, html) {
     var source   = $(html).html(),
        template = Handlebars.compile(source),
        imageData;
       
        let register = () => {
            user.setToken(email, password, function(err, data) {
                if (err) {
                    console.error('Some error happened ', err);
                    toastr.error('Could not authenticate you', 'Troller Says')    
                }
            })
        }
        var registerView = function () {
            var render;
            render = function () {
                    var html = template();
                    $('#authModel').empty().append(html);
                    $('#register-modal').modal({show: true}); 
                    //$('#login-modal').on('hidden.bs.modal', gotoHome);
                    $('#btn-register').on('click', login)
            }
            return {
                render: render
            }
        }
        return registerView();
})
