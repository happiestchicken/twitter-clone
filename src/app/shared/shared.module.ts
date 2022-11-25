import { NgModule } from "@angular/core";
import { TweetItemComponent } from "../feed/tweet-item/tweet-item.component";
import { LoadingSpinnerComponent } from "./loading-spinner/loading-spinner.component";
import { PlaceholderDirective } from "./placeholder/placeholder.directive";


@NgModule
({
  declarations: [
    PlaceholderDirective,
    LoadingSpinnerComponent
  ],
  imports: [

  ],
  exports: [
    PlaceholderDirective,
    LoadingSpinnerComponent
  ]
})

export class SharedModule {}
