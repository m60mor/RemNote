import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, FormControl, FormGroup, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
    standalone: true,
    templateUrl: './login-page.component.html',
    styleUrl: './login-page.component.scss',
    imports: [CommonModule, FormsModule, ReactiveFormsModule]
})
export class LoginPage {
    loginForm = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        username: ['', Validators.required],
        password: ['', Validators.required]
    })

    constructor(private router: Router, private fb: FormBuilder) {
        var stored_jwt = localStorage.getItem('jwt')
        if (stored_jwt != null) {
            this.router.navigate(['/notes']);
        }
    }

    isSubmitted = false;
    invalidParameters = false;
    jwt : any = ''
    emailValidator() {
        return ((this.loginForm.get('email')?.invalid && this.isSubmitted) || this.invalidParameters);
    }
    usernameValidator() {
        return ((this.loginForm.get('username')?.invalid && this.isSubmitted) || this.invalidParameters);
    }
    passwordValidator() {
        return ((this.loginForm.get('password')?.invalid && this.isSubmitted) || this.invalidParameters);
    }

    //(this.loginForm.get('email')?.dirty || this.loginForm.get('email')?.touched || this.isSubmitted)

    async login() {
        this.isSubmitted = true;
        if (this.loginForm.invalid) {
            console.error('Invalid form');
        }
        else {
            try {
                const response = await fetch('http://127.0.0.1:5000/login', {
                    method: 'POST', 
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: this.loginForm.value.email,
                        username: this.loginForm.value.username,
                        password: this.loginForm.value.password
                    })
                });
    
                if (!response.ok) {
                    if (response.status === 401) {
                        console.error('Unauthorized: Invalid credentials');
                        this.invalidParameters = true;
                    } else {
                        console.error('HTTP Error:', response.status, response.statusText);
                    }
                } else {
                    const data = await response.json();
                    if (data?.[0]?.[0]) {
                        this.jwt = data?.[0]?.[0];
                        console.log('JWT:', this.jwt);
                        localStorage.setItem('jwt', this.jwt);
                        this.router.navigate(['/notes']);
                    }
                }
            } catch (error) {
                console.error('Network Error:', error);
            }
        }
    }
}