define([
'../../controllers/requestController',
'../../controllers/storeController',
'../../controllers/urlController',
'../../controllers/userController',
 'text!./request.html'
], function (request, store, url, user, html) {
     var source   = $(html).html(),
        template = Handlebars.compile(source),
        render,
        imageData;
        var updateUi = function () {
         $('#request-meme').modal({show: true}); 
        }
        var gotoHome = function () {
            url.navigate('landing');
        }
        let sendRequest = (e) => {
            var validate = function(){
                var isValidate = true;
                if ($('#req-movie').val().trim() == '') {
                    isValidate = false
                }
                if ($('#req-desc').val().trim() == '') {
                    isValidate = false
                }
                return isValidate;
            };
            var save = function (callback) {
                var date = new Date();
                var url = '/api/request',
                    postData = {
                        moveiName: $('#req-movie').val().trim(),                     
                        user: {id: store.get('userId'), name: store.get('username'), image: store.get('picture')},
                        description:$('#req-desc').val().trim(),
                        createdAt: date.toISOString(),
                        lastModified: date.toISOString()
                    }
                    request.postImage(url, postData, function(err, data) {
                        callback(err, data)
                    });
            }
            if (validate()) {
                save(function(err, data) {
                    
                    if (!err) {
                        $('#request-meme').modal( 'hide' ).data( 'bs.modal', null );
                        toastr.success('Your request has been submitted!', 'FTM Says')
                    } else {
                        console.error(err);
                        toastr.error('Failed to submit the request.', 'FTM Says')
                    }
                    
                });
            } else {
                toastr.error('Please fill the required fields!', 'FTM Says')
            }
        }
        var requestView = function () {
            var render;
            render = function (id) {
                    var html = template();
                    $('#requestModel').empty().append(html);
                    updateUi();
                    $('#request-meme').on('hidden.bs.modal', gotoHome);
                    $('#btn-request-meme').on('click', sendRequest)
                    $("#req-file").change(function(){
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
            }
            return {
                render: render
            }
        }
        return requestView();
})
