import { Component, OnInit } from '@angular/core';
import { NbDialogRef } from '../../framework/theme/components/dialog/dialog-ref';
import { DialogEditProfileComponent } from '../dialog-edit-profile/dialog-edit-profile.component';
import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase';
import { Router } from '@angular/router';
import { ChatCoreService } from '../../services/chat-core.service';


@Component({
  selector: 'app-dialog-login',
  templateUrl: './dialog-login.component.html',
  styleUrls: ['./dialog-login.component.css']
})
export class DialogLoginComponent implements OnInit {

  email = '';
  password = '';
  logging = false;
  logingErrorMessage;
  resetEmailMessage;

  constructor(protected dialogRef: NbDialogRef<DialogEditProfileComponent>, private afAuth: AngularFireAuth,
              private router: Router, private chatCoreService: ChatCoreService) { }

  ngOnInit(): void {
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  loginWithGoogle(): void {
    this.dialogRef.close();
    const provider = new firebase.auth.GoogleAuthProvider();
    this.afAuth.signInWithPopup(provider).then(credential => {
      this.router.navigateByUrl('/chat');
    }).catch(error => console.log('DLC Authentication failed with error: ', error));
  }

  loginWithEmailPassword(email, password): void {
    this.logging = true;
    this.logingErrorMessage = null;
    this.resetEmailMessage = null;
    this.afAuth.signInWithEmailAndPassword(email, password).then(credential => {
      this.dialogRef.close();
      this.router.navigateByUrl('/chat');
    }).catch(error => {
      console.log('DLC Authentication failed with error: ', error);
      this.logging = false;
      this.logingErrorMessage = error;
    });
  }

  sendResetPasswordMail(email): void {
    this.logging = true;
    this.logingErrorMessage = null;
    this.resetEmailMessage = null;
    this.afAuth.sendPasswordResetEmail(email).then(_ => {
      this.resetEmailMessage = 'Password reset instruction sent to ' + email;
      this.logging = false;
    }).catch(error => {
      console.log('DLC Sending reset password failed with error: ', error);
      this.logging = false;
      this.logingErrorMessage = error;
    });
  }

}
