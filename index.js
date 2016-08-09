'use strict';

(() => {
    class GoogleMap {
        static defaults(options) {
            return {
                // Options passed to google.maps.Map constructor.
                map: {
                    zoom: 5
                },
                // Set the viewport to contain the given bounds once
                // markers have been added.
                fitMarkerBounds: true
            }
        }

        static APILoaded() {
            return (typeof google === 'object' && typeof google.maps === 'object');
        }

        constructor(el, options) {
            this.element = el;
            this.settings = Object.assign({}, GoogleMap.defaults(options), options);

            this.API = {
                url: '//maps.googleapis.com/maps/api/js?',
                v: '3.24',
                params: {
                    key: 'AIzaSyCsKwx_jWZJVONm2abP2jcBoVVBh-Z9y3w'
                }
            }

            this.mapInstance = null;
            this.markers = [];
        }

        /**
         * Load the Google Maps API using the Google Loader.
         * Docs: https://developers.google.com/loader/
         * @return {Promise}
         */
        loadAPI() {
            return new Promise((resolve, reject) => {
                if(GoogleMap.APILoaded()) {
                    resolve();
                } else {
                    const params = this.API.params;
                    let arr = [];

                    for(var p in params) {
                        if(params.hasOwnProperty(p)) {
                            arr.push(encodeURIComponent(p) + '=' + params[p]);
                        }
                    }

                    google.load('maps', this.API.v, {
                        other_params: arr.join('&'),
                        callback() {
                            resolve();
                        }
                    });
                }
            });
        }

        /**
         * Ensure that the positions data passed to the constructor
         * exists, has values and is an array.
         * @return {bool} [true if valid]
         */
        validatePositions() {
            const pos = this.settings.positions;

            if(!pos || !pos.length || !Array.isArray(pos)) {
                return false;
            }

            return true;
        }

        /**
         * Render a new Google Map in the this.element DOM node.
         */
        renderMap() {
            let valid = this.validatePositions();

            if(!valid) {
                console.error('Invalid positions data. Expecting `positions` to be an array of objects.', this.settings.positions);
                return;
            }

            this.loadAPI().then(() => {
                // google.maps.Map expects default lat/lng values to center the map.
                // Use the first value passed in the `positions` array for this.
                let pos = this.settings.positions[0];

                let params = {
                    center: new google.maps.LatLng(pos.lat, pos.lng)
                }

                let options = Object.assign({}, this.settings.map, params);

                this.mapInstance = new google.maps.Map(this.element, options);

                this.addMarkers();
            });
        }

        /**
         * Add a standard Google Map Marker to the mapInstance created in
         * renderMap().
         *
         * Docs: https://developers.google.com/maps/documentation/javascript/markers
         */
        addMarkers() {
            if(!this.mapInstance) {
                console.error('No map instance created. Exiting.');
                return;
            }

            if(!this.validatePositions()) {
                console.error('Invalid positions data. Expecting `positions` to be an array of objects.', this.settings.positions);
                return;
            }

            this.settings.positions.forEach(pos => {
                let marker = new google.maps.Marker({
                    position: new google.maps.LatLng(pos.lat, pos.lng),
                    map: this.mapInstance
                });

                this.markers.push(marker);
            });

            if(this.settings.fitMarkerBounds) {
                this.fitMarkerBounds();
            }
        }

        /**
         * Set the viewport to contain the given bounds.
         * Docs: https://developers.google.com/maps/documentation/javascript/reference#Map
         *
         * Use this when using multiple Markers on a map. This will ensure they all
         * fit inside the map viewport.
         */
        fitMarkerBounds() {
            if(!this.markers.length) {
                console.error('No Marker instances exist. Exiting.');
                return;
            }

            let bounds = new google.maps.LatLngBounds();

            this.markers.forEach(marker => {
                bounds.extend(marker.getPosition());
            });

            this.mapInstance.fitBounds(bounds);
        }
    }



    // Initialise a new GoogleMap instance.
    let positions = [
        { lat: '48.8583701', lng: '2.2922873' },
        { lat: '48.8443073', lng: '2.3721886' },
        { lat: '48.8697041', lng: '2.3057201' },
        { lat: '48.8546104', lng: '2.3662857' }
    ]


    let els = document.getElementsByClassName('map');

    for(let i = 0; i <= els.length - 1; i++) {
        let Map = new GoogleMap(els[i], {
            positions: positions,
            map: {
                zoom: 12
            }
        });

        Map.renderMap();
    }
})();
