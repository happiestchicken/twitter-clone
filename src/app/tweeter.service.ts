import { HttpClient } from '@angular/common/http';
import { Injectable, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { NewUser } from './newUser.model';
import { BadWordsService } from './shared/badwords.service';
import { DataStorageService } from './shared/data-storage.service';
import { Tweet } from './tweet.model';
import { tap } from 'rxjs/operators';


@Injectable({ providedIn: 'root' })
export class TweeterService {

  // set up so that the 'new tweet screen can be displayed'
  @Output() tweetClick = new EventEmitter<boolean>();

  // emits whether user is on the feed or discover sreen
  isFeed = new Subject<boolean>();

  tweetsRetrieved = new Subject<boolean>();

  // for emitting which user, if any retweeted the tweet for UI purposes
  retBy = new Subject<string>();

  // store the arrays of tweets and users as well as subjects for when the arrays are modified
  tweets: Tweet[] = [];
  tweetsChanged = new Subject<Tweet[]>();
  users: NewUser[] = [];
  usersChanged = new Subject<NewUser[]>();

  constructor(private http: HttpClient, private dataStorageService: DataStorageService, private badWordsService: BadWordsService, private router: Router) {}

  // gets and sets the tweets array. called when tweet component initialized
  initialTweetsSetter() {
    this.getTweets().subscribe(res => {
      if (res !== null) {
        this.tweets = res;
      }
    })
  }

  // sets the users array on initialization
  initialUsersSetter() {
    this.getUsers().subscribe(res => {
      if (res !== null) {
        this.users = res;
      }
    })
  }

  // gets tweets array from the firebase database
  getTweets(): Observable<Tweet[]> {
    return this.http.get<Tweet[]>('https://twitter-clone-db96d-default-rtdb.firebaseio.com/tweets.json'
    ).pipe(tap(() => {
      this.tweetsRetrieved.next(true);
    }));
  }

  // gets users array from the firebase database
  getUsers(): Observable<NewUser[]> {
    return this.http.get<NewUser[]>('https://twitter-clone-db96d-default-rtdb.firebaseio.com/users.json');
  }

  // emits for the 'new tweet' box to be displayed
  newTweet() {
    this.tweetClick.emit(true);
  }

  // emits for the 'new tweet' box to be closed
  newTweetClose() {
    this.tweetClick.emit(false);
  }

 // for alternating between feed and discover views
  makeFeed(res: boolean) {
    this.isFeed.next(res);
  }

  // sets up storage for new tweet
  addTweet(tweet: Tweet) {
    if (tweet.tweet.length > 140) {return}
    this.tweets = [tweet].concat(this.tweets);
    this.dataStorageService.storeTweets(this.tweets, 1);
    this.newTweetClose();
  }

  // adds new user to local users array and then calls for that array to be stored in the firebase database
  addNewUser(email: string, idToken: string, username: string, name: string, color: string) {
    let following: string[] = [''];
    let newUser = new NewUser(email, idToken, following, username, name, color);
    this.users.push(newUser);
    this.usersChanged.next(this.users);
    this.dataStorageService.storeUsers(this.users);
  }

  // adds the user who made the tweet to the logged in users array of following
  addFollow(email: string, tweet: Tweet) {
    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i].email === email) {
        this.users[i].following.push(tweet.tweetEmail);
        this.dataStorageService.storeUsers(this.users);
        this.usersChanged.next(this.users.slice());
      }
    }
  }

  // removes the user who made the tweet to the logged in users array of following
  removeFollow(email: string, tweet: Tweet) {
    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i].email === email) {
        const index = this.users[i].following.indexOf(tweet.tweetEmail);
        if (index > -1) {
          this.users[i].following.splice(index, 1)
        }
        this.dataStorageService.storeUsers(this.users);
        this.usersChanged.next(this.users.slice());
      }
    }
  }

  // adds like to tweet in database
  addLike(index: number, email: string) {
    if (this.tweets !== undefined && this.tweets !== null) {
      for (let i = 0; i < this.tweets[index].tweetLikedBy.length; i++) {
        if (this.tweets[index].tweetLikedBy[i] === email) {
          return;
        }
      }
      this.tweets[index].tweetLikes++;
      this.tweets[index].tweetLikedBy.push(email);
      this.dataStorageService.storeTweets(this.tweets, 0);
    }
  }

  // removes like from tweet in database
  removeLike(index: number, email: string) { // left off
    if (this.tweets !== undefined && this.tweets !== null) {
      this.tweets[index].tweetLikedBy = this.tweets[index].tweetLikedBy.splice(this.tweets[index].tweetLikedBy.indexOf(email) - 1, 1);
      this.tweets[index].tweetLikes--;
      this.dataStorageService.storeTweets(this.tweets, 0);
    }
  }

  // adds retweet to tweet in database
  addRet(index: number, email: string) {
    if (this.tweets !== undefined && this.tweets !== null) {
      for (let i = 0; i < this.tweets[index].tweetRetBy.length; i++) {
        if (this.tweets[index].tweetRetBy[i] === email) {
          return;
        }
      }
      this.tweets[index].tweetRets++;
      this.tweets[index].tweetRetBy.push(email);
      this.dataStorageService.storeTweets(this.tweets, 0);
    }
  }

  // removes retweet from tweet in database
  removeRet(index: number, email: string) {
    if (this.tweets !== undefined && this.tweets !== null) {
      this.tweets[index].tweetRetBy = this.tweets[index].tweetRetBy.splice(this.tweets[index].tweetRetBy.indexOf(email) - 1, 1);
      this.tweets[index].tweetRets--;
      this.dataStorageService.storeTweets(this.tweets, 0);
    }
  }

  // checks if the tweet has been liked by the user
  likedCheck(index: number, email: string) {
    if (this.tweets.length > 0) {
      for (let i = 0; i < this.tweets[index].tweetLikedBy.length; i++) {
        if (this.tweets[index].tweetLikedBy[i] === email) {
          return true;
        }
      }
    }
    return false;
  }

  // checks if the tweet has been retweeted by the user
  retCheck(index: number, email: string) {
    if (this.tweets.length > 0) {
      for (let i = 0; i < this.tweets[index].tweetRetBy.length; i++) {
        if (this.tweets[index].tweetRetBy[i] === email) {
          return true;
        }
      }
    }
    return false;
  }

  // checks if the tweet has been retweeted by someone the user is following
  retByElseCheck(index: number, email: string) {
    let userFollowing;
    if (this.users.length > 0) {
      for (let k = 0; k < this.users.length; k++) {
        if (this.users[k].email === email) {
          userFollowing = this.users[k].following;
        }
      }
    }
    if (this.tweets.length > 0 && userFollowing !== undefined) {
      for (let i = 0; i < this.tweets[index].tweetRetBy.length; i++) {
        for (let j = 0; j < userFollowing.length; j++) {
          if (this.tweets[index].tweetRetBy[i] === userFollowing[j]) {
            if (this.tweets[index].tweetRetBy[i] !== '' && userFollowing[j] !== '') {
              this.retBy.next(this.tweets[index].tweetRetBy[i]);
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  // checks if the tweet has been retweeted by the user logged in
  retByCurrentUser(index: number, email: string) {
    if (this.tweets.length > 0) {
      for (let i = 0; i < this.tweets[index].tweetRetBy.length; i++) {
        if (this.tweets[index].tweetRetBy[i] === email) {
          if (this.tweets[index].tweetRetBy[i] !== '') {

            return true;
          }
        }
      }
    }
    return false;
  }

  // checks if the tweet was made by the user logged in to show in feed
  tweetMadeByUser(index: number, email: string) {
    if (this.tweets.length > 0) {
      if (this.tweets[index].tweetEmail === email) {
        return true;
      }
    }
    return false;
  }

  // checks if the user logged in is following the user who is displayed
  isFollowingCheck(index: number, email: string) {
    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i].email === email) {
        for (let j = 0; j < this.users[i].following.length; j++) {
          if (this.users[i].following[j] === this.tweets[index].tweetEmail) {
            return true;
          }
        }
      }
    }
    return false
  }

  currentUserCheck(index: number, email: string) {
    if (this.tweets[index].tweetEmail === email) {
      return false;
    } else {
      return true;
    }
  }

  // TODO: the problem is that this service doesn't have the updated users array when function is called
  getUserUsername(email: string) {
    if (this.users.length > 0) {
      for (let i = 0; i < this.users.length; i++) {
        if (this.users[i].email === email) {
          return this.users[i].username;
        }
      }
    }
    return 'username';
  }

  // returns the users username for display, given the email
  getUserName(email: string) {
    if (this.users.length > 0) {
      for (let i = 0; i < this.users.length; i++) {
        if (this.users[i].email === email) {
          return this.users[i].name;
        }
      }
    }
    return 'Twitter User';
  }

  // returns the users color to display in profile pic on feed load
  getUserColor(email: string) {
    if (this.users.length > 0) {
      for (let i = 0; i < this.users.length; i++) {
        if (this.users[i].email === email) {
          return this.users[i].color;
        }
      }
    }
    return '#1da1f2';
  }

  /* ensures username not already taken.
  must not put in the validator service as need the users array*/
  usernameTakenValidator(username: string) {
    if (this.users.length > 0) {
      for (let i = 0; i < this.users.length; i++) {
        if (username === this.users[i].username.toLowerCase()) {
          return {'usernameTaken': true};
        }
      }
    }
    return null;
  }
}
