define([
'../../controllers/requestController',
'../../controllers/storeController',
'../../controllers/urlController',
'../../controllers/userController',
 'text!./register.html'
], function (request, store, url, user, html) {
     var source   = $(html).html(),
        template = Handlebars.compile(source),
        imageData;
       
        let register = () => {
            let email = $('#login-email').val().trim();
            let password = $('#login-password').val().trim();
            let name = $('#login-name').val().trim();
            let phone = $('#login-phone').val().trim();
            let validate = () => {
                if (!email) {
                    return false;
                }
                if (!password) {
                    return false;
                }
                if (!name) {
                    return false;
                }
                return true;
            }
            if (validate()) {
                request.post('/api/')
            }
        }
        var registerView = function () {
            var render;
            render = function () {
                    var html = template();
                    $('#authModel').empty().append(html);
                    $('#register-modal').modal({show: true}); 
                    //$('#login-modal').on('hidden.bs.modal', gotoHome);
                    $('#btn-register').on('click', register);
                    $("#prof-img").change(function(){
                        var input = $(this)[0];
                        if (input.files && input.files[0]) {
                            var reader = new FileReader();
                            reader.onload = function (e) {
                                imageData = e.target.result;
                                //$('.img-preview').attr('src', imageData);
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
        return registerView();
})
