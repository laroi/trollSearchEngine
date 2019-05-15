define([
 'text!./respond.html',
 'app/controllers/requestController',
 'app/controllers/storeController',
 'app/collections/userCollection',
 'handlebars',
 'toastr'
], function (html, request, store, userCollection, Handlebars) {
     var source   = $(html).html(),
        template = Handlebars.compile(source),
        render;
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
    let respond = function () {
            var render;
            render = function (imageData, requestId) {
                userCollection.getContext(function(contErr, contData){
                    userCollection.getLang(function(langErr, langData){
                        if (!contErr && ! langErr) {
                            var html = template({imageData: imageData, contexts: contData, langs: langData, isAdmin: store.get('userType') === 'admin' ? true : false});
                            $('#createModel').empty().append(html);
                            //$('.img-preview').attr('src', imageData);
                            $.material.init();
                            $('#create-new-form').modal({show: false}); 
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
				                            lastModified: date.toISOString(),
				                            requestId: requestId
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
                                            toastr.success('Your post is submitted for verification!', 'Memefinder Says')
                                        } else {
                                            console.error(err);
                                            toastr.error('Uploading failed.', 'Memefinder Says')
                                        }
                                        
                                    });
                                } else {
                                    console.error('Validation error');
                                }
                            }
                            // DOM manipulations
                            $('#create-new-form').modal('show'); 
                            $("#tags").tagit({allowSpaces: true});
                            $("#actors").tagit({
                                allowSpaces: true,
                                autocomplete: {
                                   delay: 0,
                                   minLength: 1,
                                   source :  getSuggestion('actor')
                                }
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
                            $('#movie').typeahead({
                                source: getSuggestion('movie'),
                                  updater: function(item) {
                                    return item;
                                  }
                            });
                            $('#title').on('keyup', function() {
                                if($(this).val()) {
                                    $('.modal-title').empty().html($(this).val());
                                } else {
                                    $('.modal-title').empty().html('Create');
                                }
                            });
                            $('#create-meme').on('click', uploadMeme)
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
    return respond();
})
