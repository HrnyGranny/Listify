import { Component, OnInit } from '@angular/core';
import * as bootstrap from 'bootstrap';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit {
  loginData = { username: '', password: '' };
  registerData = { email: '', username: '', password: '', confirmPassword: '' };
  forgotPasswordData = { username: '' };
  loginErrorU = false;
  loginErrorP = false;
  emailExists = false;
  usernameExists = false;
  passwordMismatch = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Navbar shrink function
    const navbarShrink = () => {
      const navbarCollapsible = document.body.querySelector('#mainNav');
      if (!navbarCollapsible) {
        return;
      }
      if (window.scrollY === 0) {
        navbarCollapsible.classList.remove('navbar-shrink');
      } else {
        navbarCollapsible.classList.add('navbar-shrink');
      }
    };

    // Shrink the navbar 
    navbarShrink();

    // Shrink the navbar when page is scrolled
    document.addEventListener('scroll', navbarShrink);

    // Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
      new bootstrap.ScrollSpy(document.body, {
        target: '#mainNav',
        rootMargin: '0px 0px -40%',
      });
    }

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = Array.from(
      document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map((responsiveNavItem) => {
      responsiveNavItem.addEventListener('click', () => {
        if (navbarToggler && window.getComputedStyle(navbarToggler).display !== 'none') {
          navbarToggler?.dispatchEvent(new Event('click'));
        }
      });
    });

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

    // Redirigir al usuario si ya está autenticado
    if (this.authService.isLoggedIn()) {
      const token = this.authService.getToken();
      const user = token ? this.parseJwt(token) : null;
      if (user.ispaid) {
        this.router.navigate(['/userpremium']);
      } else {
        this.router.navigate(['/user']);
      }
    }
  }

  onLogin(): void {
    this.loginErrorU = false;
    this.loginErrorP = false;

    this.authService.login(this.loginData).subscribe(
      (response: any) => {
        if (response.token) {
          this.authService.setToken(response.token);
          const user = this.parseJwt(response.token);
          if (user.ispaid) {
            this.router.navigate(['/userpremium']);
          } else {
            this.router.navigate(['/user']);
          }
          Swal.fire({
            position: 'bottom-end',
            icon: 'success',
            title: 'Success',
            text: 'Login successful!',
            showConfirmButton: false,
            timer: 3000,
            toast: true
          });
          this.closeModal();
        } else {
          this.loginErrorU = true;
          this.loginErrorP = true;
          this.clearLoginData();
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
        if (error.status === 404) {
          this.loginErrorU = true;
          this.clearLoginData();
          Swal.fire({
            position: 'bottom-end',
            icon: 'error',
            title: 'Error',
            text: 'Username not found',
            showConfirmButton: false,
            timer: 3000,
            toast: true
          });
        } else if (error.status === 401) {
          this.loginErrorP = true;
          this.loginData.password = '';
          Swal.fire({
            position: 'bottom-end',
            icon: 'error',
            title: 'Error',
            text: 'Incorrect password',
            showConfirmButton: false,
            timer: 3000,
            toast: true
          });
        } else {
          Swal.fire({
            position: 'bottom-end',
            icon: 'error',
            title: 'Error',
            text: 'Login error: ' + error.message,
            showConfirmButton: false,
            timer: 3000,
            toast: true
          });
        }
      }
    );
  }

  clearLoginData(): void {
    this.loginData.username = '';
    this.loginData.password = '';
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
          this.authService.setToken(response.token);
          const user = this.parseJwt(response.token);
          if (user.ispaid) {
            this.router.navigate(['/userpremium']);
          } else {
            this.router.navigate(['/user']);
          }
          Swal.fire({
            position: 'bottom-end',
            icon: 'success',
            title: 'Success',
            text: 'User registered successfully',
            showConfirmButton: false,
            timer: 3000,
            toast: true
          });
          this.closeModal();
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

  onForgotPassword(): void {
    this.authService.forgotPassword(this.forgotPasswordData.username).subscribe(
      (response: any) => {
        Swal.fire({
          position: 'bottom-end',
          icon: 'success',
          title: 'Password reset email sent!',
          showConfirmButton: false,
          timer: 3000,
          toast: true
        });
        const modalElement = document.getElementById('forgotPasswordModal');
        if (modalElement) {
          const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
          modal.hide();
        }
        this.forgotPasswordData.username = '';
      },
      (error) => {
        Swal.fire({
          position: 'bottom-end',
          icon: 'error',
          title: 'Error',
          text: error.error.message || 'An error occurred while resetting the password',
          showConfirmButton: false,
          timer: 3000,
          toast: true
        });
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
    this.loginErrorU = false;
    this.loginErrorP = false;
    this.usernameExists = false;
    this.emailExists = false;
    this.passwordMismatch = false;
  }

  parseJwt(token: string): any {
    if (!token) {
      return null;
    }
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  }

  closeModal(): void {
    const modalElement = document.getElementById('authModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
      modal.hide();
    }
  }
}