define([
'../../controllers/requestController',
'../../controllers/storeController',
'../../controllers/urlController',
'../../controllers/userController',
'../../collections/postCollection',
 '../create/create',
 'text!./detail.html',
  'text!../components/head_context.html',
  'handlebars',
  'toastr'
], function (request, store, url, user, postCollection, create, html, contextHtml, Handlebars) {
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
                   toastr.success('Post removed!', 'Memefinder Says')
                   $('#'+id).remove();
                }
            })
        }
        let showBuffs = (e) => {
            if ($('.detail-more-details').css('display') !== 'none') {
                $('.detail-more-details').css('display', 'none')
            } else {
                $('.detail-more-details').css('display', 'block')
            }
        }
        var updateUi = function () {
        var animInClass = "fade-scale";
var animOutClass = "bounceInRight";
            let modal = $('#detail-cont');
                modal.on('show.bs.modal', function () {
                    var closeModalBtns = modal.find('button[data-custom-dismiss="modal"]');
                    closeModalBtns.on('click', function() {
                    modal.on('webkitAnimationEnd transitionend oanimationend msAnimationEnd animationend', function( evt ) {
                      modal.modal('hide');
                    });
                    modal.removeClass(animInClass).addClass(animOutClass);
                    //
                })
            })
            modal.on('hidden.bs.modal', function ( evt ) {
                var closeModalBtns = modal.find('button[data-custom-dismiss="modal"]');
                modal.removeClass(animOutClass)
                modal.off('webkitAnimationEnd oanimationend msAnimationEnd animationend')
                closeModalBtns.off('click');
                gotoHome();
            })
            $('#detail-cont').modal({show: true});
        }
        var processStar = function (e) {
            var postId = $(e.target).parent().parent().parent().attr('id'),
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
                    let element = $("#"+postId+".panel-body").children('.bottom-panel').children('.button-panel').children('.row1').children('.star-btn');
                    let processUpdate = (el) => {
                        if ($(el).hasClass('star')) {
                            $(el).removeClass('star');
                            $(el).addClass('starred');
                        } else if ($(el).hasClass('starred')) {
                            $(el).addClass('star');
                            $(el).removeClass('starred');
                        }
                    }
                    processUpdate(e.target)
                    processUpdate(element)
                } else {
                    store.set('stars', prevStars);
                    toastr.error('Could not perform the action, verify you are logged in.', 'Memefinder Says')
                }
            });
        }
        var processLike = function (e) {
            var postId = $(e.target).parent().parent().parent().parent().attr('id');
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
                    toastr.error('Could not perform the action, verify you are logged in.', 'Memefinder Says')
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
            var postId = $(e.target).parent().parent().parent().parent().parent().parent().attr('id');
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
        let downloadImage = (e) => {
            let id = $(e.target).attr('data-post');
            request.getImage('/api/image/'+id, id)
            .then(()=> {
                postCollection.getPostById(id, function(err, post){
                    post.downloads += 1;
                    $(e.target).next().empty().html(post.downloads)
                    $("#"+id+".panel-body").children('.bottom-panel').children('.button-panel').children('.row1').children('.pan-btn-cont').children('.download').next('.down-count').empty().html(post.downloads);

                })
            })
        }
        var detailView = function () {
            var render;
            render = function (isForce, id) {
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
                        $('.pan-btn.download').on('click', downloadImage);
                        //$('#detail-cont').on('hidden.bs.modal', gotoHome);
                        $('.more').off('click').on('click', showBuffs)
                    } else {
                        toastr.error('We seems to have a problem. Please check your internet connection.', 'Memefinder Says')
                    }
                });
            }
            return {
                render: render
            }
        }
        return detailView();
})
