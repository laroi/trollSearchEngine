define([
'../../controllers/requestController',
'../../collections/postCollection',
 'text!./landing.html',
 '../create/create'
], function (request, postCollections, html, create) {
     var source   = $(html).html(),
        template = Handlebars.compile(source),
        render;
        var landingView = function () {
            var render;
            var editPost = function(e) {
                var id = $(e.target).parent().parent().parent().attr('id');
                var post = postCollections.getPostById(id);
                create.render(undefined, post);                
            }
            render = function (from) {
                postCollections.getAllPosts({from: from}, function(err, posts) {
                    var html = template({posts: posts});
                    $('body').append(html);
                    $('.edit').on('click', editPost)
                });              
            }
            return {
                render: render
            }
        }
        return landingView();
})
