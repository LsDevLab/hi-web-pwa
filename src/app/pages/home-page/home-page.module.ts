import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomePageComponent } from './home-page.component';
import {NbButtonModule, NbCardModule} from '@nebular/theme';



@NgModule({
  declarations: [HomePageComponent],
  imports: [
    CommonModule,
    NbCardModule,
    NbButtonModule
  ],
  exports: [
    HomePageComponent
  ]
})
export class HomePageModule { }
