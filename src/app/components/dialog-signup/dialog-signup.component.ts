import { Component, ComponentRef, Input, OnInit, ViewChild } from '@angular/core';
import { NbDialogRef } from '../../framework/theme/components/dialog/dialog-ref';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { User } from '../../interfaces/dataTypes';
import { NbStepperComponent } from '../../framework/theme/components/stepper/stepper.component';

@Component({
  selector: 'app-dialog-signup',
  templateUrl: './dialog-signup.component.html',
  styleUrls: ['./dialog-signup.component.css']
})
export class DialogSignupComponent implements OnInit {

  loading = false;
  password;
  email;
  user: User;
  showPassword = false;
  signingErrorMessage;


  constructor(private dialogRef: NbDialogRef<DialogSignupComponent>, private afAuth: AngularFireAuth,
              private router: Router) { }

  ngOnInit(): void {
  }

  @Input()
  googleSigning = false;

  closeDialog(): void {
    this.dialogRef.close();
  }

  getInputType(): string {
    if (this.showPassword) {
      return 'text';
    }
    return 'password';
  }

  toggleShowPassword(): void {
    this.showPassword = !this.showPassword;
  }

  goToAccessDataStep(stepper: NbStepperComponent): void {
    this.loading = true;
    this.signingErrorMessage = null;
    this.afAuth.createUserWithEmailAndPassword(this.email, this.password).then(credential => {
      this.loading = false;
      this.user = {
        last_access: null,
        name: '',
        surname: '',
        username: this.email,
        uid: credential.user.uid
      };
      stepper.next();
    }).catch(error => {
      console.log('DSC Creation failed with error: ', error);
      this.loading = false;
      this.signingErrorMessage = error;
    });
  }

  goToConfirmStep(stepper: NbStepperComponent): void {
    stepper.next();
  }

}
