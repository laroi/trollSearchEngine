define([
 'text!./create.html',
 'controllers/requestController',
 'controllers/storeController'
], function (html, request, store) {
     var source   = $(html).html(),
        template = Handlebars.compile(source),
        render;
        var createNew = function () {
            var render;
            var html = template();
            $('body').append(html);
            $('#create-new-form').modal({
                show: false
            }); 
            render = function () {
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
                        if(imageData == ''){
                            isValidate = false;
                        }
                        return isValidate;
                    };
                    var save = function (callback) {
                        var url = '/api/post',
                            postData = {
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
                                event:$("#movie").val().trim()
                            }
                            request.postImage(url, postData, function(err, data) {
                                callback(err, data)
                            });
                    }
                    if (validate()) {
                        save(function(err, data) {
                            if (!err) {
                                console.log('Finished')
                            } else {
                                console.error(err);
                            }
                        });
                    } else {
                        console.error('Validation error');
                    }
                }
                $('#create-new-form').modal('show'); 
                $("#tags").tagit();
                $("#actors").tagit();
                $("#characters").tagit();
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
                        }
                        reader.readAsDataURL(input.files[0]);
                    }
                });
                $('#create-meme').on('click', uploadMeme)
            };
            return {
                render: render
            }
        }
        return createNew();
})
