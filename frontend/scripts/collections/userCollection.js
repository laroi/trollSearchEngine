define(['controllers/requestController', 'controllers/storeController', 'models/postModel'], function (request, store, PostModel) {
    let user = () => {
        let context = [];
        let lang = [];
        getContext = (callback) => {            
            if (context.length < 1) {
                request.get('/api/contexts', function (contErr, contData) {
                    if (!contErr) {
                        context = contData
                        callback(undefined, context);
                        return;
                    }
                    callback(err, undefined)
                    return;
                })
            } else {
                callback(undefined, context)
                return
            }      
        }
        getLang = (callback) => {            
            if (lang.length < 1) {
                request.get('/api/langs', function (langErr, langData) {
                    if (!langErr) {
                        lang = langData
                        callback(undefined, lang);
                        return;
                    }
                    callback(err, undefined)
                    return;
                })
            } else {
                callback(undefined, lang)
                return
            }
        }
        
        return {
            getContext : getContext,
            getLang : getLang
        }
    }
    return user();
})
