import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomePageComponent } from './home-page.component';
import {
  NbButtonModule,
  NbCardModule,
  NbContextMenuModule, NbFormFieldModule,
  NbIconModule,
  NbInputModule,
  NbLayoutModule,
  NbStepperModule,
  NbUserModule
} from '@nebular/theme';
import { HomeHeaderComponent } from '../../components/home-header/home-header.component';
import { DialogLoginComponent } from '../../components/dialog-login/dialog-login.component';
import { FormsModule } from '@angular/forms';
import { DialogSignupComponent } from '../../components/dialog-signup/dialog-signup.component';

@NgModule({
  declarations: [
    HomePageComponent,
    HomeHeaderComponent,
    DialogLoginComponent,
    DialogSignupComponent
  ],
  imports: [
    CommonModule,
    NbCardModule,
    NbButtonModule,
    NbLayoutModule,
    NbIconModule,
    NbUserModule,
    NbContextMenuModule,
    NbInputModule,
    NbFormFieldModule,
    FormsModule,
    NbStepperModule
  ],
  exports: [
    HomePageComponent
  ]
})
export class HomePageModule { }
