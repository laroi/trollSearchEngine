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
requirejs(['views/landing/landing', 'controllers/userController', 'text!views/components/mainHeader.html', 'views/create/create','text!views/components/search.html'],
function (landingView, user, header, createNewView, search) {
var getSuggestion = function (field) {
    var url = '/api/suggestions?field='+field+'&query=';
    return function( request, response ) {
            $.ajax({
              type: 'GET',
              url: url+request,
              dataType: "json",
              success: function( data ) {
                var c = []
                $.map(data[field][0].options, function( item ) {
                  c.push(item.text);
                });
                response(c);
              }
            });
          }
};
var getBasicSuggestion = function () {
    var url = '/api/suggestions?&query=';
    return function( request, response ) {
            $.ajax({
              type: 'GET',
              url: url+request,
              dataType: "json",
              success: function( data ) {
                var c = []
                Object.keys(data).forEach(function(field){
                    $.map(data[field][0].options, function( item ) {
                      c.push(item.text + ' , ' + field);
                    });
                })
                /**/
                response(c);
              }
            });
          }
};
$(document).ready(function(){
    $.material.init();
    headerTemplate = Handlebars.compile($(header).html());
    var searchTemplate = Handlebars.compile($(search).html());
    $('#content').append(headerTemplate());
    $('#search-box').html(searchTemplate());
    $('#basic-search').typeahead({
        source: getBasicSuggestion(),
          updater: function(item) {
            return item.split(",")[0];
          }
    });
    $('#se_title').typeahead({
        source: getSuggestion('title'),
          updater: function(item) {
            return item;
          }
    });
    $('#search-drop').click(function(event){
        if ($(event.target).parent().parent().hasClass('typeahead') || $(event.target).parent().hasClass('typeahead')) {
            event.stopPropagation();
         }
     });
    $('#se_tag').typeahead({
        source: getSuggestion('tag'),
          updater: function(item) {
            return item;
          }
    });
    $('#se_movie').typeahead({
        source: getSuggestion('movie'),
          updater: function(item) {
            return item;
          }
    });
    $('#se_actor').typeahead({
        source: getSuggestion('actor'),
          updater: function(item) {
            return item;
          }
    });
    $('#se_character').typeahead({
        source: getSuggestion('character'),
          updater: function(item) {
            return item;
          }
    });
    $('#se_event').typeahead({
        source: getSuggestion('event'),
          updater: function(item) {
            return item;
          }
    });

    
    user.init();
    FB.init({
        appId      : '307608722910374',
        cookie     : true,  // enable cookies to allow the server to access 
                            // the session
        xfbml      : true,  // parse social plugins on this page
        version    : 'v2.5', // use graph api version 2.5,
        status: true
    });

    //var html   = $(header).html();
    //console.log()

    $('#create').on('click', createNewView.render);
    crossroads.addRoute('/', landingView.render(0));
})

});
