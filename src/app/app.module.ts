import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NbThemeModule, NbLayoutModule, NbChatModule, NbCardModule, NbListModule, 
  NbUserModule, NbDatepickerModule, NbInputModule, NbBadgeModule, NbSelectModule } from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { HeaderCompComponent } from './components/header-comp/header-comp.component';
import { ChatFormComponent } from './components/chat-form/chat-form.component';
import { ContactsListComponent } from './components/contacts-list/contacts-list.component';
import { ChatCoreService } from './services/chat-core.service';
import { HttpClientModule } from '@angular/common/http';
import { GraphQLModule } from './graphql.module'

@NgModule({
  declarations: [
    AppComponent,
    HeaderCompComponent,
    ChatFormComponent,
    ContactsListComponent
    ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    NbThemeModule.forRoot({ name: 'default' }),
    NbLayoutModule,
    NbEvaIconsModule,
    NbChatModule,
    NbCardModule,
    NbListModule,
    NbUserModule,
    NbDatepickerModule.forRoot(),
    NbInputModule,
    NbBadgeModule,
    HttpClientModule,
    NbSelectModule,
    GraphQLModule,
  ],
  providers: [ChatCoreService],
  bootstrap: [AppComponent]
})
export class AppModule { }
