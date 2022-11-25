import { Injectable } from "@angular/core";
import axios from "axios";


@Injectable({providedIn: 'root'})
export class BadWordsService {
  // ret = false;

  // profanityCheck(username: string) {
  //   const options = {
  //     method: 'GET',
  //     headers: {
  //       'X-RapidAPI-Key': 'bedbf729f8msh14b916b09ff2366p1b1c8cjsn080219c9126b',
  //       'X-RapidAPI-Host': 'community-purgomalum.p.rapidapi.com'
  //     }
  //   };

  //   fetch('https://community-purgomalum.p.rapidapi.com/containsprofanity?text=is%20some%20test%20input' + username, options)
  //     .then(response => response.json())
  //     .then(response => {
  //       console.log('res 1: ' + response);
  //       this.ret = response;
  //       return this.ret;
  //     })
  //     .catch(err => console.error('error: ' + err));
  //     return this.ret;
  // }

  badwordsArray = require('badwords/array');

  profanityCheck(username: string) {
    if (this.badwordsArray.some((word: string) => username.includes(word))) {
      return true;
    }
    return false;
  }
}
