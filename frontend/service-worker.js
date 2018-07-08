let filesToCache = [
'/',
'/app.js',
'/index.html',
'/libs/bootstrap-3.3.6-dist/fonts/glyphicons-halflings-regular.eot',
'/libs/bootstrap-3.3.6-dist/fonts/glyphicons-halflings-regular.svg',
'/libs/bootstrap-3.3.6-dist/fonts/glyphicons-halflings-regular.ttf',
'/libs/bootstrap-3.3.6-dist/fonts/glyphicons-halflings-regular.woff',
'/libs/bootstrap-3.3.6-dist/fonts/glyphicons-halflings-regular.woff2',
'/libs/bootstrap-3.3.6-dist/js/bootstrap.js',
'/libs/bootstrap-3.3.6-dist/js/npm.js',
'/libs/bootstrap-checkbox.min.js',
'/libs/bootstrap.min.js',
'/libs/bootstrap3-typeahead.js',
'/libs/bootstrap3_6.min.js',
'/libs/crossroads.min.js',
'/libs/fbsdk.js',
'/libs/handlebars-v4.0.5.js',
'/libs/imagesloaded.pkgd.js',
'/libs/jquery-1.10.2.min.js',
'/libs/jquery-ui.min.js',
'/libs/jquery.dropdown.js',
'/libs/masonry.pkgd.min.js',
'/libs/material.js',
'/libs/require.js',
'/libs/ripples.js',
'/libs/sdk.js',
'/libs/signals.js',
'/libs/tag-it.js',
'/libs/text.js',
'/libs/toastr.min.js',
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
'/scripts/views/components/mainHeader.html',
'/scripts/views/components/profileMenu.html',
'/scripts/views/components/search.html',
'/scripts/views/components/singup.html',
'/scripts/views/create/create.html',
'/scripts/views/create/create.js',
'/scripts/views/detail/detail.html',
'/scripts/views/detail/detail.js',
'/scripts/views/landing/landing.html',
'/scripts/views/landing/landing.js',
'/scripts/views/request/request.html',
'/scripts/views/request/request.js',
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
'/styles/less/bootstrap-material-design.less',
'/styles/less/plugins/_plugin-dropdownjs.less',
'/styles/less/plugins/_plugin-nouislider.less',
'/styles/less/plugins/_plugin-selectize.less',
'/styles/less/plugins/_plugin-snackbarjs.less',
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
'/styles/ripples.css.map',
'/styles/search-box.css',
'/styles/style.css',
'/styles/tagit.ui-zendesk.css',
'/styles/toastr.min.css',
'/styles/toggle.css',
'/styles/webfonts/fa-brands-400.eot',
'/styles/webfonts/fa-brands-400.svg',
'/styles/webfonts/fa-brands-400.ttf',
'/styles/webfonts/fa-brands-400.woff',
'/styles/webfonts/fa-brands-400.woff2',
'/styles/webfonts/fa-regular-400.eot',
'/styles/webfonts/fa-regular-400.svg',
'/styles/webfonts/fa-regular-400.ttf',
'/styles/webfonts/fa-regular-400.woff',
'/styles/webfonts/fa-regular-400.woff2',
'/styles/webfonts/fa-solid-900.eot',
'/styles/webfonts/fa-solid-900.svg',
'/styles/webfonts/fa-solid-900.ttf',
'/styles/webfonts/fa-solid-900.woff',
'/styles/webfonts/fa-solid-900.woff2',
'/api/contexts',
'/api/langs'
]
self.importScripts('/libs/pouchdb.min.js');
var db = new PouchDB('trolls');
self.addEventListener('install', function(event) {
    console.log('Service worker installing...');
    // TODO 3.4: Skip waiting
    event.waitUntil(
    caches.open('toller').then(function(cache) {
     return cache.addAll(filesToCache);
    })
    );

});

self.addEventListener('activate', function(event) {
  console.log('Service worker activating...');
});

self.addEventListener('fetch', function(event) {
 
 //if (event.request.method === "POST" && event.request.uri==="")
 if (event.request.method === "POST" && event.request.url === self.registration.scope+'api/posts') {
    fetch(event.request)
    .then((resp)=> {
         console.log('this also should not work')
         return resp.json();
    }).then((data)=> {
    console.log('This should not work')
        console.log('This should not work')
        return db.get('trolls').then(function(doc) {
          return db.put({
            _id: 'trolls',
            _rev: doc._rev,
            data: data
          });
        }).then(function(response) {
          return data;
        })        
    })
    .catch((err)=> {
        console.log('first log in fail')
       return db.get('trolls').
       then((data)=> {
       console.log(data.data);
        return data.data;
       })
        /*db.get('trolls').then(function (doc) {
            console.log(JSON.stringify(doc.data));
          event.respondWith(doc);
        }).catch(function (err) {
          console.log(err);
        });*/   
    })
 } else {
     event.respondWith(
       caches.match(event.request).then(function(response) {
         return response || fetch(event.request);
       })
   );
   }
   

});
