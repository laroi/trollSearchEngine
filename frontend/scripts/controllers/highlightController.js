
//TODO : Make filter array different from display array
define(['./storeController'], function (store) {
    var highlight,
    getHighlight,
    dispalyTitles = {
        'basic_search': 'Search',
        context: 'Context',
        lang: 'Language',
        isPlain: 'Plain Memes',
        isAdult: 'Adult Memes',
        isFavorite: 'Favorite Memes',
        isApproved: 'Approval Pending',
        userId: 'User',
        username : 'User'
    };
    getHighlight = function(type, key, val) {
    var className ="";
        if (key) {
            var updateVal = "";
            if (type === 'filters') {
                if (val && typeof val !== 'boolean') {                    
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
            
            var html = "<div data-type='" + type + " 'data-key='" + key + "' class=' " + className + " highlight-cont'><div style='float:left; height:20px; margin-top:4px'>"+updateVal+"</div><div class='far fa-times-circle hl-close'></div></div>";
            return html;
        }
        return "";
    }
    highlight = function () {
        var search_term = store.get('search_term'),
            filters = store.get('filters') || {},
            filterKeys = Object.keys(filters),
            html = '',
            filterExclusions = ['from', 'username'];            
            if (search_term && Object.keys(search_term).length>0) {
                Object.keys(search_term).forEach(function(sKey) {
                    html +=  getHighlight('search_term', sKey, search_term[sKey] );
                });
            }
            filterKeys.forEach(function(key) {
                if (filterExclusions.indexOf(key) < 0) {
                    if (key!== 'username') {
                        var val;
                        if (key === 'userId') {
                            val = filters['username'] || filters[key];
                        } else {
                            val = filters[key]
                        }
                        html +=  getHighlight('filters', key, val);
                    } else {
                        html +=  getHighlight('filters', key, store.get('username'));
                    }
                }
            });
            $('#high-lighter').empty().html(html);
    };
    return {
        highlight: highlight
    }

})
