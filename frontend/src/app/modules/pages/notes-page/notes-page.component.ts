import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../components/header.component';
import { parse } from 'path';

@Component({
    // selector: 'notes-page',
    standalone: true,
    templateUrl: './notes-page.component.html',
    styleUrl: './notes-page.component.scss',
    imports: [CommonModule, FormsModule, HeaderComponent]
})
export class NotesPage {
    // url =  "http://127.0.0.1:5000/notes/user/"
    someInput = '';
    newNoteTitle = '';
    newNoteContent = '';
    newNoteReminder = '';
    editNoteTitle = '';
    editNoteContent = '';
    editNoteReminder = '';
    isAddModalShown = false;
    isModalShown = false;
    isDeleteModalShown = false;
    isEditModalShown = false;
    selectedNoteId = 0;
    jwt : string = ''

    notes : any[][] = [["1", "1", "1", "1", "1", "1"]];
    constructor() {
        this.getUserId();
        this.getNotes();
    }

    printChildEvent(e: any) {
        alert(e);
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
        try {
            const response = await fetch("http://127.0.0.1:5000/notes/user", {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Id': this.jwt
                }
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok' + response.statusText);
            }
            const data = await response.json();
            this.notes = data;
            let offset = -(new Date().getTimezoneOffset() / 60);
            let offsetHours = Math.floor(offset);
            let offsetMinutes = Math.round((offset - offsetHours) * 60);

            var febr = new Date().getFullYear() % 4 == 0 ? 29 : 28;
            const monthList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const MonthListDays = [31, febr, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            const dayList = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            for (let i in this.notes) {
                let remindDateTime = this.notes[i][5].slice(0, -7).split(/, |:| /g);
                let hours = parseInt(remindDateTime[4]) + offsetHours;
                let minutes = parseInt(remindDateTime[5]) + offsetMinutes;
                if (minutes >= 60) {
                    hours += 1;
                    minutes -= 60;
                }
                else if (minutes < 0) { 
                    hours -= 1;
                    minutes += 60;
                }
                if (hours >= 24) { 
                    hours -= 24;
                    remindDateTime[1] = String(parseInt(remindDateTime[1]) + 1).padStart(2, '0');
                    remindDateTime[0] = dayList[(dayList.indexOf(remindDateTime[0]) + 1) % 7]
                }
                else if (hours < 0) {
                    hours += 24;
                    remindDateTime[1] = String(parseInt(remindDateTime[1]) - 1).padStart(2, '0');
                    remindDateTime[0] = dayList[dayList.indexOf(remindDateTime[0]) - 1]
                }
                if (parseInt(remindDateTime[1]) > MonthListDays[monthList.indexOf(remindDateTime[2])]) {
                    remindDateTime[1] = "01";
                    remindDateTime[2] = monthList[(monthList.indexOf(remindDateTime[2]) + 1) % 12];
                    if (remindDateTime[2] = 'Jan') {
                        remindDateTime[3] = String(parseInt(remindDateTime[3]) + 1);
                    }
                }
                else if (parseInt(remindDateTime[1]) <= 0) {
                    if (parseInt(remindDateTime[1]) == 0) {
                        remindDateTime[1] = String(parseInt(remindDateTime[1]) + 1).padStart(2, '0');
                    }
                    remindDateTime[2] = monthList[(monthList.indexOf(remindDateTime[2]) - 1)];
                    if (remindDateTime[2] = 'Dec') {
                        remindDateTime[3] = String(parseInt(remindDateTime[3]) - 1);
                    }
                }

                remindDateTime[4] = String(hours).padStart(2, '0');
                remindDateTime[5] = String(minutes).padStart(2, '0');
                remindDateTime = remindDateTime.slice(0, 4).join(' ') + ' ' + remindDateTime.slice(4).join(':');
                this.notes[i][5] = remindDateTime;
                if (this.notes[i][2].length > 50) { 
                    this.notes[i][2] = this.notes[i][2].slice(0, 50) + '...'
                }
                if (this.notes[i][3].length > 300) {
                    this.notes[i][3] = this.notes[i][3].slice(0, 300) + '...';
                }
            }
        } catch (error) {
            console.error('There has been a problem with your fetch operation:', error);
        }
    }
    
    closeModal() {
        this.isModalShown = false;
        this.isAddModalShown = false;
        this.newNoteTitle = '';
        this.newNoteContent = '';
        this.newNoteReminder = '';
        this.editNoteTitle = '';
        this.editNoteContent = '';
        this.editNoteReminder = '';
        this.isDeleteModalShown = false;
        this.selectedNoteId = 0;
        this.isEditModalShown = false;
    }

    showAddModal() {
        this.isAddModalShown = true;
        this.isModalShown = true;
    }

    showDeleteModal(noteId : number) {
        this.isDeleteModalShown = true;
        this.isModalShown = true;
        this.selectedNoteId = noteId;
    }

    showEditModal(noteIndex: number, noteId: number) {
        this.isEditModalShown = true;
        this.isModalShown = true;
        this.selectedNoteId = noteId;
        this.editNoteTitle = this.notes[noteIndex][2];
        this.editNoteContent = this.notes[noteIndex][3];
        console.log(this.notes[noteIndex][5])
        this.editNoteReminder = this.toLocalISOString(this.notes[noteIndex][5]);
        console.log(this.editNoteReminder);
    }
    
    toDatabaseDate(date: string) {
        let offset = -(new Date().getTimezoneOffset() / 60)
        let sign = offset < 0 ?  '-' : '+'
        offset = Math.abs(offset);
        let offsetHours = Math.floor(offset);
        let offsetMinutes = Math.round((offset - offsetHours) * 60);
        let formattedOffset = `${sign}${String(offsetHours).padStart(2, '0')}:${String(offsetMinutes).padStart(2, '0')}`;
        return `${date}${formattedOffset}`;
    }

    toLocalISOString(date : string) {
        var localTime = date.slice(-5)
        var localDate = new Date(Date.parse(date)).toISOString().slice(0, -13) + localTime; 
        return localDate;
    }

    async addNote() {
        let dateRemind = this.toDatabaseDate(this.newNoteReminder);
        if (this.newNoteContent && this.newNoteTitle && this.newNoteReminder) {
            const response = await fetch('http://127.0.0.1:5000/notes/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Id': this.jwt
                },
                body: JSON.stringify({ title: this.newNoteTitle, content: this.newNoteContent, date_added: new Date().toISOString().slice(0, 19).replace('T', ' '), date_remind: dateRemind})
            }).then (response => {this.getNotes(); this.closeModal();});
        }
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

    async editNote() {
        let dateRemind = this.toDatabaseDate(this.editNoteReminder);
        console.log(this.editNoteReminder);
        const response = await fetch('http://127.0.0.1:5000/notes/edit', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'User-Id': this.jwt
            },
            body: JSON.stringify({note_id: this.selectedNoteId, title: this.editNoteTitle, content: this.editNoteContent, date_remind: dateRemind})
        }).then(response => {this.getNotes(); this.closeModal();});
    }

    stopPropagation(event: any) {   
        event.stopPropagation();
    }
}