define([
 'text!./create.html',
 'scripts/controllers/requestController',
 'scripts/controllers/storeController',
 'scripts/collections/userCollection'
], function (html, request, store, userCollection) {
     var source   = $(html).html(),
        template = Handlebars.compile(source),
        render;
    Handlebars.registerHelper('approvable', function(isApproved) {
        if (isApproved == false && store.get('userType') === 'admin') {
            return '<button type="button" id="approve-meme" class="btn btn-primary">Approve</button>';
        }
        return '';
    })
    var getSuggestion = function (field) {
        var url = '/api/suggestions?field='+field+'&query=';
            return function( request, response ) {
                    var term = request.term ? request.term : request
                    $.ajax({
                      type: 'GET',
                      url: url+(term.toLowerCase()),
                      dataType: "json",
                      success: function( data ) {
                        var c = []
                        $.map(data[field][0].options, function( item ) {
                          c.push(item.text);
                        });
                        c = c.filter(function(elem, index, self) {
                          return index === self.indexOf(elem);
                        });
                        response(c);
                      }
                  });
              }
    };
        var createNew = function (post) {
            var render;
            render = function (e, post) {
             var tags,
                actors,
                characters;
                post ? tags = post.tags : tags = [];
                post ? actors = post.actors : actors = [];
                post ? characters = post.characters : characters = [];
                
                //TODO: cache all the txts to avoid firing up api on each create
                userCollection.getContext(function(contErr, contData){
                    userCollection.getLang(function(langErr, langData){
                        if (!contErr && ! langErr) {
                            var html = template({post: post, contexts: contData, langs: langData, isAdmin: store.get('userType') === 'admin' ? true : false});
                            $('#createModel').empty().append(html);
                            $.material.init();
                            $('#create-new-form').modal({show: false}); 
                            var imageData = '';
                            // Private function to upload memes
                            var uploadMeme = function (e) {
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
                                            user: store.get('userId'),
                                            type:$("#isClean").is(":checked")?'clean':'default',
                                            isAdult: $("#isAdult").is(":checked")?true:false,
                                            description:'',
                                            tags:$("#tags").val().trim() ? $("#tags").val().trim().split(','):[],
                                            movie: $("#movie").val().trim(),
                                            language:$("#language").val().trim() === 'Select' ? '' : $("#language").val().trim(),
                                            context:$("#context").val().trim() === 'Select' ? '' : $("#context").val().trim(),
                                            actors:$("#actors").val().trim() ? $("#actors").val().trim().split(','): [],
                                            characters:$("#characters").val().trim()? $("#characters").val().trim().split(',') : [],
                                            event :{
                                                title:$("#event-title").val().trim(),
                                                link :$("#event-link").val().trim(),
                                            },
                                            createdAt: date.toISOString(),
				                            lastModified: date.toISOString()
                                        }
                                        if ($(e.target).attr('id') === 'approve-meme') {
                                            if (store.get('userType') === 'admin') {
                                                postData.isApproved = true;
                                            }
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
                                            toastr.success('Your post is submitted for verification!', 'FTM Says')
                                        } else {
                                            console.error(err);
                                            toastr.error('Uploading failed.', 'FTM Says')
                                        }
                                        
                                    });
                                } else {
                                    console.error('Validation error');
                                }
                            }
                            // DOM manipulations
                            $('#create-new-form').modal('show'); 
                            $("#tags").tagit({allowSpaces: true});
                            if (post&& post.language) {
                                $('#language option[value="'+post.language.toLowerCase()+'"]').attr('selected', 'selected')
                            }
                            if (post && post.context) {
                                $('#context option[value="'+post.context+'"]').attr('selected', 'selected')
                            }
                            tags.forEach(function(tag) {
                                $("#tags").tagit("createTag", tag);
                            });
                            $("#actors").tagit({
                                allowSpaces: true,
                                autocomplete: {
                                   delay: 0,
                                   minLength: 1,
                                   source :  getSuggestion('actor')
                                }
                            });
                            actors.forEach(function(actor) {
                                $("#actors").tagit("createTag", actor);
                            });
                            //$("#characters").tagit({allowSpaces: true});

                            $("#characters").tagit({
                                allowSpaces: true,
                                autocomplete: {
                                   delay: 0,
                                   minLength: 1,
                                   source :  getSuggestion('character')
                                }
                            });
                            characters.forEach(function(character) {
                                $("#characters").tagit("createTag", character);
                            });
                            $('#movie').typeahead({
                                source: getSuggestion('movie'),
                                  updater: function(item) {
                                    return item;
                                  }
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
                                        imageData.name = input.files[0].name || ''
                                    }
                                    reader.readAsDataURL(input.files[0]);
                                }
                            });
                            $('#create-meme').on('click', uploadMeme)
                            $('#approve-meme').on('click', uploadMeme)
                            //$('#create-new-form').modal( 'hide' ).data( 'bs.modal', null );
                            $('#create-new-form').on('hidden.bs.modal', function(e)
                            { 
                                $(this).data('bs.modal', null );
                            }) ;
                                
                        }
                    });
                });

            };
            return {
                render: render
            }
        }
    return createNew();
})
