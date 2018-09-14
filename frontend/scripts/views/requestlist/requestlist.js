define([
'../../controllers/requestController',
'../../controllers/storeController',
'../../controllers/urlController',
'../../controllers/userController',
'../../collections/requestCollection',
 'text!./requestlist.html'
], function (request, store, url, user, requestCollection, html) {
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
        let disableFilters = () => {
            $('.language-list').prop('disabled', true);
            $('.context-list').prop('disabled', true);
            $('.isPlain').prop('disabled', true);
            $('.isAdult').prop('disabled', true);
            $('.isFavorite').prop('disabled', true);
            $('.isMine').prop('disabled', true);
            $('.isApproved').prop('disabled', true);
            $('#basic-search').prop('disabled', true);
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
            render = function (id) {
                disableFilters();
                requestCollection.getAllRequests({from:0}, false, (err, requests) => {
                    var html = template({requests: requests});
                    $('#request-contents').empty().append(html);
                    $('#request-contents').show();
                    $('#post-contents').hide();
                    requestCollection.getRequestUserDetails()
                    .then(()=> {
                        $('.panel-body').each((index, element)=> {
                            console.log($(element).attr('id'));
                            requestCollection.getRequestById($(element).attr('id'), (err, request)=> {
                                if (request) {
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
