define([
'../../collections/postCollection',
 'text!./landing.html'
], function (postCollections, html) {
     var source   = $(html).html(),
        template = Handlebars.compile(source),
        render;
        var landingView = function () {
            var render;
            
            render = function (from) {
                postCollections.getAllPosts({from: from}, function(err, posts) {
                    var html = template({posts: posts});
                    $('body').append(html);
                });
                
            }
            return {
                render: render
            }
        }
        return landingView();
})
