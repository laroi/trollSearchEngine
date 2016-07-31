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
    //var html   = $(header).html();
    //console.log()
    headerTemplate = Handlebars.compile($(header).html());
    $('#content').append(headerTemplate());
    $('#create').on('click', createNewView.render);
    crossroads.addRoute('/', landingView.render());
})

});
