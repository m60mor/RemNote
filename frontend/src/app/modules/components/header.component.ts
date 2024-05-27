import { Component, Input, Output, EventEmitter } from "@angular/core";
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
  router : Router = new Router();
  // constructor(private router: Router) {
  //   console.log("Header");
  // }
  // @Input() notes : any[][] = [[]];
  // @Output() notesChange = new EventEmitter<any[][]>();

  // emitList() {
  //   this.notes.push(["1", "1", "1", "1", "1", "1"]);
  //   this.notes = this.notes.slice()
  //   this.notesChange.emit(this.notes);
  // }

  logOut() { 
    localStorage.removeItem("jwt");
    this.router.navigate(["/login"]);
  }
}