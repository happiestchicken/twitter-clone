export class Tweet {
  public tweet: string;
  public id: number;
  public userId: string;
  public tweetEmail: string;
  public tweetLikes: number;
  public tweetLikedBy: string[];
  public tweetUsername: string;
  public tweetName: string;
  public tweetUserColor: string;
  public tweetRetBy: string[];
  public tweetRets: number;

  constructor(
    tweet: string,
    id: number,
    userId: string,
    email: string,
    likes: number,
    tweetLikedBy: string[],
    tweetUsername: string,
    tweetRetBy: string[],
    tweetRets: number,
    tweetName: string,
    tweetUserColor: string)
    {
    this.tweet = tweet;
    this.id = id;
    this.userId = userId;
    this.tweetEmail = email;
    this.tweetLikes = likes;
    this.tweetLikedBy = tweetLikedBy;
    this.tweetUsername = tweetUsername;
    this.tweetName = tweetName;
    this.tweetUserColor = tweetUserColor;
    this.tweetRetBy = tweetRetBy;
    this.tweetRets = tweetRets;
  }
}
