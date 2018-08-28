define([
'../../controllers/requestController',
'../../controllers/storeController',
'../../controllers/urlController',
'../../controllers/userController',
'../../controllers/highlightController',
'../../collections/postCollection',
'../../collections/userCollection',
 'text!./landing.html',
  'text!../components/head_context.html',
  'text!../components/head_lang.html',
 '../create/create'
], function (request, store, url, user, highlight, postCollection, userCollection, html, contextHtml, langHtml, create) {
     var source   = $(html).html(),
        template = Handlebars.compile(source),
        render;
        Handlebars.registerHelper('tolower', function(options) {
            return options.fn(this).toLowerCase();
        });
        Handlebars.registerHelper('pageLink', function(total, limit, current) {
            var accum = '',
            n = Math.ceil(total/limit),
            limit = n < 5 ? n : 5,
            classNamePrev ='page-item';
            classNameNext ='page-item';
            if (current < 2) {
               classNamePrev += ' disabled';
            }
            accum += '<li class="' + classNamePrev + '"><span class="page-prev page-link" aria-label="Previous"><span aria-hidden="true">&laquo;</span><span class="sr-only">Previous</span></span></li>'
            for(var i = 1; i <= limit; ++i) {
                accum += '<li class="page-item"><span class="page-nav ';
                if (i === current) {
                    accum += "current";
                }
                accum += ' page-link">' + i + '</span></li>';
            }
            if (limit>5){
                accum += '<li class="page-item"><span class="page-nav page-link">' + n + '</span></li>';
            }
            if (current !== n-1) {
                classNameNext += ' disabled';
            }
            accum += '<li class="' + classNameNext + '"><span class="page-next page-link" aria-label="Next"><span aria-hidden="true">&raquo;</span><span class="sr-only">Next</span></span></li>'
            return accum;
        });
        Handlebars.registerHelper('editable', function(isOwner) {
            if (isOwner || store.get('userType') === 'admin') {
                return '<div class="edit">Edit</div><div class="delete">Delete</div>';
            }
            return '';
        })
        Handlebars.registerHelper('getThumbHeight', function(post) {
            return 150 * (post.height/post.width)
        })
        
        Handlebars.registerHelper('ifeq', (isOwner, options) => {
          if (isOwner || store.get('userType') === 'admin') {
            return options.fn(this)
          }
          return options.inverse(this)
        })
        var editPost = function(e) {
            var id = $(e.target).parent().parent().attr('id');
            postCollection.getPostById(id, function (err, post) {
                create.render(undefined, post);                
            });
        }
        var deletePost = function (e) {
            var id = $(e.target).parent().parent().attr('id');
            var url = '/api/post/'+id;
            request.del(url, function (err, data) {
                if (!err) {
                   toastr.success('Post removed!', 'FTM Says')
                   $('#'+id).remove();
                }
            })
        }
        var search = function() {
            var search_term = $('#basic-search').val().trim();
            if (search_term) {
                store.set('search_term', {basic_search:search_term});
                store.set('from', 0);
                url.navigate('landing');
            }
        }
        var advancedSearch = function(e) {
            var se_title = $('#se_title').val().trim(),
            se_tag = $('#se_tag').val().trim(),
            se_movie = $('#se_movie').val().trim(),
            se_actor = $('#se_actor').val().trim(),
            se_character = $('#se_character').val().trim(),
            se_event = $('#se_event').val().trim(),
            advSearchTerm = {};
            if (se_tag) {
                advSearchTerm.tag = se_tag;                
            }
            if (se_title) {
                advSearchTerm.title = se_title;                
            }
            if (se_movie) {
                advSearchTerm.movie = se_movie;                
            }
            if (se_actor) {
                advSearchTerm.actor = se_actor;                
            }
            if (se_character) {
                advSearchTerm.character = se_character;                
            }
            if (se_event) {
                advSearchTerm.event = se_event;                
            }
            if (Object.keys(advSearchTerm).length > 0) {
                store.set('search_term', advSearchTerm);
                $('.dropdown.open').removeClass('open');
                store.set('from', 0);
                url.navigate('landing');
            }
        }
        var paginate = function(e){
            var current = parseInt($(e.target).text(), 10);
            //var limit = store.get('limit');
            var limit = store.get('limit');
            store.set('from', (((current - 1) * limit)));
            url.navigate('landing');
        };
        var navNext = function(e){
            if (!$(e.target).closest('.page-item').hasClass('disabled')) {
                var from = store.get('from');
                var limit = store.get('limit');
                store.set('from', ((parseInt(from, 10) + 1) * limit));
                url.navigate('landing');
            }
        };
        var navPrev = function(e){
            if (!$(e.target).closest('.page-item').hasClass('disabled')) {        
                var from = store.get('from');
                var limit = store.get('limit');
                store.set('from', ((parseInt(from, 10) - 1) * limit));
                url.navigate('landing');
            }
        };
        checkFilters = () => {
        };
        let setFilters = (query) => {
            let filtObj = {};
            let postData = {};
            var from = query.from || 0;
            if (from) {
                postData.from = from;
                store.set('from', from);
            }
            if (query.request) {
                postData.request = true;
                filtObj.request = true;
                filtObj.context = undefined;
                filtObj.isPlain = undefined;
                filtObj.isAdult = undefined;
                filtObj.isApproved = undefined;
                filtObj.isFavorite = undefined;
                filtObj.userId = undefined;
                filtObj.username = undefined;
            } else {
                if (query.search) {
                    postData.search = query.search;
                }
                if (query.se_title) {
                    postData.title = query.se_title
                }
                if (query.se_tag) {
                    postData.tag = query.se_tag
                }
                if (query.se_actor) {
                    postData.actor = query.se_actor
                }
                if (query.se_movie) {
                    postData.movie = query.se_movie
                }
                if (query.se_character) {
                    postData.character = query.se_character
                }
                if (query.se_event) {
                    postData.event = query.se_event
                }
                if (query.context) {
                    postData.context = query.context;
                    filtObj.context = query.context;
                }
                if (query.isPlain) {
                    postData.isPlain = query.isPlain;
                    filtObj.isPlain = query.isPlain;
                }
                if (query.isAdult) {
                    postData.isAdult = query.isAdult
                    filtObj.isAdult = query.isAdult;
                }
                if (query.isApproved && store.get('userType') === 'admin') {
                    postData.isApproved = query.isApproved
                    filtObj.isApproved = true;
                }
                if (query.isFavorite) {
                    postData.isFavorite = (store.get('stars') || []).join(',') || null;
                    filtObj.isFavorite = true;
                }
                if (query.userId) {
                    postData.userId = query.userId
                    filtObj.userId = query.userId;
                    filtObj.username = store.get('filters').username;
                }
                if (query.lang) {
                    postData.language = query.lang;
                    filtObj.lang = query.lang;
                }
            }
            store.set('filters', filtObj);
            return postData;    
        }
        var applyFilter = function (e) {
            var f_lang = $('.language-list').val(),
            f_context=$('.context-list').val(),
            isPlain = $('.isPlain').is(':checked'),
            isAdult = $('.isAdult').is(':checked'),
            isFavorite = $('.isFavorite').is(':checked'),
            isMine = $('.isMine').is(':checked'),
            isApproved = $('.isApproved').is(':checked'),
            filtObj = {};
            if (f_lang && f_lang !== "0") {
                filtObj.lang = f_lang;
            }
            if (isPlain) {
                filtObj.isPlain = isPlain;
            }
            if (isAdult) {
                filtObj.isAdult = isAdult;
            }
            if (isFavorite) {
                filtObj.isFavorite = isFavorite;
            }
            if (isMine) {
                filtObj.userId = store.get('userId');
                filtObj.username = store.get('username');
            }
            if (f_context && f_context !== "0") {
                filtObj.context = f_context;
            }
            if (store.get('userType') === 'admin' && isApproved) {
                filtObj.isApproved = false;
            }
            store.set('filters', filtObj);
            $('.dropdown.open').removeClass('open');
            store.set('from', 0);
            url.navigate('landing');
        };
        var updateUi = function (type, key) {
            var mapping = {
                    basic_search:'#basic-search',
                    title: '#se_title',
                    tag: '#se_tag',
                    movie: '#se_movie',
                    actor: '#se_actor',
                    character: '#se_character',
                    event: '#se_event',
                    group: '.group-list',
                    isPlain: '.isPlain',
                    isAdult: '.isAdult',
                    isFavorite: '.isFavorite',
//                    userId: '.isMine'                    
                }
                $('.se-control').val('');
                $('.group-list').prop('selectedIndex', 0);                
                $('.fi-input').prop('checked', false);
                $('#basic-search').val('');
                seTerms = store.get('search_term') || {};
                fiTerms = store.get('filters') || {};
                Object.keys(seTerms).forEach(function(se) {
                    $(mapping[se]).val(seTerms[se]);
                });
                Object.keys(fiTerms).forEach(function(fi) {
                    if (fi === 'lang') {
                       $('.language-list').val(fiTerms[fi]); 
                    }
                    if (fi === 'context') {
                       $('.context-list').val(fiTerms[fi]); 
                    }                    
                    else {
                        $(mapping[fi]).prop('checked', true);
                    }
                });
        }
        let logout = (e) => {
            let accessKey = store.get('accessKey')
            user.unsetToken(accessKey,  () => {
                url.navigate('landing', true);
                $('.open').removeClass('open');
            })
        }
        var cancelFilter = function(e) {
            var type = $(this).parent().attr('data-type').trim(),
                key = $(this).parent().attr('data-key').trim();               
                console.log(type, key);
                var storage = store.get(type);
                delete storage[key];
                store.set(type, storage);
                url.navigate('landing');
        }
        var processStar = function (e) {
            var postId = $(e.target).parent().parent().parent().parent().attr('id'),
                unStar,
                updatedStar,
                prevStars = stars = store.get('stars') || [],
                star;
                
            star = function (postId) {
                stars.push(postId);
                return stars;
            }
            unStar = function (postId) {
                if (stars.indexOf(postId) > -1) {
                    stars.splice(stars.indexOf(postId), 1);
                }
                return stars;
            }
            if ($(e.target).hasClass('star')) {
                updatedStar= star(postId)
            } else if ($(e.target).hasClass('starred')) {
                updatedStar = unStar(postId);
            }
            user.updateUser({stars: updatedStar}, function(err, data) {
                if (!err) {
                    if ($(e.target).hasClass('star')) {
                        $(e.target).removeClass('star');
                        $(e.target).addClass('starred');
                    } else if ($(e.target).hasClass('starred')) {
                        $(e.target).addClass('star');
                        $(e.target).removeClass('starred');
                    }
                    store.set('stars', updatedStar);
                } else {
                    toastr.error('Could not perform the action, verify you are logged in.', 'FTM Says')
                }
            });
        }
        var processLike = function (e) {
            var postId = $(e.target).parent().parent().parent().parent().parent().attr('id');
            var processCallback = function (err, data) {
                if (!err) {
                    if ($(e.target).hasClass('faved')) {
                        $(e.target).removeClass('faved');
                        $(e.target).addClass('favorite');
                    } else if ($(e.target).hasClass('favorite')) {
                        $(e.target).removeClass('favorite');
                        $(e.target).addClass('faved');
                    }
                    $(e.target).next().empty().html(data.likes);
                } else {
                    console.error(err);
                    toastr.error('Could not perform the action, verify you are logged in.', 'FTM Says')
                }
            };
            if ($(e.target).hasClass('faved')) {
                postCollection.getPostById(postId, (err, post) => {
                    post.unlike(store.get('userId'), processCallback)
                })
            } else if ($(e.target).hasClass('favorite')) {           
                postCollection.getPostById(postId, (err, post) =>{
                    post.like(store.get('userId'), (store.get('username') || store.get('email')), processCallback);
                })
            }
            
        };

        var processUserClick = function (e) {
            var postId = $(e.target).parent().parent().parent().parent().parent().attr('id');
            postCollection.getPostById(postId, function(err, post) {
                var poster = post.user;
                var storage = store.get('filters') || {};
                storage.userId = poster.id;
                storage.username = poster.name;
                store.set('filters', storage);
                console.log(store.get('filters'));
                url.navigate('landing');
            });
        }
        var loadContext = function () {
            userCollection.getContext((contErr, contData) => {
                if (!contErr) {
                    var contTemp = Handlebars.compile($(contextHtml).html()),
                    html = contTemp({contexts: contData});
                    $('.context-list').empty().append(html);
                } else {
                    console.log("could not load context");
                }
            });
        }
        var loadLangs= () => {
            userCollection.getLang((langErr, langData)=> {
                if (!langErr) {
                    var contTemp = Handlebars.compile($(langHtml).html()),
                    html = contTemp({langs: langData});
                    $('.language-list').empty().append(html);
                } else {
                    console.log("could not load context");
                }
            })
        }
        var closeAllPops = (e) => {
            // image content more popup
            if (!$(e.target).hasClass('more')) {
                 $('.row2').hide();
            }            
        }
        var thumbClick = function (e) {
            var postId = $(this).parent().attr('id')
            store.set('postId', postId);
            url.navigate('detail'); 
        };

        var showMore = (e) => {
            $('.row2').hide();
            let elem = $(e.target).parent().parent().parent().prev();
            if (elem.css('display') === "none") {
                elem.show();
            } else {
                elem.hide();
            }
        }
        var landingView = function () {
            var render;
            store.set('limit', 10);
            render = function (query) {
                // Read params from url, transform to apply in post requests
                var from = query.from || 0;
                let postData = setFilters(query);
                $('#detail-cont').modal( 'hide' ).data( 'bs.modal', null );
                if(postData.request) {
                    url.navigate('requestList');
                } else {
                    postCollection.getAllPosts(postData, query.force, function(err, posts) {
                        if (posts !== undefined) {
                            var html = template({posts: posts});
                            $('#post-contents').empty().append(html);
                            //$('.page-cont').imagesLoaded(function () {
                                $('.page-cont').masonry({
                                  // options
                                  itemSelector: '.elem-cont',
                                  isAnimated: true
                                });
                            //})
                            postCollection.getPostUserDetails()
                            .then(()=> {
                                $('.panel-body').each((index, element)=> {
                                    console.log($(element).attr('id'));
                                    postCollection.getPostById($(element).attr('id'), (err, post)=> {
                                        if (post) {
                                        $(element).children('.bottom-panel').children('.button-panel').children('.row1').children('.user').children('.user-img').attr('src', post.userimg.thumb)
                                        }
                                    }) 
                                })
                            })
                            loadContext();
                            loadLangs();
                            updateUi();                        
                        }
                        checkFilters();
                        highlight.highlight();
                        $('.edit').off('click').on('click', editPost);
                        $('.delete').off('click').on('click', deletePost);                    
                        $('.btn-basic-search').off().on('click', search)
                        $('.page-nav').off('click').on('click', paginate)
                        $('.btn-apply-filter').off('click').on('click', applyFilter);
                        $('#advanced-search').off('click').on('click', advancedSearch);                        
                        $('.hl-close').off('click').on('click', cancelFilter);
                        $('.star-btn').off('click').on('click', processStar);
                        $('.fav').off('click').on('click', processLike);
                        $('.user-img').off('click').on('click', processUserClick);
                        $('.page-prev').off('click').on('click', navPrev);
                        $('.page-next').off('click').on('click', navNext);
                        $('.thumbImgCont').off('click').on('click', thumbClick);
                        $('.more').off('click').on('click', showMore);
                        $('body').off('click').on('click', closeAllPops);
                        $('#logout').off('click').on('click', logout);
                    });
                }           
            }
            return {
                render: render
            }
        }
        return landingView();
})
