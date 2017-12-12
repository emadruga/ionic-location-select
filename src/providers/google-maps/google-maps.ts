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
    trafficLayer: any;

    
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
		    this.trafficLayer          = new google.maps.TrafficLayer;
		    
		    
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
    
    makeMarker( position, icon, title, info) {
	var marker = new google.maps.Marker({
	    position: position,
	    map: this.map,
	    icon: icon,
	    title: title
	});
	this.markersArray.push(marker);
	
	if (info != null) {
	    google.maps.event.addListener(marker, "click", function(){
		info.open(this.map, marker);
	    });
	}
    }
    
    updateMap(orig: google.maps.LatLng,oname: string,
	      dst: google.maps.LatLng, dname: string) {

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

       this.trafficLayer.setMap(this.map);
       this.directionsDisplay.setMap(this.map);
	
       this.directionsService.route({
	    origin: orig,
	    destination: dst,
	    travelMode: google.maps.TravelMode['DRIVING']
	}, (res, status) => {
	    
	    if(status == google.maps.DirectionsStatus.OK){
		this.directionsDisplay.setDirections(res);
		// console.log(res.routes);

		// Only care about first given route
		var leg = res.routes[ 0 ].legs[ 0 ];

		var infowindow1 = new google.maps.InfoWindow();
		infowindow1.setContent("<b>"  + oname + "</b>" +
				       "<br>" + 
				       "Partida ");

		var infowindow2 = new google.maps.InfoWindow();
		infowindow2.setContent("<b>"  + dname + "</b>" +
				       "<br>" + leg.distance.text +
				       "<br>" + leg.duration.text +
				       " ");

		this.makeMarker( leg.start_location, start_image,
				 "Partida", infowindow1 );
		this.makeMarker( leg.end_location, end_image,
				 "Chegada", infowindow2 );
		

		console.log('From ' +  oname +
			    ' to ' + dname +
			    ': Distance: ' + leg.distance.text +
			    ', time: '     + leg.duration.text);



	    } else {
		console.warn(status);
	    }
	    
	});

    }
 
    startNavigating(dest){
 
	this.geolocation.getCurrentPosition()
	    .then((position) => {

		if (this.markersArray.length > 0) {
		    this.clearAllMarkers();
		}

		let geo = new google.maps.Geocoder;
		
		let origin_latlng = new google.maps.LatLng(position.coords.latitude,
							   position.coords.longitude );
		let dest_latlng   = new google.maps.LatLng(dest.lat,
							   dest.lng );

		geo.geocode({'location': origin_latlng}, (results,status) => {
		    if (status === google.maps.GeocoderStatus.OK) {
			let origin_name = results[1].formatted_address;
			this.updateMap(origin_latlng, origin_name,
				       dest_latlng, dest.name);
		    } else {
			console.log('Cannot geocode' +  origin_latlng);
			console.log(status);
		    }
		});

	    }, (err) => {
		console.log('Cannot find current position!');
		console.log(err);
	    });
    }



}
