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
requirejs(['views/landing/landing', 'controllers/urlController', 'controllers/userController', 'text!views/components/mainHeader.html', 'views/create/create','text!views/components/search.html'],
function (landingView, url, user, header, createNewView, search) {
var getSuggestion = function (field) {
    var url = '/api/suggestions?field='+field+'&query=';
        return function( request, response ) {
                $.ajax({
                  type: 'GET',
                  url: url+(request.toLowerCase()),
                  dataType: "json",
                  success: function( data ) {
                    var c = []
                    $.map(data[field][0].options, function( item ) {
                      var reg = new RegExp(request, 'gi');
                      c.push(item.text.replace(reg, function(str) {return '<b>'+str+'</b>'}));
                    });
                    response(c);
                  }
              });
          }
};
var getBadge = function(field) {
    var className = 'badge-default';
    return '<span class="badge ' + className + 'badge-pill"> ' + field + '</span>'
}
var getBasicSuggestion = function () {
    var url = '/api/suggestions?&query=';
    return function( request, response ) {
            $.ajax({
              type: 'GET',
              url: url+(request.toLowerCase()),
              dataType: "json",
              success: function( data ) {
                var c = []
                Object.keys(data).forEach(function(field){
                    $.map(data[field][0].options, function( item ) {
                      var reg = new RegExp(request, 'gi');
                      c.push({text: item.text.replace(reg, function(str) {return '<b>'+str+'</b>'}), field: field});
                    });
                })
                /**/
                console.log(c);
                response(c);
              }
            });
          }
};
if (!Array.prototype.find) {
  Array.prototype.find = function (callback, thisArg) {
    "use strict";
    var arr = this,
        arrLen = arr.length,
        i;
    for (i = 0; i < arrLen; i += 1) {
        if (callback.call(thisArg, arr[i], i, arr)) {
            return arr[i];
        }
    }
    return undefined;
  };
}
$(document).ready(function(){

    headerTemplate = Handlebars.compile($(header).html());
    var searchTemplate = Handlebars.compile($(search).html());
    $('#content').append(headerTemplate());
    $('.drop-form').html(searchTemplate());
    $.material.init();
    $("#s1").dropdown({"optionClass": "withripple"});
    $('.dropdown-menu').click(function(e) {
        e.stopPropagation();
    });
   /* $('#basic-search').typeahead({
        source: getBasicSuggestion(),
        display:'text',
          updater: function(item) {
            return item;
          }
    });*/
        $('#basic-search').typeahead({
        source: getBasicSuggestion(),
        displayText: function (text){
            return text.text + ' ' + getBadge(text.field);
        },
        highlighter: Object,
            afterSelect: function(item) { $('#basic-search').val(item.text).change(); }
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
window.fbAsyncInit = function() {
    FB.init({
      appId      : '307608722910374',
      cookie     : true,
      xfbml      : true,
      version    : 'v2.8'
    });
    FB.AppEvents.logPageView();   
  };

  (function(d, s, id){
     var js, fjs = d.getElementsByTagName(s)[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement(s); js.id = id;
     js.src = "//connect.facebook.net/en_US/sdk.js";
     fjs.parentNode.insertBefore(js, fjs);
   }(document, 'script', 'facebook-jssdk'));

    //var html   = $(header).html();
    //console.log()

    $('#create').on('click', createNewView.render);
    crossroads.addRoute('/#{?query}', landingView.render);
    window.onhashchange = function(){
       crossroads.parse(window.location.hash)
    };
    crossroads.parse(window.location.hash)
    url.navigate();
    
})

});
