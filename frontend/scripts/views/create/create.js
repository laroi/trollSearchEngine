define([
 'text!./create.html',
 'controllers/requestController',
 'controllers/storeController'
], function (html, request, store) {
     var source   = $(html).html(),
        template = Handlebars.compile(source),
        render;
        var createNew = function (post) {
            var render;
            render = function (e, post) {
             var tags,
                actors,
                characters;
                post ? tags = post.tags : tags = [];
                post ? actors = post.actors : actors = [];
                post ? characters = post.characters : characters = [];
                var html = template({post: post});
                $('#createModel').empty().append(html);
                 $.material.init();
                 $('#create-new-form').modal({
                    show: false
                }); 
                var imageData = '';
                var uploadMeme = function () {
                    var validate = function(){
                        var isValidate = true;
                        if ($('#title').val() == '') {
                            isValidate = false
                        }
                        if ($('#movie').val() == '') {
                            isValidate = false
                        }
                        if(!(post && post._id) && imageData == ''){
                            isValidate = false;
                        }
                        return isValidate;
                    };
                    var save = function (callback) {
                        var date = new Date();
                        var url = '/api/post',
                            postData = {
                                title: $('#title').val().trim(),
                                image: imageData,
                                userId: store.get('userId') || 'test',
                                type:$("#isClean").is(":checked")?'clean':'default',
                                isAdult: $("#isAdult").is(":checked")?true:false,
                                description:'',
                                tags:$("#tags").val().split(','),
                                movie: $("#movie").val().trim(),
                                language:$("#language").val().trim(),
                                actors:$("#actors").val().split(','),
                                characters:$("#characters").val().split(','),
                                event:$("#movie").val().trim(),
                                createdAt: date.toISOString(),
				                lastModified: date.toISOString()
                            }
                            if (post && post._id) {
                                url += '/'+ post._id;
                                postData._id = post._id;
                                request.putImage(url, postData, function(err, data) {
                                    callback(err, data)
                                });                                
                            } else {
                                request.postImage(url, postData, function(err, data) {
                                    callback(err, data)
                                });
                            }
                    }
                    if (validate()) {
                        save(function(err, data) {
                            
                            if (!err) {
                                $('#create-new-form').modal( 'hide' ).data( 'bs.modal', null );
                                toastr.success('Successfully uploaded!', 'Miracle Max Says')
                            } else {
                                console.error(err);
                                toastr.error('Uploading failed.', 'Miracle Max Says')
                            }
                            
                        });
                    } else {
                        console.error('Validation error');
                    }
                }
                $('#create-new-form').modal('show'); 
                $("#tags").tagit();
                tags.forEach(function(tag) {
                    $("#tags").tagit("createTag", tag);
                });
                $("#actors").tagit();
                actors.forEach(function(actor) {
                    $("#tags").tagit("createTag", actor);
                });
                $("#characters").tagit();
                characters.forEach(function(character) {
                    $("#tags").tagit("createTag", character);
                });
                //Change or set title
                if (post && post.title) {
                    $('.modal-title').empty().html(post.title);
                }
                $('#title').on('keyup', function() {
                    if($(this).val()) {
                        $('.modal-title').empty().html($(this).val());
                    } else {
                        $('.modal-title').empty().html('Create');
                    }
                });
                $("#file").change(function(){
                    var input = $(this)[0];
                    if (input.files && input.files[0]) {
                        var reader = new FileReader();
                        reader.onload = function (e) {
                            imageData = e.target.result;
                            $('.img-preview').attr('src', imageData);
                            imageData = {type: input.files[0].type.split('/')[1], image:imageData.replace(/^data:image\/(png|jpg|jpeg);base64,/, "")};
                            if (file.imageUrl) {
                                imageData.name = imageUrl.split("/")[1]
                            }
                        }
                        reader.readAsDataURL(input.files[0]);
                    }
                });
                $('#create-meme').on('click', uploadMeme)
                //$('#create-new-form').modal( 'hide' ).data( 'bs.modal', null );
                $('#create-new-form').on('hidden.bs.modal', function(e)
                { 
                    $(this).data('bs.modal', null );
                }) ;
            };
            return {
                render: render
            }
        }
        return createNew();
})
