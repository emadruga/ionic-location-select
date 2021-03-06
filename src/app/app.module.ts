import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { LocationSelect } from '../pages/location-select/location-select';
import { Connectivity } from '../providers/connectivity-service/connectivity-service';
import { GoogleMaps } from '../providers/google-maps/google-maps';
import { Network } from '@ionic-native/network';
import { Geolocation } from '@ionic-native/geolocation';
import { UberProvider } from '../providers/uber/uber';
 
@NgModule({
  declarations: [
    MyApp,
    HomePage,
    LocationSelect
  ],
  imports: [
      BrowserModule,
      HttpModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    LocationSelect
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Connectivity,
    GoogleMaps,
    Network,
    Geolocation,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    UberProvider
  ]
})
export class AppModule {}
