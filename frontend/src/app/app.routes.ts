import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { NotesPage } from './modules/pages/notes-page/notes-page.component';

export const routes: Routes = [
    {
        path: '',
        component: AppComponent
    },
    {
        path: 'notes',
        component: NotesPage
    },
    {
        path: '**',
        redirectTo: ''
    }
];
