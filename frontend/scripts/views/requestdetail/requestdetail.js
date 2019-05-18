define([
'../../controllers/requestController',
'../../controllers/storeController',
'../../controllers/urlController',
'../../controllers/userController',
'../../collections/requestCollection',
'../editrequest/editrequest',
'../respond/respond',
 'text!./requestdetail.html',
 'handlebars',
 'toastr'
], function (request, store, url, user, requestCollection, editRequestView, respondView, html, Handlebars, toastr) {
     var source   = $(html).html(),
        template = Handlebars.compile(source),
        replyId = undefined,
        render;
        let editRequest = (e) => {
            let id = $(e.target).parent().parent().parent().attr('id'); 
            $('#detail-cont').modal('hide'); 
            editRequestView.render(id);
        }
        let deleteRequest = (id) => {
            return function () {
                requestCollection.deleteRequestById(id)
                .then(()=>{
                    $('#detail-cont').modal('hide');
                    $('#'+id).parent().parent().remove();
                    toastr.success('Your request is deleted!', 'Memefinder Says')
                })
                .catch((err)=> {
                    console.error('error in deleting request '+ id,  err);
                    toastr.error('Deleteing request failed.', 'Memefinder Says')
                })
            }
        }
        let confirmDelete = (e) => {
            let id = $(e.target).parent().parent().parent().attr('id');
            $.confirm({
                title: 'Confirm Delete!',
                content: 'Simple confirm!',
                buttons: {
                    cancel: function () {
                    },
                    delete: {
                        text: 'Delete',
                        btnClass: 'btn-red',
                        keys: ['enter'],
                        action: deleteRequest(id)
                    }
                }
            });
        };
        let triggerInputFile = (e) => {
            replyId = $(e.target).parent().parent().parent().attr('id'); 
            $('#reply-input').click();
        }
        var updateUi = function () {
         $('#detail-cont').modal({show: true}); 
        }
        var gotoHome = function () {
            url.navigate('requestList');
        }
        var detailView = function () {
            var render;
            render = function (id) {
                requestCollection.getRequestById(id, function(err, request) {
                    if (!err && request) {
                        if (request.height && request.width) {
                            let containerWidth = $(window).width() - 68;
                            request.adjustedHeight = (containerWidth < 552 ? containerWidth : 552)*(request.height/request.width)
                        }
                        var html = template(request);
                        $('#detailModel').empty().append(html);
                        updateUi();
                        $('.det-edit-request').on('click', editRequest);
                        $('.det-delete-request').on('click', confirmDelete);
                        $('.det-reply-request').on('click', triggerInputFile);
                        /*$("#reply-input").change(function(){
                            let input = $(this)[0],
                            imageData = undefined;
                            if (input.files && input.files[0]) {
                                var reader = new FileReader();
                                reader.onload = function (e) {
                                    imageData = e.target.result;
                                    imageData = {type: input.files[0].type.split('/')[1], image:imageData.replace(/^data:image\/(png|jpg|jpeg);base64,/, "")};
                                    imageData.name = input.files[0].name || ''
                                    $('#detail-cont').modal('hide'); 
                                    respondView.render(e.target.result, replyId);
                                }
                                reader.readAsDataURL(input.files[0]);
                            }
                        });*/
                  
                        $('#detail-cont').on('hidden.bs.modal', gotoHome)
                    } else {
                        toastr.error('We seems to have a problem. Please check your internet connection.', 'Memefinder Says')
                    }
                });                
            }
            return {
                render: render
            }
        }
        return detailView();
})
