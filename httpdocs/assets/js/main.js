var va = va || {};

va = {
    jqxhr: function (type, action, data) {
        return $.ajax({
            method: 'POST',
            dataType: type,
            url: action,
            data: data                  
        });
    },
	StoreLocator: (function ($) {
		//UK
		var start = {
				lat: 55.3781,
				lng: -3.4360,
			},
			zoom = 5,
			container = 'map-container',
			locations = [],
			markers = [],
			largeInfoWindow,
			map,
			geocoder,			
			setZoom = function (level) {
				map.setZoom(level);
			},			
			addLocation = function (location) {
				locations.push(location);
			},			
			resetLocations = function () {
				$.each(markers, function (i) {
					this.setMap(null);
				});
				locations = [];
				markers = [];
			},			
			addMarkers = function () {
				var marker;
				$.each(locations, function () {
					marker = new google.maps.Marker({
						position: this.location,
						id: this.id,
						title: this.title,
						icon: this.icon,
						animation: google.maps.Animation.DROP
					});					
					markers.push(marker);
				});
			},
			showExistingLocation = function (id) {
				var bounds = new google.maps.LatLngBounds();
				
				$.each(markers, function () {					
					if (this.id === id) {
						bounds.extend(this.position);
						map.fitBounds(bounds);
						return;
					}
				});
			},		
			getLocationByUserInput = function (obj, callback) {				
				geocoder = new google.maps.Geocoder();
				geocoder.geocode(obj, callback);
			},
			showLocations = function () {
				var bounds = new google.maps.LatLngBounds();
				$.each(markers, function (i) {
					this.setMap(map);
		            bounds.extend(this.position);
				});
				map.fitBounds(bounds);
			},			
			init = function ($map) {
				map = new google.maps.Map($map[0], {
				  //zoom: zoom,
				  center: new google.maps.LatLng(start.lat, start.lng),
				  mapTypeId: google.maps.MapTypeId.ROADMAP
				});
				
				largeInfoWindow = new google.maps.InfoWindow();
			};
		
		return {
			init: init,
			setZoom: setZoom,
			addLocation: addLocation,
			resetLocations: resetLocations,
			addMarkers: addMarkers,
			showExistingLocation: showExistingLocation,
			showLocations: showLocations,
			getLocationByUserInput: getLocationByUserInput
		};
	}(jQuery)),
	handlers: {
		storesGUI: (function ($) {
			var $body = $('body,html'),
				store = {},
				stores = [],
				template,
				loadMap = true,
				$mapContainer,
				$map,
				$store,
				$results,
				$modal,
				$searchForm,
				startingPoint,
				$geoButton,
				_setStore = function (show) {
					var showDefault = show;
					store = $store.data();
					
					if (showDefault) {
						store['show'] = show;
					}
				},
				_setStartingPoint = function (position) {
					if (startingPoint.length === 0) {
						startingPoint = position.coords.latitude + ',' + position.coords.longitude
					}
				},
				_addStore = function () {
					stores.push(store);
				},
				_resetStores = function () {
					store = {};
					stores = [];
				},
				_getStoresByPosition = function (position) {
					var i;
						promise = va.jqxhr('json', 'api/findNearestStores.cfm', {
							lat:position.coords.latitude, 
							lng:position.coords.longitude
						});
					console.info('get position', position);
					_setStartingPoint(position);
					
					promise.done(function (data) {
						_resetStores();
						//data is formatted for the template
						for (i = 0; i < data.length; i++) {
							data[i].from = startingPoint;
							store = data[i];
							_addStore();
						}						
						_findStores();
						_displayStoreDetails();
					});
				};
				_geolocationDenied = function (error) {
					$geoButton.addClass('hide');
					alert('You have denied us to get your location. If you want this feature to work check your browser settings and refresh the page');
				};
				_checkGeolocation = function ($el) {
					if ("geolocation" in navigator) {
						$geoButton = $el;
						//only show geolocation if supported
						$geoButton.removeClass('hide');
						//reset starting point
						$geoButton.on('click', function (event) {
							console.info('clicking use my location');
							$searchForm.find('input[type="text"]').val('');
							$body.animate({ 
								scrollTop: $searchForm.offset().top
							}, 1100);
							/*
							*/
							startingPoint = '';						
							//Callback to use your position
							navigator.geolocation.getCurrentPosition(_getStoresByPosition, _geolocationDenied, {timeout: 10000});
							event.preventDefault();
						});
					}
				},
				_displayStoreDetails = function () {
					var rendered;
					Mustache.parse(template);
					rendered = Mustache.render(template, {'stores': stores});
					$results.html(rendered);
				},
				_initializeMap = function () {
					if (loadMap) {
						$mapContainer.removeClass('hide');
						//Initialise the map and show the map container
						va.StoreLocator.init($map);
						loadMap = false;
					}
				},
				_findStores = function () {				
					_initializeMap();
					va.StoreLocator.resetLocations();
					$.each(stores, function () {
						va.StoreLocator.addLocation({
							location: {
								lat: parseFloat(this.lat),
								lng: parseFloat(this.lng)
							},
							id : this.id,
							title: this.name,
							icon: this.marker
						});
					});

					va.StoreLocator.addMarkers();
					va.StoreLocator.showLocations();
					
				},
				_locateStoreInMap = function () {
					_initializeMap();

					va.StoreLocator.showExistingLocation(store.id);
					va.StoreLocator.setZoom(store.zoom);
				},
				_findStoreAndDisplay = function (event) {	
					$store = $(event.currentTarget);
					$body.animate({ 
						scrollTop: $($store.data('targetScroll')).offset().top
					}, 1100);
					_resetStores();
					_setStore(true);
					_addStore();
					_findStores();

					//ensure zoom runs after map is set to display the correct zoom
					setTimeout(function () {
						va.StoreLocator.setZoom(store.zoom);
					}, 300);

					_displayStoreDetails();
					
					
					event.preventDefault();
				},
				_findStoreInMap = function (event) {
					var $parentTab,
						targetScroll;
					$store = $(event.currentTarget);
					targetScroll = $store.data('targetScroll');
					$parentTab = $store.parent();
					if (targetScroll) {
						$body.animate({ 
							scrollTop: $(targetScroll).offset().top
						}, 1100);
					}/**/
					if ($parentTab.hasClass('active')) {
						$parentTab.removeClass('active');
					} else {
						$parentTab.siblings().removeClass('active')
						$parentTab.addClass('active');
						_setStore();
						_addStore();						
						_locateStoreInMap();						
					}
					
					event.preventDefault();
				},
				_fetchingStoresByInput = function (response, status) {
					var position = {
						coords: {}
					};
					if (status === 'OK') {						
						position.coords.latitude = response[0].geometry.location.lat();
						position.coords.longitude = response[0].geometry.location.lng();
						//Position formatted as geolocation response
						_getStoresByPosition(position);
					}
				},
				_findStoresByInput = function (event) {
					var $form = $(event.currentTarget),
						input = $form.find('[name="postcode"]').val().trim(),
						$error = $form.find('.text-danger'),
						position = {},
						iputLocation;
					
					$body.animate({ 
						scrollTop: $searchForm.offset().top
					}, 1100);

					//Clear errors
					$error.html('');
					startingPoint = '';
					if (input.length > 2) {
						startingPoint = input;

						va.StoreLocator.getLocationByUserInput({
							address: input + ', UK'
						}, _fetchingStoresByInput);
						
					} else {
						$error.html('Please enter a valid postcode or location');
					}				
					
					event.preventDefault();
				},
				_specifyStartingPoint = function (event) {
					var	$button = $(event.relatedTarget),
						tplId = $button.data('template'),
						tpl = $(tplId).html(),
						rendered;
						
					if ($button.data('target') === '#modal1') {
						Mustache.parse(tpl);
						rendered = Mustache.render(tpl, store);
						$modal.find('.modal-content').html(rendered);
						$modal.show();						
					}
				},
				init = function (settings) {
					
					template = settings.template;
					$map = settings.map;
					$mapContainer = settings.mapContainer;
					$results = settings.resultStoresElement;
					$searchForm = settings.postcodeSearch;
					$modal = settings.modal;
					
					//Stores are displaying from start, so the element is not cached
					settings.allStoresElement.on('click', settings.clickTargetList, _findStoreAndDisplay);
					$results.on('click', settings.clickTargetStore, _findStoreInMap);
					$searchForm.on('submit', _findStoresByInput);
					$body.filter('body').on('show.bs.modal', _specifyStartingPoint);
					
					//hides geolocation button if not supported
					_checkGeolocation(settings.geolocatorButton);
				};
			
			return {
				init: init
			};
			
		}(jQuery))
	}
};

(function () {
	var $search = $('#search'),
		$mapContainer = $('#map-content'),
		$map = $('#map-container'),
		$geo = $('#geolocation'),
		$destination = $('.modal-trigger'),
		storeTabTemplate = $('#store-tab').html(),
		$accordion = $('#accordion'),
		$modal = $('#modal1'),
		$allStores = $('#ALL');
	
	va.handlers.storesGUI.init( {
		mapContainer: $mapContainer,
		map: $map,
		postcodeSearch: $search,
		allStoresElement : $allStores,
		destination: $destination,
		clickTargetList : '.store_location',
		geolocatorButton : $geo,
		template : storeTabTemplate,
		modal: $modal,
		resultStoresElement : $accordion,
		clickTargetStore : '.accordion_store_location'
	});	
	
} ());

// initialize animations
 $(document).ready(function(){
	new WOW().init();
	// the "href" attribute of .modal-trigger must specify the modal ID that wants to be triggered
	//$('.modal-trigger').leanModal();
	$('.mdb-select').material_select();

});