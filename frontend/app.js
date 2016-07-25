requirejs.config({
    //By default load any module IDs from js/lib
    baseUrl: 'libs',
    //except, if the module ID starts with "app",
    //load it from the js/app directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    paths: {
        jquery: 'jquery.min',
        bootstrap: 'bootstrap.min',
        app: 'app',
        crossroads: 'crossroads.min',
        signals: 'signals'
    }
});

// Start the main app logic.
requirejs([],
function (landingView) {
jquery.document.ready(function(){})
    crossroads.addRoute('/', landingView.render());
});
