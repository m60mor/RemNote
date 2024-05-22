import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { Router } from "@angular/router";

@Component({
  standalone: true,
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrl: "./header.component.scss",
  imports: [CommonModule, RouterModule]
})
export class HeaderComponent {
  // constructor(private router: Router) {
  //   console.log("Header");
  // }
}