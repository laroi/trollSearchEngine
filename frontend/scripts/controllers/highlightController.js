define(['./storeController'], function (store) {
    var highlight,
    getHighlight,
    dispalyTitles = {
        'basic_search': 'Search',
        group: 'Group',
        isPlain: 'Plain Memes',
        isAdult: 'Adult Memes',
        isFavorite: 'Favorite Memes',
        isApproved: 'Approval Pending',
        userId: 'User'
    };
    getHighlight = function(type, key, val) {
    var className ="";
        if (key) {
            var updateVal = "";
            if (type === 'filters') {
                if (val && typeof val !== 'boolean') {
                    //if (key === 'userId') {
                        //val = store.get('username');
                    //}
                    updateVal = dispalyTitles[key] + ' : ' + val;                    
                } else {
                    updateVal = dispalyTitles[key];
                }
                className = 'hl-filter'
            } else {
                className = 'hl-search'
                //if (typeof val === "object"){
                    //Object.keys(val).forEach(function(va){
                        updateVal = key + ' : ' + val;
                    //})
                //}
                
            }
            
            var html = "<span data-type='" + type + " 'data-key='" + key + "' class=' " + className + " highlight-cont'>"+updateVal+"<span class='hl-close'></span></span>";
            return html;
        }
        return "";
    }
    highlight = function () {
        var search_term = store.get('search_term'),
            filters = store.get('filters') || {},
            filterKeys = Object.keys(filters),
            html = '';
            if (search_term && Object.keys(search_term).length>0) {
                Object.keys(search_term).forEach(function(sKey) {
                    html +=  getHighlight('search_term', sKey, search_term[sKey] );
                });
            }
            console.log(filterKeys)
            filterKeys.forEach(function(key) {
                html +=  getHighlight('filters', key, filters[key]);
            });
            $('#high-lighter').empty().html(html);
    };
    return {
        highlight: highlight
    }

})
