import { Component } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { ChatCoreService } from './services/chat-core.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'project-hi';
  constructor(private auth: AuthService, private router: Router) { }

  ngOnInit(){

    this.auth.isAuthenticated$.subscribe(isAuth => {
      if (isAuth)
        this.auth.idTokenClaims$.subscribe(t => { 
          if (t){
            localStorage.setItem('isAuth', "true");
            localStorage.setItem('currentToken', t.__raw);
            console.log("Authenticated with the token", localStorage.getItem('currentToken'));
            this.router.navigateByUrl('/chat');
          }
        });
    });
    
  }

}
