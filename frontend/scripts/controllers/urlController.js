define(['./storeController'], function (store) {
    var navigate;
    navigate = function (page, params, isForce) {
        var hash = '#';
        let filterExclusions = ['from'];
        isForce = isForce || false
        if (page === 'landing') {
            store.set('postId', undefined);
            hash += '?from=';
            hash += store.get('from') || 0;
            if (isForce) {
                hash += "&force=true";
            }
            var search_term = store.get('search_term'),
                filters = store.get('filters') || {},
                filterKeys = Object.keys(filters);
            if (search_term) {
                if (search_term.basic_search) {
                    hash += '&search=';
                    hash += search_term.basic_search;
                }
                if (search_term.title) {
                    hash += '&se_title=';
                    hash += search_term.title;
                }
                if (search_term.tag) {
                    hash += '&se_tag=';
                    hash += search_term.tag;
                }
                if (search_term.movie) {
                    hash += '&se_movie=';
                    hash += search_term.movie;
                }
                if (search_term.actor) {
                    hash += '&se_actor=';
                    hash += search_term.actor;
                }
                if (search_term.character) {
                    hash += '&se_character=';
                    hash += search_term.character;
                }
            }        
            if(filterKeys.length > 0) {
                filterKeys.forEach(function(key) {
                    /*if (key === 'isFavorite') {
                        hash += "&";
                        hash += key;
                        hash += "=";
                        hash +=  store.get('stars').join(',') || ""
                    } else {*/
                    if (filterExclusions.indexOf(key) < 0) {
                        if (key !== 'username') {
                            hash += "&"
                            hash += key
                            hash += "=";
                            hash += filters[key];
                        }
                    }
                    //}
                });
            }
        }
        else if (page==='detail') {
            hash += 'post/';
            hash += store.get('postId');
        }
        else if (page === 'requestList') {
            params = params || {};
            hash += 'requests';
            hash += '?from=';
            hash += params.from || 0
        }
        if (window.location.hash !== hash) {
            window.location.hash = hash
        }
        /* else if (isForce){ // Its  a refresh
            window.location.reload()
        }*/
    };
    return {
        navigate: navigate
    }

})
