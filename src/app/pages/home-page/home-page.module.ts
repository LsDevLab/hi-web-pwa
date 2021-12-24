import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomePageComponent } from './home-page.component';
import {
    NbButtonModule,
    NbCardModule,
    NbContextMenuModule, NbFormFieldModule,
    NbIconModule,
    NbInputModule,
    NbLayoutModule, NbProgressBarModule, NbSelectModule,
    NbStepperModule,
    NbUserModule
} from '@nebular/theme';
import { HomeHeaderComponent } from '../../components/home-header/home-header.component';
import { DialogLoginComponent } from '../../components/dialog-login/dialog-login.component';
import { FormsModule } from '@angular/forms';
import { DialogSignupComponent } from '../../components/dialog-signup/dialog-signup.component';
import { AccessFormComponent } from '../../components/access-form/access-form.component';
import { UserDataFormComponent } from '../../components/user-data-form/user-data-form.component';
import { UserAvatarFormComponent } from '../../components/user-avatar-form/user-avatar-form.component';

@NgModule({
  declarations: [
    HomePageComponent,
    HomeHeaderComponent,
    DialogLoginComponent,
    DialogSignupComponent,
    AccessFormComponent,
    UserDataFormComponent,
    UserAvatarFormComponent
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
        NbStepperModule,
        NbSelectModule,
        NbProgressBarModule
    ],
    exports: [
        HomePageComponent,
        UserAvatarFormComponent,
        UserDataFormComponent
    ]
})
export class HomePageModule { }
