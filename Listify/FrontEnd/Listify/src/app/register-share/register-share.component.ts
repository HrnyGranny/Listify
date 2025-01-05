import { Component, OnInit } from '@angular/core';
import * as bootstrap from 'bootstrap';
import { AuthService } from '../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { ListService } from '../services/list.services';

@Component({
  selector: 'app-register-share',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register-share.component.html',
  styleUrls: ['./register-share.component.css']
})
export class RegisterShareComponent implements OnInit {
  registerData = { email: '', username: '', password: '', confirmPassword: '' };
  emailExists = false;
  usernameExists = false;
  passwordMismatch = false;
  listId: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private listService: ListService
  ) {}

  ngOnInit(): void {
    this.listId = this.route.snapshot.queryParamMap.get('listId');

    // Form validation
    (function () {
      'use strict'
      var forms = document.querySelectorAll('form')
      Array.prototype.slice.call(forms)
        .forEach(function (form) {
          form.addEventListener('submit', function (event: { preventDefault: () => void; stopPropagation: () => void; }) {
            if (!form.checkValidity()) {
              event.preventDefault()
              event.stopPropagation()
            }
            form.classList.add('was-validated')
          }, false)
        })
    })();
  }

  onRegister(): void {
    this.resetErrors();

    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.passwordMismatch = true;
      this.registerData.password = '';
      this.registerData.confirmPassword = '';
      Swal.fire({
        position: 'bottom-end',
        icon: 'error',
        title: 'Error',
        text: 'Passwords do not match',
        showConfirmButton: false,
        timer: 3000,
        toast: true
      });
      return;
    }
    
    this.authService.register(this.registerData).subscribe(
      (response: any) => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          if (this.listId) {
            // Lógica para asignar la lista compartida al usuario registrado
            this.listService.updateListShareNo(this.listId, [this.registerData.username]).subscribe(() => {
              this.router.navigate(['/user']);
              Swal.fire({
                position: 'bottom-end',
                icon: 'success',
                title: 'User registered and list assigned successfully',
                showConfirmButton: false,
                timer: 3000,
                toast: true
              });
            });
          } else {
            this.router.navigate(['/shared']);
            Swal.fire({
              position: 'bottom-end',
              icon: 'success',
              title: 'User registered successfully',
              showConfirmButton: false,
              timer: 3000,
              toast: true
            });
          }
        } else {
          this.clearRegisterData();
          Swal.fire({
            position: 'bottom-end',
            icon: 'error',
            title: 'Error',
            text: 'No token found in response',
            showConfirmButton: false,
            timer: 3000,
            toast: true
          });
        }
      },
      (error) => {
        if (error.status === 400) {
          if (error.error.message === 'El nombre de usuario ya está en uso') {
            this.usernameExists = true;
            this.registerData.username = '';
            Swal.fire({
              position: 'bottom-end',
              icon: 'error',
              title: 'Error',
              text: 'Username already exists',
              showConfirmButton: false,
              timer: 3000,
              toast: true
            });
          } else if (error.error.message === 'El email ya está en uso') {
            this.emailExists = true;
            this.registerData.email = '';
            Swal.fire({
              position: 'bottom-end',
              icon: 'error',
              title: 'Error',
              text: 'Email already exists',
              showConfirmButton: false,
              timer: 3000,
              toast: true
            });
          } else {
            Swal.fire({
              position: 'bottom-end',
              icon: 'error',
              title: 'Error',
              text: 'Registration error: ' + error.error.message,
              showConfirmButton: false,
              timer: 3000,
              toast: true
            });
          }
        } else {
          Swal.fire({
            position: 'bottom-end',
            icon: 'error',
            title: 'Error',
            text: 'Registration error: ' + error.message,
            showConfirmButton: false,
            timer: 3000,
            toast: true
          });
        }
      }
    );
  }

  clearRegisterData(): void {
    this.registerData.email = '';
    this.registerData.username = '';
    this.registerData.password = '';
    this.registerData.confirmPassword = '';
  }

  resetErrors(): void {
    this.usernameExists = false;
    this.emailExists = false;
    this.passwordMismatch = false;
  }
}