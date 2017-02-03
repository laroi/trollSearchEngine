define(['./storeController'], function (store) {
    var highlight,
    getHighlight;
    getHighlight = function(type, val, key) {
    var className ="";
        if (key && val) {
            var updateVal = "";
            if (type === 'filters') {
                updateVal = key;
                className = 'hl-filter'
            } else {
                className = 'hl-search'
                if (typeof val === "object"){
                    Object.keys(val).forEach(function(va){
                        updateVal = va + " : " + val[va];
                    })
                }
                
            }
            
            var html = "<span data-type='" + type + " 'data-key='" + key + "' class=' " + className + " highlight-cont'>"+updateVal+"<span class='hl-close'></span></span>";
            return html;
        }
        return "";
    }
    highlight = function () {
        var search_term = store.get('search_term'),
            advSearch = store.get('advSearch') || {},
            searchKeys = Object.keys(advSearch),
            filters = store.get('filters') || {},
            filterKeys = Object.keys(filters),
            html = '';
            if (Object.keys(search_term).length>0) {
                html +=  getHighlight('search_term', search_term, 'basic_search');
            }
            searchKeys.forEach(function(key) {
                html +=  getHighlight('search', advSearch[key], key);
            });
            filterKeys.forEach(function(key) {
                html +=  getHighlight('filters', filters[key], key);
            });
            $('#high-lighter').empty().html(html);
    };
    return {
        highlight: highlight
    }

})
