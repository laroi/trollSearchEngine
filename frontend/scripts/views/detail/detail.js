define([
'../../controllers/requestController',
'../../controllers/storeController',
'../../controllers/urlController',
'../../controllers/userController',
'../../collections/postCollection',
 'text!./detail.html',
  'text!../components/head_context.html'
], function (request, store, url, user, postCollection, html, contextHtml) {
     var source   = $(html).html(),
        template = Handlebars.compile(source),
        render;
        Handlebars.registerHelper('editable', function(isOwner) {
            if (isOwner || store.get('userType') === 'admin') {
                return '<div class="pan-btn edit"></div><div class="pan-btn delete"></div>';
            }
            return '';
        })
        var editPost = function(e) {
            var id = $(e.target).parent().parent().parent().parent().attr('id');
            var post = postCollection.getPostById(id);
            create.render(undefined, post);                
        }
        var deletePost = function (e) {
            var id = $(e.target).parent().parent().parent().attr('id');
            var url = '/api/post/'+id;
            request.del(url, function (err, data) {
                if (!err) {
                   toastr.success('Post removed!', 'FTM Says')
                   $('#'+id).remove();
                }
            })
        }
        var updateUi = function () {
         $('#detail-cont').modal({show: true}); 
        }
        var processStar = function (e) {
            var postId = $(e.target).parent().parent().parent().parent().attr('id'),
                unStar,
                updatedStar,
                prevStars,
                stars,
                star;
            star = function (postId) {
                prevStars = stars = store.get('stars') || [];
                stars.push(postId);
                store.set('stars', stars);
                return stars;
            }
            unStar = function (postId) {
                prevStars = stars = store.get('stars') || [];
                if (stars.indexOf(postId) > -1) {
                    stars.splice(stars.indexOf(postId), 1);
                }
                store.set('stars', stars);
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
                } else {
                    store.set('stars', prevStars);
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
                postCollection.getPostById(postId).unlike(store.get('userId'), processCallback)
            } else if ($(e.target).hasClass('favorite')) {
                postCollection.getPostById(postId).like(store.get('userId'), (store.get('username') || store.get('email')), processCallback)
            }
            
        };
        var processUserClick = function (e) {
            var postId = $(e.target).parent().parent().parent().parent().parent().attr('id');
            var poster = postCollection.getPostById(postId).user;
            var storage = store.get('filters') || {};
            storage.userId = poster.id;
            storage.username = poster.name;
            store.set('filters', storage);
            url.navigate();
        };
        var gotoHome = function () {
            url.navigate('landing');
        }
        var detailView = function () {
            var render;
            render = function (id) {
                postCollection.getPostById(id, function(err, post) {
                    var html = template(post);
                    $('#detailModel').empty().append(html);
                    updateUi();
                    $('.edit').on('click', editPost);
                    $('.delete').on('click', deletePost);                    
                    $('.fav').on('click', processLike);
                    $('#detail-cont').on('hidden.bs.modal', gotoHome)
                });                
            }
            return {
                render: render
            }
        }
        return detailView();
})