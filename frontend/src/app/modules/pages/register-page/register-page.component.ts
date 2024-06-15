import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, FormControl, FormGroup, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
    standalone: true,
    templateUrl: './register-page.component.html',
    styleUrl: './register-page.component.scss',
    imports: [CommonModule, FormsModule, ReactiveFormsModule]
})
export class RegisterPage {
    registerForm = this.fb.group({
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
        return ((this.registerForm.get('email')?.invalid && this.isSubmitted) || this.invalidParameters);
    }
    usernameValidator() {
        return ((this.registerForm.get('username')?.invalid && this.isSubmitted) || this.invalidParameters);
    }
    passwordValidator() {
        return ((this.registerForm.get('password')?.invalid && this.isSubmitted) || this.invalidParameters);
    }

    //(this.loginForm.get('email')?.dirty || this.loginForm.get('email')?.touched || this.isSubmitted)

    async register() {
        this.isSubmitted = true;
        if (this.registerForm.invalid) {
            console.error('Invalid form');
        }
        else {
            try {
                const response = await fetch('http://127.0.0.1:5000/register', {
                    method: 'POST', 
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: this.registerForm.value.email,
                        username: this.registerForm.value.username,
                        password: this.registerForm.value.password
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
                    this.router.navigate(['/login']);
                }
            } catch (error) {
                console.error('Network Error:', error);
            }
        }
    }
}