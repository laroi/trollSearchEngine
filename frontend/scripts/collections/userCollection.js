define(['scripts/controllers/requestController', 'scripts/controllers/storeController', 'scripts/models/postModel'], function (request, store, PostModel) {
    let user = () => {
        let context = [];
        let lang = [];
        getContext = (callback) => {            
            if (context.length < 1) {
                request.get('/api/contexts', function (contErr, contData) {
                    if (!contErr && Array.isArray(contData) && contData.length > 0) {
                        contData = contData.map(_=> " "+_.capitalize()+ " ");
                        context = contData
                        callback(undefined, context);
                        return;
                    }
                    callback(contErr, undefined)
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
                        langData = langData.map(_=> " "+_.capitalize()+ " ");
                        lang = langData
                        callback(undefined, lang);
                        return;
                    }
                    callback(langErr, undefined)
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
