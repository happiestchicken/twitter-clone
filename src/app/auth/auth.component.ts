import { Component, ComponentFactoryResolver, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, NgForm, Validators } from "@angular/forms";
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ValidatorService } from '../shared/validator.service';
import { TweeterService } from '../tweeter.service';
import { AuthResponseData, AuthService } from './auth.service';


@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {

  // for storing the error message when user fails login
  error: string = null;

  // for showing either elements related to logging in or signing up
  loginMode = true;

  // form instance for logging in/ signing up
  authForm: FormGroup;

  constructor(private authService: AuthService, private router: Router, private validatorService: ValidatorService, private tweetService: TweeterService, private componentFactoryResolver: ComponentFactoryResolver) {}

  // runs when the user attempts login or sign up
  onSubmit() {
    if (!this.authForm.valid) {
      return;
    }

    // should probably put all this in the service like in the feed components logic
    const email = this.authForm.value.email;
    const username = this.authForm.value.username;
    const name = this.authForm.value.name;
    const password = this.authForm.value.password;
    const colors = ['#346a85', '#348569', '#f6a43d', '#aad3e6', '#7f3485',
    '#992b41', '#e95f28', '#4a913c', '#ffac33', '#744eaa', '#be1931', '#afe356']
    const color = colors[Math.floor(Math.random() * colors.length)];

    /* this is instead of subscribing to the response of the auth service for login and signup */
    let authObs: Observable<AuthResponseData>

    if (this.loginMode) {
      authObs = this.authService.login(email, password);
    } else {
      authObs = this.authService.signUp(email, password, username, name, color);
    }

    // routes to the feed when authenticated or sets error message to be displayed
    authObs.subscribe(() => {
      this.router.navigate(['/feed']);
    },errorMessage => {
      this.error = errorMessage;
    });
    this.authForm.reset();
  }

  // switches the login/signup mode when the user wants to
  onSwitchMode() {
    this.loginMode = !this.loginMode;
    this.checkLoginMode();
  }

  ngOnInit() {
    this.tweetService.initialUsersSetter();
   // this.tweetService.initialTweetsSetter();

    // initializes the form for logging in
    this.authForm = new FormGroup({
      'password': new FormControl(null, [Validators.required, this.forbiddenPasswords.bind(this)]),
      'email': new FormControl(null, Validators.required)
    })

    this.authForm.patchValue({
      'password': '',
      'email': ''
    })

    this.checkLoginMode();
  }

  // validator to ensure that the username chosen is not already taken
  usernameTaken(control: FormControl): {[s: string]: boolean} | null {
    if (control.value !== null && control.value !== undefined) {
      return this.tweetService.usernameTakenValidator(control.value);
    }
    return null;
  }

  // validator to ensure that the username is of allowed format/content
  forbiddenUsernames(control: FormControl): {[s: string]: boolean} | null {
    if (control.value !== null && control.value !== undefined) {
      return this.validatorService.usernameValidator(control.value);
    }
    return null;
  }

  // validator to ensure that the password is of sufficient complexity
  forbiddenPasswords(control: FormControl): {[s: string]: boolean} | null {
    if (this.loginMode) {
      return null;
    }
    if (control.value !== null && control.value !== undefined) {
      return this.validatorService.passwordValidator(control.value);
    }
    return null;
  }

  // validator to ensure that the display name is of sufficient length, etc
  forbiddenNames(control: FormControl): {[s: string]: boolean} | null {
    if (control.value !== null && control.value !== undefined) {
      return this.validatorService.nameValidator(control.value);
    }
    return null;
  }

  // adds the username and name sections to the form if the user is signing up
  checkLoginMode() {
    if (!this.loginMode) {
      this.authForm.addControl('username', new FormControl('', [Validators.required, this.forbiddenUsernames.bind(this), this.usernameTaken.bind(this)]));
      this.authForm.addControl('name', new FormControl('', [Validators.required, this.forbiddenNames.bind(this)]));
    }
    if (this.loginMode) {
      this.authForm.removeControl('username');
      this.authForm.removeControl('name');
    }
  }
}
