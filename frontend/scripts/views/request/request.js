define([
'../../controllers/requestController',
'../../controllers/storeController',
'../../controllers/urlController',
'../../controllers/userController',
'../../collections/userCollection',
 'text!./request.html'
], function (request, store, url, user, userCollection, html) {
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
                if ($('#req-title').val().trim() == '') {
                    isValidate = false
                }
                return isValidate;
            };
            var save = function (callback) {
                var date = new Date();
                var url = '/api/request',
                    postData = {
                        movie: $('#req-movie').val().trim(),                     
                        title: $('#req-title').val().trim(),
                        language:$("#req-language").val().trim() === 'Select' ? '' : $("#req-language").val().trim(),
                        user: store.get('userId'),
                        link: $('#req-link').val().trim(),
                        image: imageData,
                        description: $('#req-desc').val().trim()
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
                imageData = '';
                userCollection.getLang((err, langs)=> {
                    var html = template({requests: undefined, langs:langs});
                    $('#requestModel').empty().append(html);
                    updateUi();
                    $('#request-meme').on('hidden.bs.modal', gotoHome);
                    $('#btn-request-meme').on('click', sendRequest)
                    $("#req-file").change(function(){
                        var input = $(this)[0];
                        if (input.files && input.files[0]) {
                            $('.form-left').removeClass('col-md-12').addClass('col-md-6');
                            $('.form-right').show();
                            var reader = new FileReader();
                            reader.onload = function (e) {
                                imageData = e.target.result;
                                $('.req-meme-img').attr('src', imageData);
                               // imageData = {type: input.files[0].type.split('/')[1], image:imageData.replace(/^data:image\/(png|jpg|jpeg);base64,/, "")};
                                //imageData.name = input.files[0].name || ''
                            }
                            reader.readAsDataURL(input.files[0]);
                        } else {
                            $('.form-left').removeClass('col-md-6').addClass('col-md-12');
                            $('.form-right').hide();
                        }
                    });
                })                    
            }
            return {
                render: render
            }
        }
        return requestView();
})
