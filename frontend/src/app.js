import landing from './scripts/views/landing/landing';
import store from './scripts/controllers/storeController';
import user from './scripts/controllers/userController';
import url from './scripts/controllers/urlController';
import 'bootstrap';
import 'bootstrap-3-typeahead';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/style.css';
import './styles/search-box.css';
import './styles/toggle.css';
import '@fortawesome/fontawesome-free/js/fontawesome'
import '@fortawesome/fontawesome-free/js/solid'
import '@fortawesome/fontawesome-free/js/regular'
import Navigo from 'navigo';
let init = () => {  
            String.prototype.capitalize = function() {
                return this.charAt(0).toUpperCase() + this.slice(1);
            };
            if (screen.width <768) {
                $('.search-drop').css('width', (screen.width - 20));
            } else {
                $('.search-drop').css('width', $('#adv-search').css('width'));
            }
            const left = parseInt($('#basic-search').css('width'), 10) + 55
            
            $('.search-drop').css('left', (left*-1));
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
            var basicAfterSelect  = function (element) {
                return function(item) {
                    var item = item.text || item;
                    element.val(item.replace(/<b>/g, '').replace(/<\/b>/g, '')).change();
                    if (element.attr('id') !== 'basic-search') {
                        //$('#advanced-search').click();
                        landing.advancedSearch();
                    } else {
                        landing.search();
                        //$('.btn-basic-search').click();
                    }
                }
            }
            const afterSelect  = function (element) {
                return function(item) {
                    var item = item.text || item;
                    element.val(item.replace(/<b>/g, '').replace(/<\/b>/g, '')).change();
                }
            }
            let prevHash;
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
                //$('body').bootstrapMaterialDesign();;
                //$("#s1").dropdown({"optionClass": "withripple"});
                $('.dropdown-menu').click(function(e) {
                    e.stopPropagation();
                });
                    $('#basic-search').typeahead({
                    source: getBasicSuggestion(),
                    displayText: function (text){
                        return text.text + ' ' + getBadge(text.field);
                    },
                    highlighter: Object,
                    afterSelect: basicAfterSelect($('#basic-search'))
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
                let showLogin = (e) => {
                    loginView.render();
                };
                if (isUserLoggedIn()) {
                    user.enableFeatures()
                } else {
                    user.disableFeatures();
                    $('#login').on('click', showLogin);
                }
                const disableAllFilters = () => {
                    $('.language-list').val("0");
                    $('.language-list').prop('disabled', true);
                    $('.context-list').val("0");
                    $('.context-list').prop('disabled', true);
                    $('.isFavorite').prop('checked', false);
                    $('.isFavorite').prop('disabled', true);
                    $('.isMine').prop('checked', false);
                    $('.isMine').prop('disabled', true);
                    $('#basic-search').val('');
                    $('#basic-search').prop('disabled', true);
                    $('.se_input').val('');
                    $('.se_input').prop('disabled', true);
                };
                const enableAllFilters = () => {
                    $('.language-list').prop('disabled', false);
                    $('.context-list').prop('disabled', false);
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
                let logout = (e) => {
                    let accessKey = store.get('accessKey')
                    user.unsetToken(accessKey,  () => {
                        url.navigate('landing', undefined, true);
                        $('.open').removeClass('open');
                        $('#login').on('click', showLogin);
                    })
                };                
                $('#logout').off('click').on('click', logout);
                $('#create').off('click').on('click', (e)=> { $('#create-input').trigger('click')});
                $('#create-input').on('click', (e)=> { e.stopPropagation();})
                var root = null;
                var useHash = true; // Defaults to: false
                var hash = '#!'; // Defaults to: '#'
                var router = new Navigo(root, useHash, hash);
                router
                  .on(function () {
                    landing.render(true, {});
                  })
                  .resolve();
            });

};

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

