let init = () => {
requirejs.config({
            //By default load any module IDs from js/lib
            baseUrl: '.',
            //except, if the module ID starts with "app",
            //load it from the js/app directory. paths
            //config is relative to the baseUrl, and
            //never includes a ".js" extension since
            //the paths config could be for a directory.
            waitSeconds : 0,
            paths: {
                app: 'app',
                crossroads: 'libs/crossroads.min',
                $: 'libs/jquery.min',
                jQuery: 'ibs/jquery.min',
                signals: 'libs/signals',
                text: 'libs/text'
            }
        });  
/*requirejs([
'text!views/components/search.html',
'text!views/components/mainHeader.html',
], (search, header)=> {
    var headerTemplate = Handlebars.compile($(header).html());
    var searchTemplate = Handlebars.compile($(search).html());
    $(document).ready(function(){
            $('#content').append(headerTemplate());
            $('.drop-form').html(searchTemplate());
            $.material.init();
            $("#s1").dropdown({"optionClass": "withripple"});
            $('.dropdown-menu').click(function(e) {
                e.stopPropagation();
            });
    })
})*/
        // Start the main app logic.
        requirejs([
            'scripts/views/landing/landing',
            'scripts/views/detail/detail',
            'scripts/controllers/urlController',
            'scripts/controllers/userController',
            'scripts/controllers/storeController',
            'scripts/views/create/create',
            'scripts/views/request/request',
            'scripts/views/requestlist/requestlist',
            'scripts/views/aboutus/aboutus',
            'scripts/views/login/login',
        ],
        function (landingView, detailView, url, user, store, createNewView, requestView, requestListView, aboutView, loginView) {
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
            var isUserLoggedIn = function() {
                var acessKey = store.get('accessKey'),
                isLoggedIn = false;
                if (acessKey) {
                    isLoggedIn = true;
                }
                return isLoggedIn;
            };
            var showRequest = (e) => {
                requestView.render();
            };
            let showLogin = (e) => {
                loginView.render();
            };
            
            let showAbout = (e) => {
                aboutView.render();
            }
            if (isUserLoggedIn()) {
                user.enableFeatures()
                $('#request').on('click', showRequest);
            } else {
                user.disableFeatures();
                $('#login').on('click', showLogin);
            }
            disableAllFilters = () => {
                $('.language-list').val("0");
                $('.language-list').prop('disabled', true);
                $('.context-list').val("0");
                $('.context-list').prop('disabled', true);
                $('.isPlain').prop('checked', false);
                $('.isPlain').prop('disabled', true);
                $('.isAdult').prop('checked', false);
                $('.isAdult').prop('disabled', true);
                $('.isFavorite').prop('checked', false);
                $('.isFavorite').prop('disabled', true);
                $('.isMine').prop('checked', false);
                $('.isMine').prop('disabled', true);
                $('#basic-search').val('');
                $('#basic-search').prop('disabled', true);
                $('.se_input').val('');
                $('.se_input').prop('disabled', true);
            };
            enableAllFilters = () => {
                $('.language-list').prop('disabled', false);
                $('.context-list').prop('disabled', false);
                $('.isPlain').prop('disabled', false);
                $('.isAdult').prop('disabled', false);
                if (isUserLoggedIn()) {
                    $('.isFavorite').prop('disabled', false);
                    $('.isMine').prop('disabled', false);
                }
                $('#basic-search').prop('disabled', false);
                $('.se_input').prop('disabled', false);
            }
            $('.isReqeust').change(function() {
                if($(this).is(":checked")) {
                    disableAllFilters();
                } else {
                    enableAllFilters();
                }
            });
            let triggerInputFile = (e) => {

            }
            $('#about_us').on('click', showAbout);
            $('#create').off('click').on('click', (e)=> { $('#create-input').trigger('click')});
            $('#create-input').on('click', (e)=> { e.stopPropagation();})
            $("#create-input").change(function(){
                let input = $(this)[0],
                imageData = undefined;
                if (input.files && input.files[0]) {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        imageData = e.target.result;
                        imageData = {type: input.files[0].type.split('/')[1], image:imageData.replace(/^data:image\/(png|jpg|jpeg);base64,/, "")};
                        imageData.name = input.files[0].name || '';
                        $('#detail-cont').modal('hide');
                        createNewView.render(e.target.result);
                    }
                    reader.readAsDataURL(input.files[0]);
                }
            });
            crossroads.bypassed.add(function(request){
                url.navigate('landing');
            });
            crossroads.addRoute('/#post/{id}', detailView.render);
            crossroads.addRoute('/#requests{?query}', requestListView.render);
            crossroads.addRoute('/#{?query}', landingView.render);
            crossroads.addRoute('/#login', loginView.render);

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

