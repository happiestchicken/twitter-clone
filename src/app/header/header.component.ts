import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { TweeterService } from '../tweeter.service';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  // for rendering components in the header only when the user is authenticated
  isAuthenticated = true;
  isFeed: boolean = false;

  constructor(private authService: AuthService, private tweetService: TweeterService) { }

  ngOnInit(): void {
    this.authService.user.subscribe(user => {
      this.isAuthenticated = !!user;
    });
  }

  // calls for user to be logged out
  onLogout() {
    this.authService.logout();
    this.isAuthenticated = false;
    localStorage.clear();
  }

  // opens up new tweet div
  newTweetScr() {
    this.tweetService.newTweet();
  }

  // to switch to the 'feed' screen
  feedScreen() {
    this.isFeed = true;
    this.tweetService.makeFeed(this.isFeed);
  }

  // to switch to the 'discover' screen
  discoverScreen() {
    this.isFeed = false;
    this.tweetService.makeFeed(this.isFeed);
  }

  refresh() {
    window.location.reload();
  }
}
