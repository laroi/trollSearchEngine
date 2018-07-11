let init = () => {
requirejs.config({
            //By default load any module IDs from js/lib
            baseUrl: 'scripts',
            //except, if the module ID starts with "app",
            //load it from the js/app directory. paths
            //config is relative to the baseUrl, and
            //never includes a ".js" extension since
            //the paths config could be for a directory.
            waitSeconds : 0,
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
        requirejs([
            'views/landing/landing',
            'views/detail/detail',
            'controllers/urlController',
            'controllers/userController',
            'controllers/storeController',
            'text!views/components/mainHeader.html',
            'views/create/create',
            'views/request/request',
            'views/aboutus/aboutus',
            'text!views/components/search.html'
        ],
        function (landingView, detailView, url, user, store, header, createNewView, requestView, aboutView, search) {
        String.prototype.capitalize = function() {
            return this.charAt(0).toUpperCase() + this.slice(1);
        }
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
                            c = c.filter(function(elem, index, self) {
                              return index === self.indexOf(elem);
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
                       c = c.filter(function(obj, pos, arr) {
                                return arr.map(function(mapObj) {return mapObj['text']}).indexOf(obj['text']) === pos;
                                
                                })
                        response(c);
                      }
                    });
                  }
        };
        var afterSelect  = function (element) {
            return function(item) { var item = item.text || item; element.val(item.replace(/<b>/g, '').replace(/<\/b>/g, '')).change(); }
        }
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
                afterSelect: afterSelect($('#basic-search'))
            });
            $('#se_title').typeahead({
                source: getSuggestion('title'),
                  updater: function(item) {
                    return item;
                  },
                  afterSelect: afterSelect($('#se_title'))
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
                  },
                  afterSelect: afterSelect($('#se_tag'))
            });
            $('#se_movie').typeahead({
                source: getSuggestion('movie'),
                  updater: function(item) {
                    return item;
                  },
                  afterSelect: afterSelect($('#se_movie'))
            });
            $('#se_actor').typeahead({
                source: getSuggestion('actor'),
                  updater: function(item) {
                    return item;
                  },
                  afterSelect: afterSelect($('#se_actor'))
            });
            $('#se_character').typeahead({
                source: getSuggestion('character'),
                  updater: function(item) {
                    return item;
                  },
                  afterSelect: afterSelect($('#se_character'))
            });
            $('#se_event').typeahead({
                source: getSuggestion('event'),
                  updater: function(item) {
                    return item;
                  },
                  afterSelect: afterSelect($('#se_event'))
            });
            var enableFeatures = function(){
                 $('#create').show();
                 $('#facebook_login').hide();
                 $('.isFavorite').prop("disabled", false)
                 $('.isMine').prop("disabled", false) 
                 if (store.get('userType') === 'admin') {
                    enableAdminFeatures();
                 } else {
                    disableAdminFeatures();
                 }
                 $('#request').css('color', '#555');
                 $('#request').css('cursor', 'pointer');
                 $('.fb_login').hide();
                 $('.logut').show();
                 //$('.user-photo').attr('src', store.get('picture'));
                 $('.user-icon').removeClass('fa-user-circle')
                 $('.user-icon').removeClass('far')
                 $('.user-icon').css('background-image', 'url('+encodeURIComponent(store.get('picture'))+')')
                 $('.user-name').text(store.get('username'))
                 $('#about_us').parent().css('border-bottom', '1px solid #555');
                 landingView.render({});       
            }
            var disableFeatures = function(){
                $('#create').hide();
                $('.fb_login').show();
                $('.isFavorite').prop("disabled", true)
                $('.isMine').prop("disabled", true);
                $('.logut').hide();
                $('.user-name').text('You')     
                $('.user-photo').attr('src', store.get('/image/user.png'));
                 $('#request').css('color', 'grey');
                 $('#request').css('cursor', 'not-allowed');
                 $('#request').off('click');
                 $('#about_us').parent().css('border-bottom', 'none');
                disableAdminFeatures();
                landingView.render({});         
            }
            var disableAdminFeatures = function () {
                $( ".isApproved" ).closest( "li" ).hide();
            }
            
            var enableAdminFeatures = function () {
                $( ".isApproved" ).closest( "li" ).show();
            }
            var isUserLoggedIn = function() {
                var acessKey = store.get('accessKey'),
                isLoggedIn = false;
                if (acessKey) {
                    isLoggedIn = true;
                }
                return isLoggedIn;
            }
            var showRequest = (e) => {
                requestView.render();
            }
            var fblogin = function(e){
                FB.getLoginStatus(function(response) {                 
                      if (response.status === 'connected') {
                        user.setToken(response.authResponse, function(err, data){
                            if (!err && data) {
                                enableFeatures();
                                $('#request').on('click', showRequest);                                
                            } else {
                                console.error('Some error happened ', err);
                                toastr.error('Could not authenticate you', 'Torller Says')
                            }
                        });
                      } else {
                        disableFeatures();
                        FB.login(function(res) {
                            if (res.status === 'connected') {
                               user.setToken(response.authResponse, function(err, data){
                                    if (!err && data) {
                                        enableFeatures();
                                        $('#request').on('click', showRequest);
                                    } else {                                    
                                        console.error('Some error happened ', err);
                                        toastr.error('Could not authenticate you', 'Troller Says')                                 
                                    }
                                });
                            }
                        
                        }, {scope: 'email,user_likes'});
                      }
                });

            }
            let showAbout = (e) => {
                aboutView.render();
            }
            var init = function() {
                if (isUserLoggedIn()) {
                    enableFeatures()
                    $('#request').on('click', showRequest);
                } else {
                    disableFeatures();
                    $('#facebook_login').on('click', fblogin);
                }
                $('#about_us').on('click', showAbout);
            }();
        window.fbAsyncInit = function() {
            FB.init({
              //appId      : '307608189577094', //Prod
              appId        : '307608722910374', //test
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
            crossroads.bypassed.add(function(request){
                url.navigate('landing');
            });
            crossroads.addRoute('/#post/{id}', detailView.render);
            crossroads.addRoute('/#{?query}', landingView.render);

            window.onhashchange = function(){
               crossroads.parse(window.location.hash)
            };
            crossroads.parse(window.location.hash)
            //
            
        })

        });
}

if (!('serviceWorker' in navigator)) {
    console.log('Service worker not supported');
    init()
} else {
    navigator.serviceWorker.register('service-worker.js')
    .then(function() {
        console.log('Registered');
        init()    
    })
    .catch(function(error) {
        console.log('Registration failed:', error);
    });
}
