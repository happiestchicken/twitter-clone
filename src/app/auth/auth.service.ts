import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { catchError, throwError, tap, BehaviorSubject } from "rxjs";
import { User } from './user.model';
import { Router } from "@angular/router";
import { TweeterService } from "../tweeter.service";


// this is the format the firebase api will return info as (in docs)
export interface AuthResponseData {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

@Injectable({ providedIn: 'root'})
export class AuthService {

  // to auto logout the user after certain amount of time
  private tokenExpTimer: any;

  /* this informs everywhere in the app when our user changes. we subscribe to this
  when new data emitted behvaiour subject gives access to previously emmited data,
  even before you were subscribed. must initialize it*/
  user = new BehaviorSubject<User>(null);

  constructor(private http: HttpClient, private tweetService: TweeterService, private router: Router) {}

  // signs up new user
  signUp(email: string, password: string, username: string, name: string, color: string) {
    return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + environment.firebaseAPIKey,
    // post method for firebase expects the following format. return secure token should always be true
    {
      email: email,
      password: password,
      returnSecureToken: true
    }).pipe(catchError(this.handleError), tap(resData => {
      this.handleAuth(resData.email, resData.localId, resData.idToken, +resData.expiresIn);
      this.tweetService.addNewUser(resData.email, resData.idToken, username, name, color);
      this.tweetService.initialUsersSetter();
    }))
  };

  // logs in user
  login(email: string, password: string) {
    return this.http.post<AuthResponseData>(
      'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + environment.firebaseAPIKey,
      {
        email: email,
        password: password,
        returnSecureToken: true
      }
    ).pipe(catchError(this.handleError), tap(resData => { this.handleAuth(resData.email, resData.localId, resData.idToken, +resData.expiresIn) }));
  }

  // for the error alert message when user logging in
  private handleError(errorRes: HttpErrorResponse) {
    let errorMessage = 'An unknown error occured!';
    if (!errorRes.error || !errorRes.error.error) {
      return throwError(() => errorMessage);
    }
    switch (errorRes.error.error.message) {
      case 'EMAIL_EXISTS': errorMessage = 'This email already exists.'; break;
      case 'EMAIL_NOT_FOUND': errorMessage = 'This email does not exist.'; break;
      case 'INVALID_PASSWORD': errorMessage = 'Your password is not correct'; break;
      case 'TOO_MANY_ATTEMPTS_TRY_LATER : Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later.': errorMessage = 'Too many failed attempts. Please try again later.'; break;
    }
    return throwError(() => errorMessage);
  }

  // sets up the 'user' object and then sets the auto logout time. also stores in local storage
  handleAuth(email: string, userId: string, token: string, expiresIn: number) {
    const expirationDate = new Date( new Date().getTime() + expiresIn * 1000);
    const user = new User(
      email,
      userId,
      token,
      expirationDate
    );
    this.user.next(user);
    this.autoLogout(expiresIn * 1000);
    localStorage.setItem('userData', JSON.stringify(user));
  }

  // run by app component upon initialization
  autoLogin() {
    const userData: {
      email: string;
      id: string;
      _token: string;
      _tokenExpirationDate: string;
    } = JSON.parse(localStorage.getItem('userData'));

    if (!userData) {
      return;
    }

    const loadedUser = new User(userData.email, userData.id, userData._token, new Date(userData._tokenExpirationDate));

    if (loadedUser.token) {
        this.user.next(loadedUser);
        const expirationDuration = new Date(userData._tokenExpirationDate).valueOf() - new Date().valueOf();
        this.autoLogout(expirationDuration);
    }
  }

  // auto logout after time run out
  autoLogout(expirationDuration: number) {
    this.tokenExpTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }

  // to unauthenticate the user and go to login screen
  logout() {
    this.user.next(null);
    localStorage.removeItem('userData');
    this.router.navigate(['/auth']);
    if (this.tokenExpTimer) {
        clearTimeout(this.tokenExpTimer);
    }
    this.tokenExpTimer = null;
  }

  getUserEmail() {
    return this.user.value.email;
  }
}
