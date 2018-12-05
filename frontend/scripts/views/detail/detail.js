define([
'../../controllers/requestController',
'../../controllers/storeController',
'../../controllers/urlController',
'../../controllers/userController',
'../../collections/postCollection',
 '../create/create',
 'text!./detail.html',
  'text!../components/head_context.html'
], function (request, store, url, user, postCollection, create, html, contextHtml) {
     var source   = $(html).html(),
        template = Handlebars.compile(source),
        render;
        var editPost = function(e) {
            var id = $(e.target).parent().parent().parent().parent().attr('id');
            postCollection.getPostById(id, (err, post) => {
                create.render(undefined, post);    
            });                        
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
            var postId = $(e.target).parent().parent().attr('id'),
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
                    let element = $("#"+postId+".panel-body").children('.bottom-panel').children('.button-panel').children('.row1').children('.pan-btn-cont').children('.star-btn');
                    let processUpdate = (el) => { 
                        if ($(el).hasClass('star')) {
                            $(el).removeClass('star');
                            $(el).addClass('starred');
                        } else if ($(e.target).hasClass('starred')) {
                            $(el).addClass('star');
                            $(el).removeClass('starred');
                        }
                    }
                    processUpdate(e.target)
                    processUpdate(element)
                } else {
                    store.set('stars', prevStars);
                    toastr.error('Could not perform the action, verify you are logged in.', 'FTM Says')
                }
            });
        }
        var processLike = function (e) {
            var postId = $(e.target).parent().parent().parent().attr('id');
            var processCallback = function (err, data) {
                if (!err) {
                    let element = $("#"+postId+".panel-body").children('.bottom-panel').children('.button-panel').children('.row1').children('.pan-btn-cont').children('.fav');
                    let processUpdate = (el) => {
                        if ($(el).hasClass('faved')) {
                            $(el).removeClass('faved');
                            $(el).addClass('favorite');
                        } else if ($(el).hasClass('favorite')) {
                            $(el).removeClass('favorite');
                            $(el).addClass('faved');
                        }
                        $(el).next().empty().html(data.likes);
                    }
                    processUpdate(e.target);
                    processUpdate(element);
                } else {
                    console.error(err);
                    toastr.error('Could not perform the action, verify you are logged in.', 'FTM Says')
                }
            };
            if ($(e.target).hasClass('faved')) {
                postCollection.getPostById(postId, (err, post)=> {
                    post.unlike(store.get('userId'), processCallback)
                })
            } else if ($(e.target).hasClass('favorite')) {
                postCollection.getPostById(postId, (err, post)=> {
                    post.like(store.get('userId'), (store.get('username') || store.get('email')), processCallback)
                })
                
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
                    console.log(post)
                    if (!err && post) {
                        if (post.height && post.width) {
                            let containerWidth = $(window).width() - 68;
                            post.adjustedHeight = (containerWidth < 552 ? containerWidth : 552)*(post.height/post.width)
                        }
                        var html = template(post);
                        $('#detailModel').empty().append(html);
                        updateUi();
                        $('.edit').on('click', editPost);
                        $('.delete').on('click', deletePost);                    
                        $('.fav').on('click', processLike);
                        $('.star-btn').on('click', processStar);
                        $('#detail-cont').on('hidden.bs.modal', gotoHome)
                    } else {
                        toastr.error('We seems to have a problem. Please check your internet connection.', 'FTM Says')
                    }
                });                
            }
            return {
                render: render
            }
        }
        return detailView();
})
