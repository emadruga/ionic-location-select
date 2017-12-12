import { Http } from '@angular/http';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';


@Injectable()
export class UberProvider {

    estimates: any = [];
    server_token = 'u5aqYXP8VF_1KzqHEM-wjcfCWQKV5YVrlj_-QFA1';

    constructor(public http: Http) {
	console.log('Hello UberProvider Provider');
    }

    fetchPriceEstimates(start_lat,start_lng, end_lat, end_lng): void {
	let url = 'https://api.uber.com/v1.2/estimates/price?'
	    + 'start_latitude='   + start_lat
	    + '&start_longitude=' + start_lng
	    + '&end_latitude='    + end_lat
	    + '&end_longitude='   + end_lng ;

	//Make a Http request to the URL and subscribe to the response
	this.http.get(url).map(res => res.json()).subscribe(data => {

	    console.log(data);
	    
	    this.estimates = data.prices;

	    	    //Loop through all NEW posts that have been added. 
	    for(let i = 0; i < this.estimates.length; i++){
		let estimate = this.estimates[i];
		console.log(estimate);
	    }
	}, (err) => {
	    //Fail silently, in this case the loading spinner will cease to display
	    console.log("query doesn't exist!");
	});

    }

}
