requirejs.config({
    //By default load any module IDs from js/lib
    baseUrl: 'scripts',
    //except, if the module ID starts with "app",
    //load it from the js/app directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    paths: {
        jquery: '../libs/jquery.min',
        bootstrap: '../libs/bootstrap.min',
        app: 'app',
        crossroads: '../libs/crossroads.min',
        signals: '../libs/signals',
        text: '../libs/text'
    }
});

// Start the main app logic.
requirejs(['views/landing/landing', 'text!views/components/mainHeader.html', 'views/create/create'],
function (landingView, header, createNewView) {
$(document).ready(function(){
    $.material.init();
    headerTemplate = Handlebars.compile($(header).html());
    $('#content').append(headerTemplate());
    function statusChangeCallback(response) {
        console.log(response);
    }
    var checkLoginState = function () {
        FB.getLoginStatus(function(response) {
            statusChangeCallback(response);
        });
    }
    $('#facebook_login').on('click', function(){
        checkLoginState();
    })
    FB.init({
        appId      : '307608722910374',
        cookie     : true,  // enable cookies to allow the server to access 
                            // the session
        xfbml      : true,  // parse social plugins on this page
        version    : 'v2.5' // use graph api version 2.5
    });

    //var html   = $(header).html();
    //console.log()

    $('#create').on('click', createNewView.render);
    crossroads.addRoute('/', landingView.render());
})

});
