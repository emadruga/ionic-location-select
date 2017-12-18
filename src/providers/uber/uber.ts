import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';


@Injectable()
export class UberProvider {

    //@@ For proper debug: have to add 'http://localhost:8100' to
    //   Origin URI on the developer's Uber Console

    products: any = [];
    estimates: any = [];
    server_token = 'u5aqYXP8VF_1KzqHEM-wjcfCWQKV5YVrlj_-QFA1';

    constructor(private http: Http) {
	console.log('Hello UberProvider Provider');
    }

    fetchProdsAvailable(start_lat,start_lng): void {
	let url = 'https://api.uber.com/v1.2/products?'
	    + 'latitude='   + start_lat
	    + '&longitude=' + start_lng ;

	let uheaders = new Headers({
	    'Authorization'  :  'Token ' + this.server_token,
	    'Content-Type'   :  'application/json',
	    'Accept-Language':  'pt_BR'
	});

	let opt = new RequestOptions({ headers: uheaders });


	//Make a Http request to the URL and subscribe to the response
	this.http.get(url, opt ).map(res => res.json()).subscribe(data => {

	    //console.log('uber: got response');
	    //console.log(data);
	    
	    this.products = data.products;

	    //Loop through all NEW estimates that have been added. 
	    for(let i = 0; i < this.products.length; i++){
		let prod = this.products[i];
		console.log(prod);
	    }
	}, (err) => {
	    //Fail silently, in this case the loading spinner will cease to display
	    console.log("uber: cannot fetch products...!");
	});

    }

    fetchPriceEstimates(start_lat,start_lng, end_lat, end_lng): void {
	let url = 'https://api.uber.com/v1.2/estimates/price?'
	    + 'start_latitude='   + start_lat
	    + '&start_longitude=' + start_lng
	    + '&end_latitude='    + end_lat
	    + '&end_longitude='   + end_lng ;

	let uheaders = new Headers({
	    'Authorization'  :  'Token ' + this.server_token,
	    'Content-Type'   :  'application/json',
	    'Accept-Language':  'pt_BR'
	});

	let opt = new RequestOptions({ headers: uheaders });


	//Make a Http request to the URL and subscribe to the response
	this.http.get(url, opt ).map(res => res.json()).subscribe(data => {

	    //console.log('uber: got response');
	    //console.log(data);
	    
	    this.estimates = data.prices;

	    //Loop through all NEW estimates that have been added. 
	    for(let i = 0; i < this.estimates.length; i++){
		let estimate = this.estimates[i];
		console.log(estimate);
	    }
	}, (err) => {
	    //Fail silently, in this case the loading spinner will cease to display
	    console.log("uber: cannot fetch price estimates...!");
	});

    }

}
