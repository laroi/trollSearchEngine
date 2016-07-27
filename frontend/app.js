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
requirejs(['views/landing/landing'],
function (landingView) {
$(document).ready(function(){})
    crossroads.addRoute('/', landingView.render());
});
