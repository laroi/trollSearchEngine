define([
'../../controllers/requestController',
'../../controllers/storeController',
'../../controllers/urlController',
'../../controllers/userController',
'../../collections/requestCollection',
 'text!./requestlist.html'
], function (request, store, url, user, requestCollection, html) {
     var source   = $(html).html(),
        template = Handlebars.compile(source),
        render;
        var updateUi = function () {
        }
        var gotoHome = function () {
            url.navigate('landing');
        }
        let sendRequest = (e) => {



        }
        var requestListView = function () {
            var render;
            render = function (id) {
                requestCollection.getAllRequests({from:0}, false, (err, requests) => {
                    var html = template({requests: requests});
                    $('#request-contents').empty().append(html);
                    
                })
            }
            return {
                render: render
            }
        }
        return requestListView();
})
