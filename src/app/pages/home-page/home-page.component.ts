import { Component, OnInit } from '@angular/core';
import {BreakpointObserver} from '@angular/cdk/layout';
import {AuthService} from '@auth0/auth0-angular';
import {Router} from '@angular/router';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {

  screenIsSmall = false;

  nameOfUser: string = '';

  constructor(private breakpointObserver: BreakpointObserver, public auth: AuthService, public router: Router,) {
  }

  ngOnInit(): void {
    this.breakpointObserver.observe('(max-width: 992px)').subscribe(r => {
      this.screenIsSmall = r.matches;
    });
    this.auth.user$.subscribe(usr => {
      if(usr)
        this.nameOfUser = usr.given_name;
    });
  }

}
