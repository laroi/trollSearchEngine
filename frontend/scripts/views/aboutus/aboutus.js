define([
'../../controllers/requestController',
'../../controllers/storeController',
 'text!./aboutus.html',
 'handlebars'
], function (request, store, html, Handlebars) {
     var source   = $(html).html(),
        template = Handlebars.compile(source),
        render;
        let validateEmail = (emailField) => {
                var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
                if (reg.test(emailField) == false) 
                {
                    return false;
                }
                return true;
        }
        let sendFeedback = (e) => {
            let email = $('#feed-email').val().trim(),
                name = $('#feed-name').val().trim(),
                message = $('#feed-msg').val().trim();
            let validateForm = () => {
                if (email === ""){
                    return false;
                }
                if (!validateEmail(email)) {
                    return false;
                }
                if (name === "") {
                    return false;
                }
                if (message === "") {
                    return false;
                }
                return true;
            }
            
            if (validateForm()) {
                request.post('/api/feedback', {email:email, name: name, message: message}, function (err, data) {
                    if (!err) {
                         toastr.success('Your feedback has been submitted!', 'FTM Says');
                         $('#about-us').modal('hide').data('bs.modal', null);
                    } else {
                        toastr.success('Error in submitting feedback!', 'FTM Says');
                    }
                }) 
            } else {
                toastr.error('Please recheck your submission!', 'FTM Says');
            }
        }
        var requestView = function () {
            var render;
            render = function () {
                    var html = template({email: store.get('email'), name: store.get('username')});
                    $('#aboutModel').empty().append(html);
                    $('#feed-name').trigger("change");
                    $('#feed-email').trigger("change");                    
                    $('#about-us').modal({show: true});
                    $('#btn-send-feedback').on('click', sendFeedback)
            }
            return {
                render: render
            }
        }
        return requestView();
})
