import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { NewUser } from '../newUser.model';
import { ValidatorService } from '../shared/validator.service';
import { Tweet } from '../tweet.model';
import { TweeterService } from '../tweeter.service';


@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css']
})
export class FeedComponent implements OnInit {

  // to display the message about the feed section
  isFeed: boolean = false;

  // form for creating new tweet
  tweetForm: FormGroup;

  // for new tweet screen. initially false
  newTweet = false;

  // for storing and updating the tweets list and users list
  tweets: Tweet[] = [];
  tweetsSub: Subscription; // to update tweets with every addition

  users: NewUser[];
  usersSub: Subscription;

  constructor(private tweetService: TweeterService, private validatorService: ValidatorService, private authService: AuthService) { }

  ngOnInit(): void {
    // makes the tweet service have the proper tweet array on init
    this.tweetService.initialTweetsSetter();
    this.tweetService.initialUsersSetter();

    this.usersSub = this.tweetService.usersChanged.subscribe((users) => {
      this.users = users;
    })

    // TODO: this doesnt work on the first run as it thinks we are in feed
    this.tweetService.isFeed.subscribe(res => {
      this.isFeed = res;
    })

    // fetches tweets on initialization
    this.tweetService.getTweets().subscribe(res => {
      if (res !== null) {
        this.tweets = res;
      }
    })

    // listens for updates to tweets array
    this.tweetsSub = this.tweetService.tweetsChanged.subscribe((tweets: Tweet[]) => {
      console.log('got message')
      // let newLen = tweets.length;
        // let oldLen = this.tweets.length;
        this.tweets = tweets;
        // if (oldLen < newLen) {
        //   window.location.reload();
        // }
      }
    )

    // listens for button click on the 'new tweet button' to display that div
    this.tweetService.tweetClick.subscribe(res => {
      this.newTweet = res;
      this.initForm();
    });

    // loads the initial array of users when tweet loads
    this.tweetService.getUsers().subscribe(res => {
      if (res !== null) {
        this.users = res;
      }
    })
  }

  // to close the 'new tweet' box
  onClose() {
    this.tweetService.newTweetClose();
  }

  // to submit the form of the new tweet when user clicks off or submits
  onSubmit() {
    this.tweetService.addTweet(this.tweetForm.value)
  }

  // form group instance for new tweet
  private initForm() {
    let tweet = '';
    let tweetId: number = Math.floor(Math.random() * 100000);
    let tweetEmail: string = this.authService.getUserEmail();;
    let tweetUsername: string = this.tweetService.getUserUsername(this.authService.getUserEmail());
    let tweetName: string = this.tweetService.getUserName(this.authService.getUserEmail());
    let tweetUserColor: string = this.tweetService.getUserColor(this.authService.getUserEmail())
    let tweetLikes: number = 0;
    let tweetLikedBy: string[] = [''];
    let tweetRetBy: string[] = [''];
    let tweetRets: number = 0;

    this.tweetForm = new FormGroup({
      'tweet': new FormControl(tweet, [Validators.required, this.validLength.bind(this)]),
      'tweetId': new FormControl(tweetId),
      'tweetEmail': new FormControl(tweetEmail, Validators.required),
      'tweetLikes': new FormControl(tweetLikes),
      'tweetLikedBy': new FormControl(tweetLikedBy),
      'tweetUsername': new FormControl(tweetUsername),
      'tweetName': new FormControl(tweetName),
      'tweetUserColor': new FormControl(tweetUserColor),
      'tweetRetBy': new FormControl(tweetRetBy),
      'tweetRets': new FormControl(tweetRets)
    });
  }

  /* ensures that the new tweet is not too long (over 140 chars) and
  doesn't just contain spaces*/
  validLength(control: FormControl): {[s: string]: boolean} | null {
    return this.validatorService.validLength(control.value);
  }
}
