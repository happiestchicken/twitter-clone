import { Component, Input, OnInit } from '@angular/core';
import { Subscription, of, Subject } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { NewUser } from 'src/app/newUser.model';
import { Tweet } from 'src/app/tweet.model';
import { TweeterService } from 'src/app/tweeter.service';


@Component({
  selector: 'app-tweet-item',
  templateUrl: './tweet-item.component.html',
  styleUrls: ['./tweet-item.component.css']
})
export class TweetItemComponent implements OnInit {

  // listens for the response to check if the tweet was made by logged in user
  isCurrentUser = new Subject<boolean>();

  // imports the tweet being displayed from parent
  @Input() tweet: Tweet;

  // index of the tweet imported from parent
  @Input() index: number;

  // stores the current users email for use in passing into services
  currentUserEmail: string = this.authService.getUserEmail();

  /* following 5 vars hold bool values which together determine if the tweet
  is to be displayed or not*/

  // holds whether the tweet was retweeted by the user or not
  retByCurrUser: boolean = false;
  // holds whether the user is folling the user who made the tweet
  isFollowing = false;
  // holds whether the tweet was retweeted by the user or not. also for the retween btn UI
  isRet = false;
  // holds whether the tweet is liked by the user
  isLiked = false;
  // holds if the tweet was retweeted by one of the users the user is following
  isRetElse = false;
  // ultimately decides if if tweet should be shown or not. initially set to true
  showTweet: boolean = false;

  /* holds if the tweet was made by current user. to prevent liking and retweeting
  by the user who made the tweet*/



  // to show either the 'feed' or 'discovery' page
  isFeed: boolean = false;

  // to display who out of the users 'following list' retweeted the tweet. For UI
  retBy: string;

  constructor(private authService: AuthService, private tweetService: TweeterService) { }

  addFollow() {
    this.tweetService.addFollow(this.currentUserEmail, this.tweet)
    this.isFollowing = true;
  }

  removeFollow() {
    this.tweetService.removeFollow(this.currentUserEmail, this.tweet)
    this.isFollowing = false;
  }

  // adds like to the tweet when like button clicked
  addLike() {
    this.tweetService.addLike(this.index, this.currentUserEmail);
    this.tweet.tweetLikes++;
    this.likedCheck();
  }

  // removes like from the tweet when like button clicked and was previously liked
  removeLike() {
    this.tweetService.removeLike(this.index, this.currentUserEmail);
    this.tweet.tweetLikes--;
    this.likedCheck();
  }

  // to add retweet by current user to the tweets list of users who retweeted. also for UI
  addRet() {
    this.tweetService.addRet(this.index, this.currentUserEmail);
    this.tweet.tweetRets++;
    this.retCheck();
  }

  // removes retweet by user from the tweets list of users who retweeted. also for UI
  removeRet() {
    this.tweetService.removeRet(this.index, this.currentUserEmail);
    this.tweet.tweetRets--;
    this.retCheck();
  }

  isNotCurrentUserLoaded: Promise<boolean>;
  isCurrentUserLoaded: Promise<boolean>;

  // TODO: subscriptions for listeners. Do I need these?
  subscription: Subscription;
  tweetsRetrievedSub: Subscription;

  usersSub: Subscription;
  users: NewUser[];

  ngOnInit() {
    this.usersSub = this.tweetService.usersChanged.subscribe((users) => {
      this.users = users;
      this.isFollowingCheck();
    })

    // sets the initial tweets array in the tweeter service. only run for the first tweet in the index to avoid redundancies
    if (this.index === 0) {
      this.tweetService.initialTweetsSetter();
    }

    // sets the users array in the tweeter service
    this.tweetService.initialUsersSetter();

    // listens for the tweets to be received so then checks can be made about the tweet
    this.tweetsRetrievedSub = this.tweetService.tweetsRetrieved.subscribe((res) => {
      this.isCurrentUserCheck();
      this.isFollowingCheck();
      this.isRetElseCheck();
      this.retCheck();
      this.likedCheck();
    })

    // listens for the response from the function which checks if the tweet was made by the user who is logged in
    this.subscription = this.isCurrentUser.subscribe((response) => {
      this.isCurrentUserLoaded = Promise.resolve(!response);
      this.isNotCurrentUserLoaded = Promise.resolve(response);
      this.showTweet = true;
    })

    /* dicates whether to show the feed or discover screen
    problem is that it doesn't run on initialization after sign up*/
    this.tweetService.isFeed.subscribe((response) => {
      this.isShowCheck(response)
    })

    // checks who retweeted the tweet
    this.tweetService.retBy.subscribe(res => {
      if (res !== null) {
        this.retBy = this.tweetService.getUserUsername(res);
      }
    })
  }

  // checks if the current user liked the tweet
  likedCheck() {
    this.isLiked = this.tweetService.likedCheck(this.index, this.currentUserEmail);
  }

  // checks if the current user retweeted the current tweet
  retCheck() {
    this.isRet = this.tweetService.retCheck(this.index, this.currentUserEmail)
  }

  // checks if the tweet was retweeted by someone current user is following
  isRetElseCheck() {
    this.isRetElse = this.tweetService.retByElseCheck(this.index, this.currentUserEmail)
  }

  // checks if the current user following tweet publisher
  isFollowingCheck() {
    this.isFollowing = this.tweetService.isFollowingCheck(this.index, this.currentUserEmail);
  }

  // checks if the tweet was retweeted by the user logged in
  retByCurrUserCheck() {
    this.retByCurrUser = this.tweetService.retByCurrentUser(this.index, this.currentUserEmail);
  }

  isCurrentUserCheck() {
    this.isCurrentUser.next(this.tweetService.currentUserCheck(this.index, this.currentUserEmail));
  }

  // checks if the tweet should be shown to the current user
  isShowCheck(response: boolean) {
    this.retCheck();
    this.isRetElseCheck();
    this.retByCurrUserCheck();
    this.isFeed = response;

    if (this.isFeed && (this.tweetService.isFollowingCheck(this.index, this.currentUserEmail) || this.tweetService.retByElseCheck(this.index, this.currentUserEmail) || this.tweetService.tweetMadeByUser(this.index, this.currentUserEmail))) {
      this.showTweet = true;
    } else if (this.isFeed && this.tweetService.retByCurrentUser(this.index, this.currentUserEmail)) {
      this.showTweet = true;
    } else if (this.isFeed && !this.tweetService.isFollowingCheck(this.index, this.currentUserEmail)) {
      this.showTweet = false;
    }  else {
      this.showTweet = true;
    }
  }
}
