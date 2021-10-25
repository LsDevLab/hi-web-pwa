import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): true|UrlTree {
    const url: string = state.url;
    return this.checkLogin(url);
  }

  checkLogin(_: string): true|UrlTree {
    if (localStorage.getItem('isAuth') === 'true') { return true; }
    // Redirect to the login page
    return this.router.parseUrl('/home');
  }
}
