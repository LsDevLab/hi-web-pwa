import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomePageComponent } from './home-page.component';
import {
    NbButtonModule,
    NbCardModule,
    NbContextMenuModule,
    NbIconModule,
    NbLayoutModule,
    NbUserModule
} from '@nebular/theme';
import { HomeHeaderComponent } from '../../components/home-header/home-header.component';
import { DialogLoginComponent } from '../../components/dialog-login/dialog-login.component';

@NgModule({
  declarations: [
    HomePageComponent,
    HomeHeaderComponent,
    DialogLoginComponent
  ],
    imports: [
        CommonModule,
        NbCardModule,
        NbButtonModule,
        NbLayoutModule,
        NbIconModule,
        NbUserModule,
        NbContextMenuModule
    ],
  exports: [
    HomePageComponent
  ]
})
export class HomePageModule { }
