import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../components/header.component';

@Component({
    // selector: 'notes-page',
    standalone: true,
    templateUrl: './notes-page.component.html',
    styleUrl: './notes-page.component.scss',
    imports: [CommonModule, FormsModule, HeaderComponent]
})
export class NotesPage {
    url =  "http://127.0.0.1:5000/notes/user?id=1"
    someInput = ''
    colorWhite = true;
    isAddModalShown = false;
    isModalShown = false;
    
    changeHeader(e : any) {
        console.log(e);
    }

    async getNotes() {
        const response = await fetch(this.url);
        const data = await response.json() ?? {};
        return data;
    }
    
    notes : any[][] = [["1", "1", "1", "1", "1", "1"]];
    constructor() {
        this.getNotes().then(data => {
            this.notes = data;
            console.log(this.notes);
         }
        );
    }



    showAddModal() {
        this.isAddModalShown = true;
        this.isModalShown = true;
    }
    addNote() {
        console.log('Note added');
    }
    deleteNote() {
        console.log('Note deleted');
    }
    closeModal() {
        this.isAddModalShown = false;
        this.isModalShown = false;
    }
}