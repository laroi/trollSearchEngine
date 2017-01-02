define([
'../../controllers/requestController',
'../../controllers/storeController',
'../../controllers/urlController',
'../../collections/postCollection',
 'text!./landing.html',
 '../create/create'
], function (request, store, url, postCollections, html, create) {
     var source   = $(html).html(),
        template = Handlebars.compile(source),
        render;
        Handlebars.registerHelper('isOwner', function(postUser) {
            if (postUser === store.get('userID')) {
                return true;
            } else {
                return false;
            }
        });
        Handlebars.registerHelper('pageLink', function(total, limit, current) {
            var accum = '',
            n = Math.ceil(total/limit),
            limit = n < 5 ? n : 5;
            if (current > 2) {
                accum += '<li class="page-item"><span class="page-prev page-link" aria-label="Previous"><span aria-hidden="true">&laquo;</span><span class="sr-only">Previous</span></span></li>'
            }
            for(var i = 0; i < limit; ++i) {
                accum += '<li class="page-item"><span class="page-nav page-link">' + (i+1) + '</a></li>';
            }
            if (limit>5){
                accum += '<li class="page-item"><span class="page-nav page-link">' + n + '</a></li>';
            }
            if (current === n-1) {
                accum += '<li class="page-item"><span class="page-next page-link" aria-label="Next"><span aria-hidden="true">&raquo;</span><span class="sr-only">Next</span></span></li>'
            }
            return accum;
        });
        var editPost = function(e) {
            var id = $(e.target).parent().parent().parent().attr('id');
            var post = postCollections.getPostById(id);
            create.render(undefined, post);                
        }
        var search = function(){
            var search_term = $('#basic-search').val().trim();
            if (search_term) {
                store.set('search', search_term) 
                url.navigate();
            }
        }
        var paginate = function(e){
            var current = parseInt($(e.target).text(), 10);
            var limit = store.get('limit');
            store.set('from', (((current - 1) * limit)));
            url.navigate();
        };
        var landingView = function () {
            var render;
            store.set('limit', 10);
            render = function (query) {
                var from = query.from || 0;
                var postData = {};
                if (from) {
                    postData.from = from;
                }
                if (query.search) {
                    postData.search = query.search;
                }
                postCollections.getAllPosts(postData, function(err, posts) {
                    var html = template({posts: posts});
                    $('#post-contents').empty().append(html);
                    $('.edit').on('click', editPost);
                    $('.btn-basic-search').off().on('click', search)
                    $('.page-nav').on('click', paginate)
                });              
            }
            return {
                render: render
            }
        }
        return landingView();
})
