import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NbThemeModule, NbLayoutModule, NbCardModule, NbListModule,
  NbUserModule, NbDatepickerModule, NbInputModule, NbBadgeModule, NbSelectModule,
  NbButtonModule, NbMenuModule, NbContextMenuModule, NbDialogModule, NbToastrModule, NbIconModule } from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { HttpClientModule } from '@angular/common/http';
import { AuthModule } from '@auth0/auth0-angular';
import { ChatPageModule } from './pages/chat-page/chat-page.module';
import { HomePageModule } from './pages/home-page/home-page.module';
import { HeaderComponent } from './components/header/header.component';
import { ChatLoggerLargeComponent } from './components/chat-logger-large/chat-logger-large.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { ChatNotificationsService } from './services/chat-notifications.service';
// import { NgxHowlerService } from 'ngx-howler';
import { BackButtonDisableModule } from 'angular-disable-browser-back-button';
import {NgxHowlerService} from 'ngx-howler';


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    ChatLoggerLargeComponent
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
      cacheLocation: 'localstorage'
    }),
    ChatPageModule,
    HomePageModule,
    NbDialogModule.forRoot(),
    NbToastrModule.forRoot(),
    ServiceWorkerModule.register('custom-service-worker.js', { enabled: environment.production, registrationStrategy: 'registerImmediately' }),
    BackButtonDisableModule.forRoot(),
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
