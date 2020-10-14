define([
'../../controllers/requestController',
'../../controllers/storeController',
'../../controllers/urlController',
'../../controllers/userController',
'../../collections/requestCollection',
'../../collections/userCollection',
 'text!./editrequest.html',
 'handlebars',
 'toastr'
], function (request, store, url, user, requestCollection, userCollection, html, Handlebars, toastr) {
     var source   = $(html).html(),
        template = Handlebars.compile(source),
        render,
        requestId,
        requestObject,
        imageData;
        Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
            if(arg1 && arg2) {
                if ((typeof(arg1==="string")) && (typeof(arg1==="string"))) {
                    arg1 = arg1.toLowerCase().trim();
                    arg2 = arg2.toLowerCase().trim();
                }
                return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
            } else {
                return false;
            }
        });


        var updateUi = function (resRequest) {
         $('#request-meme').modal({show: true});
         if (resRequest.thumbUrl) {
            $('.form-left').removeClass('col-md-12').addClass('col-md-6');
            $('.form-right').show();
         } else {
               $('.form-left').removeClass('col-md-6').addClass('col-md-12');
               $('.form-right').hide();
         }
         if (resRequest.description) {
            $('#req-desc').trigger('change');
         }
         if (resRequest.movie) {
            $('#req-movie').trigger('change');
         }
         if (resRequest.title) {
            $('#req-title').trigger('change');
         }
         if (resRequest.link) {
            $('#req-link').trigger('change');
         }
        }
        var gotoHome = function () {
                 $('#request-meme').modal('hide');
//            url.navigate('requestList');
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
            if (validate()) {
                let data = {},
                    movie = $('#req-movie').val().trim(),
                    title = $('#req-title').val().trim(),
                    language = $("#req-language").val().trim(),
                    link = $('#req-link').val().trim(),
                    description = $('#req-desc').val().trim();
                if (movie && movie !== requestObject.movie) {
                    data.movie = movie;
                }
                if (title && title !== requestObject.title) {
                    data.title = title;
                }
                if (language !== 'Select' && language !== requestObject.language) {
                    data.language = language;
                }
                if (link && requestObject.link !== link) {
                    data.link = link
                }
                if (description && requestObject.description !== description) {
                    data.description = description;
                }
                if (imageData) {
                    data.image = imageData;
                }
                //data.user = store.get('userId');
                console.log(data);
                if (Object.keys(data).length > 0) {
                    data._id = requestId;
                requestCollection.updateRequestById(data)
                .then(()=> {
                    toastr.success('Request Edited!', 'Memefinder Says')
                    gotoHome();
                })
                .catch((err)=> {
                    console.error('[UPDATE REQUEST] ', err);
                    toastr.error('Could not edit request!', 'Memefinder Says');
                })
                } else {
                    toastr.warning('There are no changes to save !', 'Memefinder says')
                }
            } else {
                toastr.error('Please fill the required fields!', 'Memefinder Says')
            }
        }
        var editRequestView = function () {
            var render;
            render = function (id) {
                requestId = id;
                requestCollection.getRequestById(id, (err, resRequest)=> {
                    userCollection.getLang((err, langs)=> {
                        requestObject = resRequest;
                        var html = template({request: resRequest, langs: langs});
                        $('#requestModel').empty().append(html);
                        updateUi(resRequest);
                        $('#request-meme').on('hidden.bs.modal', gotoHome);
                        $('#btn-save-request-meme').on('click', sendRequest)
                        $("#req-file").change(function(){
                            var input = $(this)[0];
                            if (input.files && input.files[0]) {
                                $('.form-left').removeClass('col-md-12').addClass('col-md-6');
                                $('.form-right').show();
                                var reader = new FileReader();
                                reader.onload = function (e) {
                                    imageData = e.target.result;
                                    $('.req-meme-img').attr('src', imageData);
                                    imageData = {type: input.files[0].type.split('/')[1], image:imageData.replace(/^data:image\/(png|jpg|jpeg);base64,/, "")};
                                    imageData.name = input.files[0].name || ''
                                }
                                reader.readAsDataURL(input.files[0]);
                            } else {
                                $('.form-left').removeClass('col-md-6').addClass('col-md-12');
                                $('.form-right').hide();
                            }
                        });
                    });
                })
            }
            return {
                render: render
            }
        }
        return editRequestView();
})
