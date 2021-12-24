import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { NbDialogRef } from '../../framework/theme/components/dialog/dialog-ref';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { User } from '../../interfaces/dataTypes';
import { NbStepperComponent } from '../../framework/theme/components/stepper/stepper.component';
import { ChatCoreService } from '../../services/chat-core.service';

@Component({
  selector: 'app-dialog-signup',
  templateUrl: './dialog-signup.component.html',
  styleUrls: ['./dialog-signup.component.css']
})
export class DialogSignupComponent implements OnInit, AfterViewInit {

  loading = false;
  signupErrorMessage;
  isAtDataStep = false;

  @ViewChild(NbStepperComponent) stepper: NbStepperComponent;

  constructor(private dialogRef: NbDialogRef<DialogSignupComponent>, private afAuth: AngularFireAuth,
              private chatCoreService: ChatCoreService, private router: Router) {
  }

  ngOnInit(): void {
  }

  async ngAfterViewInit(): Promise<void> {
    if (await this.afAuth.user)
      this.stepper.next();
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  goToAccessDataStep(stepper: NbStepperComponent, email: string, password: string): void {
    this.loading = true;
    this.signupErrorMessage = null;
    this.afAuth.createUserWithEmailAndPassword(email, password).then(credential => {
      console.log('DSC User access data created');
      this.chatCoreService.addCurrentUser(email, credential.user.uid).subscribe(_ => {
        console.log('DSC User details data initialized');
        this.chatCoreService.init(email, credential.user.uid);
        this.loading = false;
        this.closeDialog();
        this.router.navigateByUrl('/chat');
      }, error => {
        console.log('DSC User access data initialization failed with error:', error);
        this.loading = false;
        this.closeDialog();
      });
    }).catch(error => {
      console.log('DSC User access data creation failed with error: ', error);
      this.loading = false;
      this.signupErrorMessage = error;
    });
  }

  goToUserAvatarStep(stepper: NbStepperComponent, userData: Partial<User>): void {
    const user: Partial<User> = {
      name: userData.name,
      surname: userData.surname,
      bio: userData.bio,
      age: userData.age,
      sex: userData.sex
    };
    this.chatCoreService.updateCurrentUserData(user).subscribe(_ => {
      console.log('DSC User details data updated');
      stepper.next();
    }, error => {
      console.log('DSC User details data update failed with error:', error);
      this.closeDialog();
    });
  }

  concludeSigning(): void{
    this.closeDialog();
    this.router.navigateByUrl('/chat');
  }

}
