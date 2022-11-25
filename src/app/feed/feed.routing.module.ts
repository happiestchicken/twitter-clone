import { NgModule } from "@angular/core";
import { FeedComponent } from "./feed.component";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "../auth/auth.guard";


const routes: Routes = [
  { path: '',
    component: FeedComponent,
    canActivate: [AuthGuard],
  }
 ];

 @NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [AuthGuard]
 })

 export class FeedRoutingModule {}
