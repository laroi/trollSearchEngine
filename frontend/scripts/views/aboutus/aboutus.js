define([
 'text!./aboutus.html'
], function (html) {
     var source   = $(html).html(),
        template = Handlebars.compile(source),
        render;
        var requestView = function () {
            var render;
            render = function () {
                    var html = template();
                    $('#aboutModel').empty().append(html);
                    $('#about-us').modal({show: true}); 
            }
            return {
                render: render
            }
        }
        return requestView();
})
