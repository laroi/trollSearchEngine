define([
'../../controllers/requestController',
'../../controllers/storeController',
'../../controllers/urlController',
'../../controllers/userController',
 'text!./request.html'
], function (request, store, url, user, html) {
     var source   = $(html).html(),
        template = Handlebars.compile(source),
        render;
        var updateUi = function () {
         $('#request-meme').modal({show: true}); 
        }
        var gotoHome = function () {
            url.navigate('landing');
        }
        var requestView = function () {
            var render;
            render = function (id) {
                    var html = template();
                    $('#requestModel').empty().append(html);
                    updateUi();
                    $('#request-meme').on('hidden.bs.modal', gotoHome)          
            }
            return {
                render: render
            }
        }
        return requestView();
})
