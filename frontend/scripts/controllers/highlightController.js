define(['./storeController'], function (store) {
    var highlight,
    getHighlight;
    getHighlight = function(type, val, key) {
        if (key && val) {
            var updateVal = "";
            if (type === 'filter' && val === true) {
                updateVal = key;
            } else {
                updateVal = key + " : " + val;
            }
            
            var html = "<div class='highlight-cont'>"+updateVal+"</div>";
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
            console.log(html);                                   
    };
    return {
        highlight: highlight
    }

})
