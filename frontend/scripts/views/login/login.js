define([
'../../controllers/requestController',
'../../controllers/storeController',
'../../controllers/urlController',
'../../controllers/userController',
 'text!./login.html'
], function (request, store, url, user, html) {
     var source   = $(html).html(),
        template = Handlebars.compile(source),
        imageData;
       
        let login = () => {
            user.setToken(email, password, function(err, data) {
                if (err) {
                    console.error('Some error happened ', err);
                    toastr.error('Could not authenticate you', 'Troller Says')    
                }
            })
        }
        var loginView = function () {
            var render;
            render = function () {
                    var html = template();
                    $('#authModel').empty().append(html);
                    $('#login-modal').modal({show: true}); 
                    //$('#login-modal').on('hidden.bs.modal', gotoHome);
                    $('#btn-login').on('click', login)
            }
            return {
                render: render
            }
        }
        return loginView();
})
