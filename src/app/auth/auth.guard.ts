import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, createUrlTreeFromSnapshot, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable } from "rxjs";
import { AuthService } from "./auth.service";
import { map, take } from "rxjs/operators";


@Injectable({providedIn: 'root'})
export class AuthGuard implements CanActivate {

  constructor(private router: Router, private authService: AuthService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return this.authService.user.pipe(
      take(1),
      map(user => { // maping the value to t or f
      const isAuth = !!user;
      if (isAuth) {
          return true;
      }
      return this.router.createUrlTree(['/auth']);
  }));  }
}
