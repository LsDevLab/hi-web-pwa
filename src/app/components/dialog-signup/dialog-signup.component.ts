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
  user: User;
  signupErrorMessage;
  isAtDataStep = false;


  constructor(private dialogRef: NbDialogRef<DialogSignupComponent>, private afAuth: AngularFireAuth,
              private router: Router) { }

  ngOnInit(): void {
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  goToAccessDataStep(stepper: NbStepperComponent, email: string, password: string): void {
    stepper.next();
    return;
    this.loading = true;
    this.signupErrorMessage = null;
    this.afAuth.createUserWithEmailAndPassword(email, password).then(credential => {
      console.log('DSC User access data created');
      this.user = {
        username: email,
        uid: credential.user.uid,
        last_access: null,
        name: '',
        surname: ''
      };
      this.loading = false;
      stepper.next();
    }).catch(error => {
      console.log('DSC User access data creation failed with error: ', error);
      this.loading = false;
      this.signupErrorMessage = error;
    });
  }

  goToUserAvatarStep(stepper: NbStepperComponent): void {
    stepper.next();
  }

}
