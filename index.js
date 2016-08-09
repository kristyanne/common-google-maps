'use strict';

(() => {
    class GoogleMap {
        static defaults(options) {
            return {
                map: {
                    zoom: 5
                }
            }
        }

        static APILoaded() {
            return (typeof google === 'object' && typeof google.maps === 'object');
        }

        static validateDefaultPosition(pos) {
            return (pos && pos.lat && pos.lng) ? true : false;
        }

        constructor(el, options) {
            this.element = el;

            this.key = 'AIzaSyCsKwx_jWZJVONm2abP2jcBoVVBh-Z9y3w';

            this.API = {
                url: '//maps.googleapis.com/maps/api/js?',
                v: '3.24',
                params: {
                    key: this.key
                }
            }

            this.settings = Object.assign({}, GoogleMap.defaults(options), options);

            this.mapInstance = null;
        }

        loadAPI() {
            return new Promise((resolve, reject) => {
                if(GoogleMap.APILoaded()) {
                    resolve();
                } else {
                    //TODO: NEED TO MAP this.API.params so that we can do this:
                    // other_params: params.map().join('&')
                    google.load('maps', this.API.v, {
                        other_params: 'key=' + this.API.params.key,
                        callback() {
                            resolve();
                        }
                    });
                }
            });
        }

        renderMap() {
            // Google Maps needs a default lat/lng value to render the map.
            // Check that these values have been passed.
            let pos = this.settings.position;

            if(!GoogleMap.validateDefaultPosition(pos)) {
                console.error('No default position data defined. Exiting.');
                return;
            }

            // Load the Google Maps API and once complete, create a new Map
            // instance.
            this.loadAPI().then(() => {
                let position = new google.maps.LatLng(pos.lat, pos.lng);
                let options = this.settings.map;

                options.center = position;

                this.mapInstance = new google.maps.Map(this.element, options);

                // TODO: SHOULD THIS BE CONFIGURABLE?
                this.addMarkers();
            });
        }

        addMarkers() {
            if(!this.mapInstance) {
                console.error('No map instance created. Exiting.');
                return;
            }

            let pos = this.settings.position;

            let marker = new google.maps.Marker({
                position: new google.maps.LatLng(pos.lat, pos.lng),
                map: this.mapInstance
            });
        }
    }

    // Initialise a new GoogleMap instance.
    let els = document.getElementsByClassName('map');

    for(let i = 0; i <= els.length - 1; i++) {
        let Map = new GoogleMap(els[i], {
            position: {
                lat: 48.8583701, // Default lat value - map loads centered on this
                lng: 2.2922873   // Default lng value - map loads centered on this
            },
            map: {
                zoom: 10,
                //scrollwheel: false
            }
        });

        Map.renderMap();
    }
})();
