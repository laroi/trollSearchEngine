define([
'../../controllers/requestController',
'../../controllers/storeController',
'../../controllers/urlController',
'../../controllers/userController',
'../../collections/requestCollection',
'../editrequest/editrequest',
 'text!./requestlist.html'
], function (request, store, url, user, requestCollection, editRequestView, html) {
     var source   = $(html).html(),
        template = Handlebars.compile(source),
        render;
        var updateUi = function () {
        }
        var gotoHome = function () {
            url.navigate('landing');
        }
        let sendRequest = (e) => {



        }
        let editRequest = (e) => {
            let id = $(e.target).parent().parent().parent().parent().parent().attr('id');
            editRequestView.render(id);
        }
        Handlebars.registerHelper('pageLink', function(total, limit, current) {
            var accum = '',
            n = Math.ceil(total/limit),
            limit = n < 5 ? n : 5,
            classNamePrev ='page-item';
            classNameNext ='page-item';
            if (current < 2) {
               classNamePrev += ' disabled';
            }
            accum += '<li class="' + classNamePrev + '"><span class="page-prev page-link" aria-label="Previous"><span aria-hidden="true">&laquo;</span><span class="sr-only">Previous</span></span></li>'
            for(var i = 1; i <= limit; ++i) {
                accum += '<li class="page-item"><span class="page-nav ';
                if (i === current) {
                    accum += "current";
                }
                accum += ' page-link">' + i + '</span></li>';
            }
            if (limit>5){
                accum += '<li class="page-item"><span class="page-nav page-link">' + n + '</span></li>';
            }
            if (current !== n-1) {
                classNameNext += ' disabled';
            }
            accum += '<li class="' + classNameNext + '"><span class="page-next page-link" aria-label="Next"><span aria-hidden="true">&raquo;</span><span class="sr-only">Next</span></span></li>'
            return accum;
        });
        Handlebars.registerHelper('requestRepliable', function(isOwner) {
            if (isOwner || store.get('userType') === 'admin') {
                return '<div class="pan-btn-cont"><div class="fas fa-reply pan-btn"></div></div>';
            }
            return '';
        })
        Handlebars.registerHelper('requestEditable', function(isOwner) {
            if (isOwner || store.get('userType') === 'admin') {
                return '<div class="pan-btn-cont"><div class="far fa-edit pan-btn edit-request"></div></div>';
            }
            return '';
        })
        Handlebars.registerHelper('requestDeletable', function(isOwner) {
            if (isOwner || store.get('userType') === 'admin') {
                return '<div class="pan-btn-cont"><div class="far fa-trash-alt pan-btn delete-request"></div></div>';
            }
            return '';
        })
        var applyFilter = function (e) {
            var f_lang = $('.language-list').val(),
            f_context=$('.context-list').val(),
            isPlain = $('.isPlain').is(':checked'),
            isAdult = $('.isAdult').is(':checked'),
            isFavorite = $('.isFavorite').is(':checked'),
            isMine = $('.isMine').is(':checked'),
            isApproved = $('.isApproved').is(':checked'),
            isRequest = $('.isRequest').is(':checked'),
            filtObj = {};
            if (isRequest) {
                filtObj.request = true;
                filtObj.context = undefined;
                filtObj.isPlain = undefined;
                filtObj.isAdult = undefined;
                filtObj.isApproved = undefined;
                filtObj.isFavorite = undefined;
                filtObj.userId = undefined;
                filtObj.username = undefined;
                url.navigate('requestList');
            } else {
                if (f_lang && f_lang !== "0") {
                    filtObj.lang = f_lang;
                }
                if (isPlain) {
                    filtObj.isPlain = isPlain;
                }
                if (isAdult) {
                    filtObj.isAdult = isAdult;
                }
                if (isFavorite) {
                    filtObj.isFavorite = isFavorite;
                }
                if (isMine) {
                    filtObj.userId = store.get('userId');
                    filtObj.username = store.get('username');
                }
                if (f_context && f_context !== "0") {
                    filtObj.context = f_context;
                }
                if (store.get('userType') === 'admin' && isApproved) {
                    filtObj.isApproved = false;
                }
                store.set('filters', filtObj);                
                store.set('from', 0);
                url.navigate('landing');
            }
            $('.dropdown.open').removeClass('open');
        };
        let disableFilters = () => {
            $('.language-list').prop('disabled', true);
            $('.context-list').prop('disabled', true);
            $('.isPlain').prop('disabled', true);
            $('.isAdult').prop('disabled', true);
            $('.isFavorite').prop('disabled', true);
            $('.isMine').prop('disabled', true);
            $('.isApproved').prop('disabled', true);
            $('#basic-search').prop('disabled', true);
            $('.isRequest').prop('checked', true )
            
        };
        let invertColor = (hex, bw) => {
            let padZero = (str, len) => {
                len = len || 2;
                var zeros = new Array(len).join('0');
                return (zeros + str).slice(-len);
            }
            if (hex.indexOf('#') === 0) {
                hex = hex.slice(1);
            }
            // convert 3-digit hex to 6-digits.
            if (hex.length === 3) {
                hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
            }
            if (hex.length !== 6) {
                throw new Error('Invalid HEX color.');
            }
            var r = parseInt(hex.slice(0, 2), 16),
                g = parseInt(hex.slice(2, 4), 16),
                b = parseInt(hex.slice(4, 6), 16);
            if (bw) {
                // http://stackoverflow.com/a/3943023/112731
                return (r * 0.299 + g * 0.587 + b * 0.114) > 186
                    ? '#000000'
                    : '#FFFFFF';
            }
            // invert color components
            r = (255 - r).toString(16);
            g = (255 - g).toString(16);
            b = (255 - b).toString(16);
            // pad each with zeros and return
            return "#" + padZero(r) + padZero(g) + padZero(b);
        }
        Handlebars.registerHelper('getStyle', function() {
            let backcolor=(0|Math.random()*16777216).toString(16);
            while(backcolor.length<6)backcolor=0+backcolor;
            let forecolor = invertColor('#'+backcolor, true)
            return 'color:' + forecolor + '; background-color: #' + backcolor
        });
        var requestListView = function () {
            var render;
            render = function (query) {
                disableFilters();
                let from;
                if (query) {
                    from = query.from
                } else {
                    from = 0;
                }
                $('.btn-apply-filter').off('click').on('click', applyFilter);
                requestCollection.getAllRequests({from:from || 1, limit: 10}, false, (err, requests) => {
                    var html = template({requests: requests});
                    $('#request-contents').empty().append(html);
                    $('#request-contents').show();
                    $('#post-contents').hide();
                    $('.edit-request').on('click', editRequest)
                    requestCollection.getRequestUserDetails()
                    .then(()=> {
                        $('#request-contents').children('.panel-cont').children('.page-cont').children('.elem-cont').children('.panel').children('.panel-body').each((index, element)=> {
                            console.log($(element).attr('id'));
                            requestCollection.getRequestById($(element).attr('id'), (err, request)=> {
                                if (request) {
                                console.log(request);
                                $(element).children('.bottom-panel').children('.button-panel').children('.row1').children('.user').children('.user-img').attr('src', request.userimg.thumb)
                                }
                            }) 
                        })
                    })
                    
                })
            }
            return {
                render: render
            }
        }
        return requestListView();
})
