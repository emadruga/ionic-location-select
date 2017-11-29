import { Injectable } from '@angular/core';
import { Connectivity } from '../../providers/connectivity-service/connectivity-service';
import { Geolocation } from '@ionic-native/geolocation';

@Injectable()
export class GoogleMaps {
    
    mapElement: any;
    pleaseConnect: any;
    map: any;
    mapInitialised: boolean = false;
    mapLoaded: any;
    mapLoadedObserver: any;
    currentMarker: any;
    apiKey: string = "AIzaSyD8Bb8u9fTTy9t_gzsYHIPPK-v2jGYGlr8";

    markersArray = [];

    directionsService: any;
    directionsDisplay: any;
    distanceMatrixService: any;

    
    constructor(public connectivityService: Connectivity, public geolocation: Geolocation) {
	
    }
    
    init(mapElement: any, pleaseConnect: any): Promise<any> {
	
	this.mapElement = mapElement;
	this.pleaseConnect = pleaseConnect;
	
	return this.loadGoogleMaps();
	
    }
    
    loadGoogleMaps(): Promise<any> {
	
	return new Promise((resolve) => {
	    
	    if(typeof google == "undefined" || typeof google.maps == "undefined"){
		
		console.log("Google maps JavaScript needs to be loaded.");
		this.disableMap();
		
		if(this.connectivityService.isOnline()){
		    
		    window['mapInit'] = () => {
			
			this.initMap().then(() => {
			    resolve(true);
			});
			
			this.enableMap();
		    }
		    
		    let script = document.createElement("script");
		    script.id = "googleMaps";
		    
		    if(this.apiKey){
			script.src = 'http://maps.google.com/maps/api/js?key=' +
			    this.apiKey + '&callback=mapInit&libraries=places';
		    } else {
			script.src = 'http://maps.google.com/maps/api/js?callback=mapInit';      
		    }
		    
		    document.body.appendChild(script); 
		    
		}
	    } else {
		
		if(this.connectivityService.isOnline()){
		    this.initMap();
		    this.enableMap();
		}
		else {
		    this.disableMap();
		}
		
		resolve(true);
		
	    }
	    
	    this.addConnectivityListeners();
	    
	});
	
    }
    
    initMap(): Promise<any> {
	
	this.mapInitialised = true;
	
	return new Promise((resolve) => {
	    
	    this.geolocation.getCurrentPosition()
		.then((position) => {
		    
		    let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
		    
		    let mapOptions = {
			center: latLng,
			zoom: 15,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		    }
		    
		    this.map                   = new google.maps.Map(this.mapElement, mapOptions);
		    this.directionsService     = new google.maps.DirectionsService;
		    this.directionsDisplay     = new google.maps.DirectionsRenderer({suppressMarkers: true});
		    this.distanceMatrixService = new google.maps.DistanceMatrixService;
		    
		    
		    resolve(true);
		    
		});
	    
	});
	
    }
    
    disableMap(): void {
	
	if(this.pleaseConnect){
	    this.pleaseConnect.style.display = "block";
	}
	
    }
    
    enableMap(): void {
	
	if(this.pleaseConnect){
	    this.pleaseConnect.style.display = "none";
	}
	
    }
    
    addConnectivityListeners(): void {
	
	this.connectivityService.watchOnline().subscribe(() => {
	    
	    setTimeout(() => {
		
		if(typeof google == "undefined" || typeof google.maps == "undefined"){
		    this.loadGoogleMaps();
		}
		else {
		    if(!this.mapInitialised){
			this.initMap();
		    }
		    
		    this.enableMap();
		}
		
	    }, 2000);
	    
	});
	
	this.connectivityService.watchOffline().subscribe(() => {
	    
	    this.disableMap();
	    
	});
	
    }

    changeMarker(lat: number, lng: number): void {
	
	let latLng = new google.maps.LatLng(lat, lng);
	
	let marker = new google.maps.Marker({
	    map: this.map,
	    animation: google.maps.Animation.DROP,
	    position: latLng
	});

	if(this.currentMarker){
	    this.currentMarker.setMap(null);        
	}

	this.currentMarker = marker;  
	
    }

    clearAllMarkers() {
	for (var i = 0; i < this.markersArray.length; i++ ) {
	    this.markersArray[i].setMap(null);
	}
	
	this.markersArray.length = 0;
    }
    
    makeMarker( position, icon, title ) {
	var marker = new google.maps.Marker({
	    position: position,
	    map: this.map,
	    icon: icon,
	    title: title
	});
	this.markersArray.push(marker);
	google.maps.event.addListener(marker,"click",function(){});
    }
    
   updateMap(orig: string, dst: string) {

       var start_image = {
          url: 'assets/imgs/marker-red-small.png',
          // This marker is 30 pixels wide by 30 pixels high.
          size: new google.maps.Size(30, 30),
          // The origin for this image is (0, 0).
          origin: new google.maps.Point(0, 0),
          // The anchor for this image
          anchor: new google.maps.Point(15, 30)
        };
       var end_image = {
          url: 'assets/imgs/marker-blue-small.png',
          // This marker is 30 pixels wide by 30 pixels high.
          size: new google.maps.Size(30, 30),
          // The origin for this image is (0, 0).
          origin: new google.maps.Point(0, 0),
          // The anchor for this image
          anchor: new google.maps.Point(15, 30)
       };

       var infobox_position = null;
	
       this.directionsDisplay.setMap(this.map);
	
       this.directionsService.route({
	    origin: orig,
	    destination: dst,
	    travelMode: google.maps.TravelMode['DRIVING']
	}, (res, status) => {
	    
	    if(status == google.maps.DirectionsStatus.OK){
		this.directionsDisplay.setDirections(res);
		console.log(res.routes);
		var leg = res.routes[ 0 ].legs[ 0 ];
		infobox_position = leg.start_location;
		this.makeMarker( leg.start_location, start_image, "A" );
		this.makeMarker( leg.end_location, end_image, "B" );

	    } else {
		console.warn(status);
	    }
	    
	});

	// get distances for the same route
	this.distanceMatrixService.getDistanceMatrix({
	    origins: [orig],
	    destinations: [dst],
	    travelMode: google.maps.TravelMode['DRIVING'],
	    unitSystem: google.maps.UnitSystem.METRIC,
	    avoidHighways: false,
	    avoidTolls: false
	}, (response, status) => {
	    if (status !== google.maps.DistanceMatrixStatus.OK) {
		console.log('Error was: ' + status);
	    } else {
		console.log('Good: ' +  status);
		var originList = response.originAddresses;
		var destinationList = response.destinationAddresses;
		for (var i = 0; i < originList.length; i++) {
		    var results = response.rows[i].elements;
		    for (var j = 0; j < results.length; j++) {
			console.log('From ' +  originList[i] +
				    ' to ' + destinationList[j] +
				    ': Distance: ' + results[j].distance.text +
				    ', time: ' +  results[j].duration.text);

			if (infobox_position == null) {
			    var infowindow2 = new google.maps.InfoWindow();
			    infowindow2.setContent(results[j].distance.text +
						   "<br>" +  results[j].duration.text +
						   " ");

			    infowindow2.setPosition(infobox_position);
			    infowindow2.open(this.map);
			    
			}
			
		    }
		}
	    }
	});

    }
 
    startNavigating(name: string){
 
	let destinationA = name;
	let origin1 = 'posto 10, ipanema';

	this.geolocation.getCurrentPosition()
	    .then((position) => {

		if (this.markersArray.length > 0) {
		    this.clearAllMarkers();
		}

		let geocode = new google.maps.Geocoder;
		let latlng = { lat: position.coords.latitude,
			       lng: position.coords.longitude };

		geocode.geocode({'location': latlng}, (results,status) => {
		    if (status === google.maps.GeocoderStatus.OK) {
			if (results[1]) {
			    origin1 = results[1].formatted_address;
			    console.log('From: ' + origin1);
			    this.updateMap(origin1,destinationA);
			} else {
			    console.log('No revgeo results found');
			}
		    } else {
			console.log('Geocoder failed due to: ' + status);
		    }
		});
				
	    });
    }



}
