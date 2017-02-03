define(['./storeController'], function (store) {
    var navigate;
    navigate = function (key) {
        var hash = '';
        hash += '?from=';
        hash += store.get('from') || 0;
        var search_term = store.get('search_term'),
            filters = store.get('filters') || {},
            filterKeys = Object.keys(filters);
        if (search_term.basic_search) {
            hash += '&search=';
            hash += search_term.basic_search;
        }        
        if(filterKeys.length > 0) {
            filterKeys.forEach(function(key) {
                hash += "&"
                hash += key
                hash += "=";
                hash += filters[key];
            });
        }
        window.location.hash = hash
    };
    return {
        navigate: navigate
    }

})
