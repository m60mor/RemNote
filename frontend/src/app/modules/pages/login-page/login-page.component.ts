import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    standalone: true,
    templateUrl: './login-page.component.html',
    styleUrl: './login-page.component.scss',
    imports: [CommonModule, FormsModule]
})
export class LoginPage {
    constructor(private router: Router) {
        console.log('Login page');
        var stored_jwt = localStorage.getItem('jwt')
        console.log(stored_jwt);
        if (stored_jwt != null) {
            this.router.navigate(['/notes']);
        }
    }

    jwt : any = ''
    email : any = ''
    username : any = ''
    password : any = ''


    async login() {
        const response = await fetch('http://127.0.0.1:5000/login', {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({email: this.email ,username: this.username, password: this.password})
        }).then(response => response.json())
        .then(data => {
            this.jwt = data?.[0]?.[0];
            if (this.jwt != '') {
                localStorage.setItem('jwt', this.jwt);
                this.router.navigate(['/notes']);
            }
        });
    }
}