import { Injectable } from "@angular/core";
import { BadWordsService } from "./badwords.service";


@Injectable({ providedIn: 'root' })
export class ValidatorService {

  constructor(private badWordService: BadWordsService) {}

  passwordValidator(password: string) {
    let tot: number = 0;
    // if no pass entered yet, just return. similiar to touched validator
    if (password === '') {
      return {'emptyPass': true};
    }
    // invalid characters check
    if (!/^[a-zA-Z0-9_.?!@-]+$/.test(password)) {
      return {'invalidCharsPass': true};
    }
    // add to strength if password contains a number
    if (/\d/.test(password)) {
      tot += 0.15;
    }
    // add to strength if the password contains a letter
    if (/[a-z]/i.test(password)) {
      tot += 0.15;
    }
    // add to strength total if there is a special character
    if (/[_.?!@-]/.test(password)) {
      tot += 0.15;
    }
    if (password.length >=10) {
      tot += 0.35;
    } else if (password.length >= 5 && password.length < 10) {
      tot += 0.15;
    } else {}
    // check pass strength and return
    if (tot > 0.5) {
      return null;
    } else {
      return {'passwordForbidden': true};
    }
  }

  nameValidator(name: string) {
    // return nothing if username not yet entered. similar to touched validator
    if (name === '') {
      return null;
    }
    // ensures that the name is not more than 20 chars and only contains certain chars
    if (name.length > 20 || !/^[a-zA-Z0-9 ]+$/.test(name)) {
      return {'invalidName': true};
    }
    return null;
  }

  usernameValidator(username: string) {
    // set up error object as there can be more than one error thrown at a time
    let errObject = {};
    // return nothing if username not yet entered. similar to the touched validator
    if (username === '') {
      return null;
    }
    // ensures username does not contain spaces
    if (/\s/.test(username)) {
      Object.assign(errObject, {"usernameWhitespace": true});
    }
    // invalid characters check
    if (!/^[a-zA-Z0-9_.]+$/.test(username)) {
      Object.assign(errObject, {"invalidChars": true});
    }
    // ensures username not too short or long
    if (username.replace(/\s/g, "").length > 16 || username.replace(/\s/g, "").length < 4) {
      Object.assign(errObject, {"usernameLength": true});
    }
    // checks username for profanity
    if (this.badWordService.profanityCheck(username)) {
      Object.assign(errObject, {'usernameProfanity': true});
    }
    return errObject;
  }

  // make sure tweet length less than 140 chars
  validLength(tweet: string) {
    if (tweet.replace(/\s+/g, '').length === 0) {
      return {'tweetTooShort': true};
    }
    if (tweet.length > 140) {
      return {'tweetTooLong': true};
    }
    return null;
  }
}
