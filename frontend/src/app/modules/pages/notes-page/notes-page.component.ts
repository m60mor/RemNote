import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../components/header.component';

@Component({
    // selector: 'notes-page',
    standalone: true,
    templateUrl: './notes-page.component.html',
    styleUrl: './notes-page.component.scss',
    imports: [CommonModule, FormsModule, HeaderComponent]
})
export class NotesPage {
    // url =  "http://127.0.0.1:5000/notes/user/"
    someInput = ''
    newNoteTitle = ''
    newNoteContent = ''
    isAddModalShown = false;
    isModalShown = false;
    isDeleteModalShown = false;
    selectedNoteId = -1;
    jwt : string = ''

    notes : any[][] = [["1", "1", "1", "1", "1", "1"]];
    constructor() {
        this.getUserId();
        this.getNotes();
    }

    changeHeader(e : any) {
        console.log(e);
    }

    getUserId() {
        const router = new Router();
        var storedJwt = localStorage.getItem('jwt');
        if (storedJwt == null) {
            router.navigate(['/']);
        }
        else {
            this.jwt = storedJwt;
        }
    }

    async getNotes() {
        const response = await fetch("http://127.0.0.1:5000/notes/user", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'User-Id': this.jwt
            }
        
        });
        const data = await response.json() ?? {};
        this.notes = data;
        return data;
    }
    
    closeModal() {
        this.isModalShown = false;
        this.isAddModalShown = false;
        this.newNoteTitle = ''
        this.newNoteContent = ''
        this.isDeleteModalShown = false;
        this.selectedNoteId = -1;
    }

    showAddModal() {
        this.isAddModalShown = true;
        this.isModalShown = true;
    }

    async addNote() {
        if (this.newNoteContent && this.newNoteTitle) {
            const response = await fetch('http://127.0.0.1:5000/notes/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Id': this.jwt
                },
                body: JSON.stringify({ title: this.newNoteTitle, content: this.newNoteContent, date_added: new Date().toISOString().slice(0, 19).replace('T', ' '), date_remind: new Date().toISOString().slice(0, 19).replace('T', ' ')})
            }).then (response => {this.getNotes(); this.closeModal();});
        }
    }

    showDeleteModal(noteId : number) {
        this.isDeleteModalShown = true;
        this.isModalShown = true;
        this.selectedNoteId = noteId;
    }

    async deleteNote() {
        const response = await fetch('http://127.0.0.1:5000/notes/delete', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'User-Id': this.jwt
            },
            body: JSON.stringify({ note_id: this.selectedNoteId })
        }).then (response => {this.getNotes(); this.closeModal();});
    }
}