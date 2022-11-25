import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { SharedModule } from "../shared/shared.module";
import { FeedComponent } from "./feed.component";
import { FeedRoutingModule } from './feed.routing.module'
import { TweetItemComponent } from "./tweet-item/tweet-item.component";



@NgModule
({
  declarations: [
    FeedComponent,
    TweetItemComponent
  ],
  imports: [
    RouterModule,
    FeedRoutingModule,
    CommonModule,
    ReactiveFormsModule,
    SharedModule
  ],
  exports: [
    FeedComponent,
  ]
})

export class FeedModule {}
