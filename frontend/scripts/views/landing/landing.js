define([
'../../controllers/requestController',
'../../controllers/storeController',
'../../collections/postCollection',
 'text!./landing.html',
 '../create/create'
], function (request, store, postCollections, html, create) {
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
        var editPost = function(e) {
            var id = $(e.target).parent().parent().parent().attr('id');
            var post = postCollections.getPostById(id);
            create.render(undefined, post);                
        }
        var paginate = function(total){
            var current;
            var limit = 10;
        }
        var search = function(){
            var search_term = $('#basic-search').val().trim();
            if (search_term) {
                postCollections.getAllPosts({from: 0, search: search_term}, function(err, posts) {
                    var html = template({posts: posts});
                    $('#post-contents').empty().append(html);
                    $('.edit').on('click', editPost);
                    $('.btn-basic-search').off().on('click', search)
                    //var html = template({posts: posts});
                    //$('body').append(html);
                });     
            }
        }
        var landingView = function () {
            var render;
            render = function (from) {
                postCollections.getAllPosts({from: from}, function(err, posts) {
                    var html = template({posts: posts});
                    $('#post-contents').empty().append(html);
                    $('.edit').on('click', editPost);
                    $('.btn-basic-search').off().on('click', search)
                });              
            }
            return {
                render: render
            }
        }
        return landingView();
})
