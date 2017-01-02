define(['./storeController'], function (store) {
    var navigate;
    navigate = function (key) {
        var hash = '';
        hash += '?from=';
        hash += store.get('from') || 0;
        var search_term = store.get('search');
        if (search_term) {
            hash += '&search=';
            hash += search_term
        }
        window.location.hash = hash
    };
    return {
        navigate: navigate
    }

})
