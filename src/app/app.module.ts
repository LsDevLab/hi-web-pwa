import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NbThemeModule, NbLayoutModule, NbCardModule, NbListModule,
  NbUserModule, NbDatepickerModule, NbInputModule, NbBadgeModule, NbSelectModule,
  NbButtonModule, NbMenuModule, NbContextMenuModule, NbDialogModule, NbToastrModule, NbIconModule } from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { HttpClientModule} from '@angular/common/http';
import { AuthModule } from '@auth0/auth0-angular';
import { ChatPageModule } from './pages/chat-page/chat-page.module';
import { HomePageModule } from './pages/home-page/home-page.module';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { ChatNotificationsService } from './services/chat-notifications.service';
import { BackButtonDisableModule } from 'angular-disable-browser-back-button';
import {NgxHowlerService} from 'ngx-howler';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireModule } from '@angular/fire';

@NgModule({
  declarations: [
    AppComponent,
    //HeaderComponent,
    //ChatLoggerLargeComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    NbThemeModule.forRoot({ name: 'default' }),
    NbLayoutModule,
    NbEvaIconsModule,
    NbIconModule,
    NbCardModule,
    NbListModule,
    NbUserModule,
    NbDatepickerModule.forRoot(),
    NbInputModule,
    NbBadgeModule,
    NbButtonModule,
    HttpClientModule,
    NbSelectModule,
    NbContextMenuModule,
    NbMenuModule.forRoot(),
    AuthModule.forRoot({
      domain: 'lslab.us.auth0.com',
      clientId: 'q4xpoVk12GYpGbr9k2ZwncBUl8P9jsuV',
      cacheLocation: 'localstorage',
    }),
    ChatPageModule,
    HomePageModule,
    NbDialogModule.forRoot(),
    NbToastrModule.forRoot(),
    ServiceWorkerModule.register('custom-service-worker.js', { enabled: environment.production, registrationStrategy: 'registerImmediately' }),
    BackButtonDisableModule.forRoot(),
    NbContextMenuModule,
    NbMenuModule.forRoot(),
    AngularFireModule.initializeApp({
      apiKey: "AIzaSyAA87TyI0UwyTGlcfB4QHnp9OaLcHVL9js",
      authDomain: "hi-chat-bec8f.firebaseapp.com",
      databaseURL: "https://hi-chat-bec8f-default-rtdb.firebaseio.com",
      projectId: "hi-chat-bec8f",
      storageBucket: "hi-chat-bec8f.appspot.com",
      messagingSenderId: "813116576758",
      appId: "1:813116576758:web:2a8f3eb8b874e9dc7badd7",
      measurementId: "G-F5YKMYKXCG"
    }),
    AngularFireStorageModule
  ],
  bootstrap: [AppComponent],
  providers: [
    ChatNotificationsService,
    NgxHowlerService
  ]
})
export class AppModule {
  constructor(
    ngxHowlerService: NgxHowlerService
  ) {
    ngxHowlerService.loadScript('https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.0/howler.min.js');
  }
}
