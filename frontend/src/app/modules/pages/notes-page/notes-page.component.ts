import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { get } from 'http';

@Component({
    selector: 'notes-page',
    standalone: true,
    templateUrl: './notes-page.component.html',
    styleUrl: './notes-page.component.scss',
    imports: [CommonModule]
})
export class NotesPage {
    url =  "http://127.0.0.1:5000/notes/user?id=1"

    async getNotes() {
        const response = await fetch(this.url);
        const data = await response.json() ?? {};
        return data;
    }
    
    notes = [[1, 1, 1, 1, 1, 1]];
    constructor() {
        this.getNotes().then(data => {
            this.notes = data;
            console.log(this.notes);
         }
        );
    }
    addNote() {
        console.log('Note added');
    }
    deleteNote() {
        console.log('Note deleted');
    }
}