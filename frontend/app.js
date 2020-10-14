landing = require('scripts/views/landing/landing')

init = () => {
    
}
if (!('serviceWorker' in navigator)) {
    console.log('Service worker not supported');
    init()
} else {
    navigator.serviceWorker.register('service-worker.js')
    .then(function() {
        console.log('Registered');
        init()
    })
    .catch(function(error) {
        console.log('Registration failed:', error);
    });
}

