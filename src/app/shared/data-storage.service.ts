import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { NewUser } from "../newUser.model";
import { Tweet } from "../tweet.model";


@Injectable({providedIn: 'root'})
export class DataStorageService {
  constructor(private http: HttpClient) {}

  // stores the users array in firebase
  storeUsers(users: NewUser[]) {
    this.http.put('https://twitter-clone-db96d-default-rtdb.firebaseio.com/users.json',
    users)
    .subscribe(response => {
      // console.log('Response - store new user' + response);
    })
  }

  // stores tweets in firebase and reloads the window when done
  storeTweets(tweets: Tweet[], code: number) {
    this.http.put('https://twitter-clone-db96d-default-rtdb.firebaseio.com/tweets.json',
    tweets
    ).subscribe(response => {
      console.log('Response - store tweets' + response);
      if (code === 1) {
        window.scrollTo(0,0);
        window.location.reload();
      }
    })
  }
}


