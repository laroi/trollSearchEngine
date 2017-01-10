define(['./storeController'], function (store) {
    var highlight,
    getHighlight;
    getHighlight = function(type, val, key) {
    var className ="";
        if (key && val) {
            var updateVal = "";
            if (type === 'filter' && val === true) {
                updateVal = key;
                className = 'hl-filter'
            } else {
                className = 'hl-search'
                updateVal = key + " : " + val;
            }
            
            var html = "<span data-type='" + type + " 'data-key='" + key + "' class=' " + className + " highlight-cont'>"+updateVal+"<span class='hl-close'></span></span>";
            return html;
        }
        return "";
    }
    highlight = function () {
        var search = store.get('search'),
            advSearch = store.get('advSearch') || {},
            searchKeys = Object.keys(advSearch),
            filters = store.get('filters') || {},
            filterKeys = Object.keys(filters),
            html = '';
            html +=  getHighlight('search', search, 'search');
            searchKeys.forEach(function(key) {
                html +=  getHighlight('search', advSearch[key], key);
            });
            filterKeys.forEach(function(key) {
                html +=  getHighlight('filter', filters[key], key);
            });
            $('#high-lighter').empty().html(html);
    };
    return {
        highlight: highlight
    }

})
