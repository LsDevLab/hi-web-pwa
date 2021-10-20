import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomePageComponent } from './home-page.component';
import { NbButtonModule, NbCardModule, NbIconModule, NbLayoutModule, NbUserModule } from '@nebular/theme';
import { HomeHeaderComponent } from '../../components/home-header/home-header.component';

@NgModule({
  declarations: [
    HomePageComponent,
    HomeHeaderComponent,
  ],
  imports: [
    CommonModule,
    NbCardModule,
    NbButtonModule,
    NbLayoutModule,
    NbIconModule,
    NbUserModule
  ],
  exports: [
    HomePageComponent
  ]
})
export class HomePageModule { }
