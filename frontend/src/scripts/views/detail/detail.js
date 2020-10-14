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
], function (request, store, url, user, postCollection, create, html, contextHtml, Handlebars, toastr) {
     var source   = $(html).html(),
        template = Handlebars.compile(source),
        render;
        const share = (navigator.canShare || navigator.share) ? true : false;
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
        const showCanvas = (post) => {
            const canvas = document.querySelector('#gen-meme-elem');
            const img = document.querySelector('.postImage');
            const boundingBox = document.querySelector('#boundingbox');
            boundingBox.addEventListener('mousemove', onMove);
            const imgContext = canvas.getContext("2d");
            const setBounds = (element, x, y, w, h) => {
	            element.style.left = x + 'px';
	            element.style.top = y + 'px';
	            element.style.width = w + 'px';
	            element.style.height = h + 'px';
            }
            boundingBox.addEventListener('mousedown', onMouseDown);
            boundingBox.addEventListener('mouseup', onUp);
            boundingBox.addEventListener('mousemove', onMove);
            var clicked = null;
var onRightEdge, onBottomEdge, onLeftEdge, onTopEdge;
            function onMouseDown(e) {
              onDown(e);
              e.preventDefault();
            }
            function onUp(e) {
  calc(e);

  clicked = null;

}
function onMove(ee) {
  calc(ee);

  e = ee;

  redraw = true;

}
            function calc(e) {
            var MARGINS = 4;
              b = boundingBox.getBoundingClientRect();
              x = e.clientX - b.left;
              y = e.clientY - b.top;

              onTopEdge = y < MARGINS;
              onLeftEdge = x < MARGINS;
              onRightEdge = x >= b.width - MARGINS;
              onBottomEdge = y >= b.height - MARGINS;

              rightScreenEdge = window.innerWidth - MARGINS;
              bottomScreenEdge = window.innerHeight - MARGINS;
            }
            function onDown(e) {
              calc(e);

              var isResizing = onRightEdge || onBottomEdge || onTopEdge || onLeftEdge;

              clicked = {
                x: x,
                y: y,
                cx: e.clientX,
                cy: e.clientY,
                w: b.width,
                h: b.height,
                isResizing: isResizing,
                onTopEdge: onTopEdge,
                onLeftEdge: onLeftEdge,
                onRightEdge: onRightEdge,
                onBottomEdge: onBottomEdge
              };
            }
            var e;
            function onMove(ee) {
              calc(ee);

              e = ee;

              redraw = true;

            }
            var redraw = false;
            function animate() {

              requestAnimationFrame(animate);

              if (!redraw) return;

              redraw = false;

              if (clicked && clicked.isResizing) {
                const height = clicked.cy - e.clientY  + clicked.h;
                if (clicked.onTopEdge) {
                     boundingBox.style.height =height+ 'px';
                     boundingBox.style.top = e.clientY + 'px';	
                }
                if (clicked.onBottomEdge) boundingBox.style.height =y+ 'px';


                //hintHide();

                return;
              }

              // This code executes when mouse moves without clicking

              // style cursor
              if (onRightEdge && onBottomEdge || onLeftEdge && onTopEdge) {
                boundingBox.style.cursor = 'nwse-resize';
              } else if (onRightEdge && onTopEdge || onBottomEdge && onLeftEdge) {
                boundingBox.style.cursor = 'nesw-resize';
              } else if (onRightEdge || onLeftEdge) {
                boundingBox.style.cursor = 'ew-resize';
              } else if (onBottomEdge || onTopEdge) {
                boundingBox.style.cursor = 'ns-resize';
              } else {
                boundingBox.style.cursor = 'default';
              }
            }
            animate();

            return () => {
                
                boundingBox.style.height = canvas.style.height = img.height+"px";
                boundingBox.style.width = canvas.style.width = img.width+"px";
                rect = canvas.getBoundingClientRect();
                boundingBox.style.left = rect.left;
                boundingBox.style.top = rect.top;
                canvas.width = img.width;
		        canvas.height = img.height;
                console.log(post.width, post.height, img.width, post.height)     
                imgContext.drawImage(img, 0, 0, post.width, post.height, 0, 0, img.width, img.height);
                document.querySelector('.modal-detail-content').style.display = 'none';
                document.querySelector('.modal-gen-cont').style.display = 'block';
                const cropClick = (e) =>{  
                    boundingBox.style.display='block'; 
                };
                document.querySelector('.img-crop').addEventListener('click', cropClick);
            }
        }
        const resetCanvas = () => {
            const canvas = document.querySelector('#gen-meme-elem');
            const imgContext = canvas.getContext("2d");
            imgContext.clearRect(0, 0, canvas.width, canvas.height);
            document.querySelector('.modal-detail-content').style.display = 'block';
            document.querySelector('.modal-gen-cont').style.display = 'none';
        }
        var updateUi = function (id) {
        var animInClass = "fade-scale";
var animOutClass = "bounceInRight";
            let modal = $('#detail-cont');
                const listElem = $('#'+id+'.panel-body')[0] ||  $('body')[0];
                    let offset = listElem.getBoundingClientRect();
                    let left = offset.left + offset.width/2;
                    let top = offset.top + offset.height/2;
                    console.log(offset);
                    console.log(left, top);
                    modal.css('transform-origin', left + 'px ' + top + 'px');
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
            //$('#detail-cont').css('left', offset.left);
            //$('#detail-cont').css('top', offset.top);
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
            postCollection.getPostById(postId, (err, post) => {
                var storage = store.get('filters') || {};
                storage.userId = post.user.id;
                storage.username = post.user.name;
                store.set('filters', storage);
                url.navigate();
            });
            
        };
        var gotoHome = function () {
            url.navigate('landing');
        }
        let isDownloadBusy;
        let downloadImage = (e) => {
            if (!isDownloadBusy) {
                isDownloadBusy = true;
                $(e.target).css('cursor', 'disabled');
                let id = $(e.target).attr('data-post');
                postCollection.getPostById(id, function(err, post){
                    post.downloadOrShare('download')
                    .then((downloads)=> {
                    $(e.target).next().empty().html(downloads.length+1)
                    $("#"+id+".panel-body").children('.bottom-panel').children('.button-panel').children('.row1').children('.pan-btn-cont').children('.download').next('.down-count').empty().html(downloads.length+1);
                        $(e.target).css('cursor', 'pointer');
                        isDownloadBusy = false;
                    })
                });
            }
        }
        /*let downloadImage = (e) => {
            let id = $(e.target).attr('data-post');
            request.getImage('/api/image/'+id, id, 'download')
            .then(()=> {
                postCollection.getPostById(id, function(err, post){
                    //post.downloads += 1;
                    $(e.target).next().empty().html(post.downloads.length+1)
                    $("#"+id+".panel-body").children('.bottom-panel').children('.button-panel').children('.row1').children('.pan-btn-cont').children('.download').next('.down-count').empty().html(post.downloads.length+1);

                })
            })
        }*/
        let sharePost = async (e) => {
                let id = $(e.currentTarget).attr('data-post');
                const svgElem = document.querySelector('.share-icon-path');   
                 if (navigator.canShare) {
                    svgElem.classList.add('share-anim');
                    postCollection.getPostById(id, async(err, post)=> {
                        try {
                            var {file, postObj} = await post.downloadOrShare('share');
                            svgElem.classList.remove('share-anim');
                            $(e.currentTarget).next().empty().html(postObj.shares.length);
                            
                         } catch (err) {
                            console.error('error in getting file');
                            svgElem.classList.remove('share-anim');
                            toastr.error('Could not share this image.', 'Memefinder Says');
                            return;
                         }
                         if (navigator.canShare( { files: [file] } )) {
                            try {
                                const shr = await navigator.share({
                                    files: [file]
                                })
                            } catch (err)  {
                                console.error(err.message);
                                return;
                            };             
                        } else {
                            console.error('not sharable');
                            return;
                        }                    
                    });
                 } else if (navigator.share) {
                    try {
                        const shr = await navigator.share({
                            url: 'https://thememefinder.com/#post/'+id,
                            title: 'Thememefinder',
                            text: 'shared from thememefinder.com', 
                        });
                    } catch (err) {
                        console.error("Could not share", err.message);
                        return;
                    }
                } else {
                    return;
                }
                postCollection.getPostById(id, function(err, post){
                    $(e.target).next().empty().html(post.shares.length+1)
                    $("#"+id+".panel-body").children('.bottom-panel').children('.button-panel').children('.row1').children('.pan-btn-cont').children('.share').next('.share-count').empty().html(post.shares.length+1);
            });
        };
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
                        var html = template({post : post, share: share});
                        $('#detailModel').empty().append(html);
                        updateUi(id);
                        $('.edit').off('click').on('click', editPost);
                        $('.delete').off('click').on('click', deletePost);
                        $('.fav').off('click').on('click', processLike);
                        $('.star-btn').off('click').on('click', processStar);
                        $('.pan-btn.download').off('click').on('click', downloadImage);
                        //$('#detail-cont').on('hidden.bs.modal', gotoHome);
                        $('.share').off('click').on('click', sharePost);
                        $('.more').off('click').on('click', showBuffs);
                        $('.gen-meme').off('click').on('click', showCanvas(post));
                        $('.gen-cancel').off('click').on('click', resetCanvas)
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
