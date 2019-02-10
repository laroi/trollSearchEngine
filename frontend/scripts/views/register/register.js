define([
'../../controllers/requestController',
'../../controllers/storeController',
'../../controllers/urlController',
'../../controllers/userController',
'handlebars',
 'text!./register.html'
], function (request, store, url, user, Handlebars, html) {
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
                let postData = {email: email, password: password, name: name, phone: phone, picture: imageData}
                request.post('/api/user', postData, function (err, data) {
                    if (!err) {
                        toastr.success('Your registration is accepted. Please verify the email address to complete the process!', 'FTM Says')
                        $('#register-modal').modal( 'hide' ).data( 'bs.modal', null );
                    } else {
                        toastr.error('Could not accept registration request', 'FTM Says')   
                    }
                })
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
