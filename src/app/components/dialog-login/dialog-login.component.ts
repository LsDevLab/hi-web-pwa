import { Component, OnInit } from '@angular/core';
import { NbDialogRef } from '../../framework/theme/components/dialog/dialog-ref';
import { DialogEditProfileComponent } from '../dialog-edit-profile/dialog-edit-profile.component';
import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase';
import { Router } from '@angular/router';


@Component({
  selector: 'app-dialog-login',
  templateUrl: './dialog-login.component.html',
  styleUrls: ['./dialog-login.component.css']
})
export class DialogLoginComponent implements OnInit {
  showPassword = false;
  email = '';
  password = '';
  loging = false;
  logingErrorMessage;
  resetEmailMessage;

  constructor(protected dialogRef: NbDialogRef<DialogEditProfileComponent>, private afAuth: AngularFireAuth,
              private router: Router) { }

  ngOnInit(): void {
  }

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

  loginWithGoogle(): void {
    this.dialogRef.close();
    const provider = new firebase.auth.GoogleAuthProvider();
    this.afAuth.signInWithPopup(provider).then(_ => this.router.navigateByUrl('/chat'))
      .catch(error => console.log('DLC Authentication failed with error: ', error));
  }

  loginWithEmailPassword(): void{
    this.loging = true;
    this.logingErrorMessage = null;
    this.resetEmailMessage = null;
    this.afAuth.signInWithEmailAndPassword(this.email, this.password).then(_ => {
      this.dialogRef.close();
      this.router.navigateByUrl('/chat');
    }).catch(error => {
      console.log('DLC Authentication failed with error: ', error);
      this.loging = false;
      this.logingErrorMessage = error;
    });
  }

  sendResetPasswordMail(): void {
    this.loging = true;
    this.logingErrorMessage = null;
    this.resetEmailMessage = null;
    this.afAuth.sendPasswordResetEmail(this.email).then(_ => {
      this.resetEmailMessage = 'Password reset instruction sent to ' + this.email;
      this.loging = false;
    }).catch(error => {
      console.log('DLC Sending reset password failed with error: ', error);
      this.loging = false;
      this.logingErrorMessage = error;
    });
  }

}
