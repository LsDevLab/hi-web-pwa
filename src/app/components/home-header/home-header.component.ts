import { Component, OnInit } from '@angular/core';
import { ChatNotificationsService } from '../../services/chat-notifications.service';
import { Router} from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { BreakpointObserver } from '@angular/cdk/layout';
import { NbMenuItem, NbMenuService } from '../../framework/theme/components/menu/menu.service';
import { DialogLoginComponent } from '../dialog-login/dialog-login.component';
import { NbDialogService } from '../../framework/theme/components/dialog/dialog.service';

@Component({
  selector: 'unlogged-app-header',
  templateUrl: './home-header.component.html',
  styleUrls: ['./home-header.component.css']
})
export class HomeHeaderComponent implements OnInit {

  isAuthenticated = (localStorage.getItem('isAuth') === 'true');
  languagesContextMenu = [
    { title: 'EN' },
    { title: 'IT' },
    { title: 'ES' },
  ];
  navButtonsContextMenu: NbMenuItem[] = [];
  navButtonsContextMenuActions = [];

  screenIsSmall = false;

  constructor(private chatNotificationsService: ChatNotificationsService, public router: Router,
              public afAuth: AngularFireAuth, private breakpointObserver: BreakpointObserver,
              private menuService: NbMenuService, private dialogService: NbDialogService) {
  }

  ngOnInit(): void {
    this.afAuth.user.subscribe(usr => {
      this.isAuthenticated = !!usr;
      if (this.isAuthenticated) {
        this.navButtonsContextMenu = [
          { title: 'Logout', icon: 'log-out-outline',  },
          { title: 'Go to Hi Web', icon: 'message-square-outline' },
          { title: 'Download Hi Mobile Apps', icon: 'smartphone-outline' },
          { title: 'Help center', icon: 'question-mark-circle-outline' },
        ];
        this.navButtonsContextMenuActions = [
          () => this.logout(),
          () => this.router.navigateByUrl('/chat'),
          () => this.router.navigateByUrl('/download-apps'),
          () => this.router.navigateByUrl('/help'),
        ];
      } else {
        this.navButtonsContextMenu = [
          { title: 'Hi Web Login', icon: 'log-in-outline' },
          { title: 'Download Hi Mobile Apps', icon: 'smartphone-outline' },
          { title: 'Help center', icon: 'question-mark-circle-outline' },
        ];
        this.navButtonsContextMenuActions = [
          () => this.login(),
          () => this.router.navigateByUrl('/download-apps'),
          () => this.router.navigateByUrl('/help'),
        ];
      }
    });
    this.breakpointObserver.observe('(max-width: 992px)').subscribe(r => {
      this.screenIsSmall = r.matches;
    });
    this.menuService.onItemClick().subscribe(menuEvent => {
      if (menuEvent.tag === 'navButtons') {
        const indexOfItem = this.navButtonsContextMenu.indexOf(menuEvent.item);
        this.navButtonsContextMenuActions[indexOfItem]();
      }
    });
  }

  logout(): void {
    this.chatNotificationsService.unsubscribeToMessagesPushNotifications();
    localStorage.setItem('isAuth', 'false');
    localStorage.removeItem('currentToken');
    this.afAuth.signOut().then(_ => window.location.reload());
  }

  login(): void {
    // const provider = new firebase.auth.GoogleAuthProvider();
    // this.afAuth.signInWithPopup(provider).then(_ => this.router.navigateByUrl('/chat'))
    //  .catch(error => console.log('HHC Authentication failed with error: ', error));
    this.dialogService.open(DialogLoginComponent);
  }

}
