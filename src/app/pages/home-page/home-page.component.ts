import { Component, HostListener, OnInit } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { environment } from '../../../environments/environment';
import { NbDialogService } from '../../framework/theme/components/dialog/dialog.service';
import { DialogLoginComponent } from '../../components/dialog-login/dialog-login.component';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {

  navbarfixed = false;
  screenIsSmall = false;
  nameOfUser = '';
  appName = environment.appName;
  isAuthenticated = (localStorage.getItem('isAuth') === 'true');

  constructor(private breakpointObserver: BreakpointObserver, public router: Router,
              public afAuth: AngularFireAuth, private dialogService: NbDialogService) {
  }

  ngOnInit(): void {
    this.breakpointObserver.observe('(max-width: 992px)').subscribe(r => {
      this.screenIsSmall = r.matches;
    });
    this.afAuth.user.subscribe(usr => {
      if (usr) {
        this.nameOfUser = usr.displayName;
        this.isAuthenticated = !!usr;
      }
    });
  }

  signInWithGoogle(): void {
    // const provider = new firebase.auth.GoogleAuthProvider();
    // this.afAuth.signInWithPopup(provider).then(_ => this.router.navigateByUrl('/chat'));
    // this.dialogService.open(DialogSigninComponent);
  }

  signInWithEmailPassword(): void {
    // const provider = new firebase.auth.GoogleAuthProvider();
    // this.afAuth.signInWithPopup(provider).then(_ => this.router.navigateByUrl('/chat'));
    // this.dialogService.open(DialogSigninComponent);
  }

  @HostListener('window:scroll', ['$event']) onscroll(): void{
    if (window.scrollY > 150) {
      this.navbarfixed = true;
    } else if (window.scrollY < 50) {
      this.navbarfixed = false;
    }
  }

}
