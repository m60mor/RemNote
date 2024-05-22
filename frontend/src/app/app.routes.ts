import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { NotesPage } from './modules/pages/notes-page/notes-page.component';
import { LoginPage } from './modules/pages/login-page/login-page.component';

export const routes: Routes = [
    {
        path: '',
        component: LoginPage
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
