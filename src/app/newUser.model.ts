export class NewUser {
  constructor(
    public email: string,
    public idToken: string,
    public following: string[],
    public username: string,
    public name: string,
    public color: string
  ) {}
}
