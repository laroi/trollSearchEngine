/*let filesToCache = [
'/index.html',
'/app.js',
'/libs/bootstrap.min.js',
'/libs/bootstrap3-typeahead.js',
'/libs/bootstrap3_6.min.js',
'/libs/crossroads.min.js',
'/libs/handlebars-v4.0.5.js',
'/libs/imagesloaded.pkgd.js',
'/libs/jquery-ui.min.js',
'/libs/jquery.dropdown.js',
'/libs/masonry.pkgd.min.js',
'/libs/material.js',
'/libs/require.js',
'/libs/ripples.js',
'/libs/signals.js',
'/libs/tag-it.js',
'/libs/text.js',
'/libs/toastr.min.js',
'/scripts/service-worker.js',
'/scripts/collections/postCollection.js',
'/scripts/collections/userCollection.js',
'/scripts/config/config.js',
'/scripts/controllers/highlightController.js',
'/scripts/controllers/requestController.js',
'/scripts/controllers/storeController.js',
'/scripts/controllers/urlController.js',
'/scripts/controllers/userController.js',
'/scripts/models/postModel.js',
'/scripts/models/userModel.js',
'/scripts/views/aboutus/aboutus.html',
'/scripts/views/aboutus/aboutus.js',
'/scripts/views/components/head_context.html',
'/scripts/views/components/head_lang.html',
'/scripts/views/components/login.html',
'/scripts/views/components/profileMenu.html',
'/scripts/views/components/singup.html',
'/scripts/views/create/create.html',
'/scripts/views/create/create.js',
'/scripts/views/detail/detail.html',
'/scripts/views/detail/detail.js',
'/scripts/views/landing/landing.html',
'/scripts/views/landing/landing.js',
'/scripts/views/request/request.html',
'/scripts/views/request/request.js',
'/libs/jquery-1.10.2.min.js',
'/styles/bootstrap-material-design.css',
'/styles/bootstrap-material-design.css.map',
'/styles/bootstrap-select.min.css',
'/styles/bootstrap-theme.css',
'/styles/bootstrap-theme.css.map',
'/styles/bootstrap-theme.min.css',
'/styles/bootstrap-theme.min.css.map',
'/styles/bootstrap.css',
'/styles/bootstrap.css.map',
'/styles/bootstrap.min.css',
'/styles/bootstrap.min.css.map',
'/styles/css/all.css',
'/styles/css/fontawesome.css',
'/styles/jquery-ui.css',
'/styles/jquery-ui.min.css',
'/styles/jquery.dropdown.css',
'/styles/jquery.tagit.css',
'/styles/less/.csslintrc',
'/styles/less/ripples.less',
'/styles/less/_alerts.less',
'/styles/less/_buttons.less',
'/styles/less/_cards.less',
'/styles/less/_checkboxes.less',
'/styles/less/_colors.less',
'/styles/less/_core.less',
'/styles/less/_dialogs.less',
'/styles/less/_dividers.less',
'/styles/less/_form.less',
'/styles/less/_import-bs-less.less',
'/styles/less/_import-bs-sass.less',
'/styles/less/_inputs-size.less',
'/styles/less/_inputs.less',
'/styles/less/_lists.less',
'/styles/less/_mixins.less',
'/styles/less/_navbar.less',
'/styles/less/_panels.less',
'/styles/less/_plugins.less',
'/styles/less/_popups.less',
'/styles/less/_progress.less',
'/styles/less/_radios.less',
'/styles/less/_shadows.less',
'/styles/less/_table.less',
'/styles/less/_tabs.less',
'/styles/less/_themes.less',
'/styles/less/_togglebutton.less',
'/styles/less/_typography.less',
'/styles/less/_variables.less',
'/styles/less/_welljumbo.less',
'/styles/ripples.css',
'/styles/loader.css',
'/styles/ripples.css.map',
'/styles/search-box.css',
'/styles/style.css',
'/styles/tagit.ui-zendesk.css',
'/styles/toastr.min.css',
'/styles/toggle.css',
'image/user.svg',
'/api/contexts',
'/api/langs'
]*/
let filesToCache = [];  
self.importScripts('/libs/pouchdb.min.js');
var db = new PouchDB('trolls',{revs_limit: 1, auto_compaction: true});
self.addEventListener('install', function(event) {
    console.log('Service worker installing...');
    // TODO 3.4: Skip waiting
    event.waitUntil(
    caches.open('toller')
    .then(function(cache) {
        return cache.addAll(filesToCache);
    })
    .catch((err)=> {
        console.error(err);
    })
    );

});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return true
        }).map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

self.addEventListener('fetch', function(event) {
if ( event.request.url.match( '^.*(\/api\/image\/).*$' ) ) {
        return false;
    }
 //if (event.request.method === "POST" && event.request.uri==="")
 if (event.request.method === "POST" && event.request.url === self.registration.scope+'api/posts') {
    let respo;
    event.respondWith(    
    fetch(event.request)
    .then((resp)=> {
         console.log('live resoponse')
         return resp.json();
    }).then((data)=> {
        respo= data;
        return db.get('trolls')
        .then((res)=> {
            console.log('updating cache', data)
            caches.open('toller')
            .then(function(cache) {
                for (datum in data.hits) {
                    cache.add(data.hits[datum]._source.image.url);
                }
            })            
            return db.put({_id:'trolls', _rev:res._rev, data:data})
        })
        .then(() => {
            console.log('cached response in db', data)
            return new Response(JSON.stringify(data));
        })     
    })
    .catch((err)=> {
        console.log(err);
        if (err.status === 404) {
            return db.put({_id:'trolls', data:respo.data})
            .then((data)=> {
                return new Response(JSON.stringify(data));
            })
            .then(()=> {
                return respo.data
            })
        }
       console.log('first log in fail')
       return db.get('trolls')
       .then((data)=> {
        console.log(data.data)
        return new Response(JSON.stringify(data.data));
       })
       .catch((err)=> {
            console.error(err);
            return new Response(JSON.stringify([]));
       })
        /*db.get('trolls').then(function (doc) {
            console.log(JSON.stringify(doc.data));
          event.respondWith(doc);
        }).catch(function (err) {
          console.log(err);
        });*/   
    }))
 } else {
     event.respondWith(
        caches.open('toller').then(function(cache) {
          return cache.match(event.request)
          .then(function (response) {
            return response || fetch(event.request).then(function(response) {
                if (event.request.url.split(':')[0]!=="data" && event.request.method !== "POST") {
                  cache.put(event.request, response.clone());
                }
              return response;
            });
          })
          .catch((err)=> {
            console.log('error in fetching ', err)
          })
        })
      );
   }
   

});
