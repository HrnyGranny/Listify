import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ListService } from '../../services/list.services';
import { WebSocketService } from '../../services/websocket.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { List, ListItem } from '../../models/list.model';
import * as bootstrap from 'bootstrap';
import Swal from 'sweetalert2';
import { loadScript } from '@paypal/paypal-js';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  userLists: List[] = [];
  sharedLists: List[] = [];
  filteredUserLists: List[] = [];
  filteredSharedLists: List[] = [];
  selectedList: List | null = null;
  username: string = '';
  userListsExpanded: boolean = false;
  sharedListsExpanded: boolean = false;
  searchTerm: string = '';
  newListName: string = '';
  shareWithUsername: string = '';
  newItemName: string = '';
  newItemAmountInitial: number = 1;
  shareLink: string = '';
  currentPassword: string = '';
  newPassword: string = '';
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private authService: AuthService,
    private listService: ListService,
    private webSocketService: WebSocketService
  ) {}

  ngOnInit(): void {
    this.username = this.authService.getUsername();
    this.loadLists();
    this.webSocketService.getMessages()
      .pipe(takeUntil(this.destroy$)) // Se asegura de desuscribirse al destruir el componente
      .subscribe((data) => this.handleWebSocketMessage(data));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete(); // Libera los recursos para evitar fugas de memoria
  }

  loadLists(): void {
    this.listService.getLists().subscribe((lists: List[]) => {
      this.userLists = lists.filter(list => list.owner === this.username);
      this.sharedLists = lists.filter(list => list.share.includes(this.username));
      this.filteredUserLists = this.userLists;
      this.filteredSharedLists = this.sharedLists;
    });
  }

  updateSelectedList(content: ListItem[]): void {
    if (this.selectedList) {
      this.selectedList.content = [...content];
    }
  }

  handleWebSocketMessage(data: any): void {
    if (!data) return;

    console.log('Mensaje WebSocket manejado:', data);

    switch (data.type) {
      case 'list_updated':
        if (this.selectedList && this.selectedList._id === data.listId) {
          this.updateSelectedList(data.content);
        }
        break;
    }
  }

  navigateToLanding(): void {
    this.router.navigate(['/landing']);
  }

  upgradeToPremium(): void {
    const modalElement = document.getElementById('paymentModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  
    // Verificar si el botón de PayPal ya está renderizado
    const paypalButtonContainer = document.getElementById('paypal-button-container');
    if (paypalButtonContainer && paypalButtonContainer.children.length === 0) {
      this.loadPayPalScript()
        .then((paypal: any) => {
          paypal.Buttons({
            createOrder: (data: any, actions: any) => {
              return actions.order.create({
                purchase_units: [{
                  amount: {
                    value: '3.00' // Monto a cobrar
                  }
                }]
              });
            },
            onApprove: (data: any, actions: any) => {
              return actions.order.capture().then((details: any) => {
                if (details.status === 'COMPLETED') {
                  Swal.fire({
                    position: 'bottom-end',
                    icon: 'success',
                    title: 'Payment successful!',
                    showConfirmButton: false,
                    timer: 3000,
                    toast: true
                  });
  
                  // Lógica de actualización de usuario
                  this.authService.upgradeToPremium().subscribe(() => {
                    console.log('User upgraded to premium');
                    this.router.navigate(['/userpremium']);
                  });
                } else {
                  Swal.fire({
                    position: 'bottom-end',
                    icon: 'error',
                    title: 'Payment not completed!',
                    showConfirmButton: false,
                    timer: 3000,
                    toast: true
                  });
                }
              });
            },
            onError: (err: any) => {
              console.error('Error during payment', err);
              Swal.fire({
                position: 'bottom-end',
                icon: 'error',
                title: 'Payment failed!',
                showConfirmButton: false,
                timer: 3000,
                toast: true
              });
            }
          }).render('#paypal-button-container');
        })
        .catch((err) => {
          console.error('Failed to load the PayPal JS SDK script', err);
        });
    }
  }

  private loadPayPalScript(): Promise<any> {
    return new Promise((resolve, reject) => {
      const existingScript = document.getElementById('paypal-sdk');
      if (!existingScript) {
        const script = document.createElement('script');
        script.id = 'paypal-sdk';
        script.src = 'https://www.paypal.com/sdk/js?client-id=AY5VuED4xcjYIhyUFkVWGR2bOuOlnfWY1KC4J61WU4iFOwQ54LFfdwh8lbe_7KQZEZVBgXlNl5dtGc03'; // Reemplaza con tu Client ID
        script.onload = () => resolve((window as any).paypal);
        script.onerror = (err) => reject(err);
        document.body.appendChild(script);
      } else {
        resolve((window as any).paypal);
      }
    });
  }


  changePassword(): void {
    const modalElement = document.getElementById('changePasswordModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  onChangePassword(): void {
    this.authService.changePassword(this.currentPassword, this.newPassword).subscribe(
      (response: any) => {
        Swal.fire({
          position: 'bottom-end',
          icon: 'success',
          title: 'Password changed successfully!',
          showConfirmButton: false,
          timer: 3000,
          toast: true
        });
        const modalElement = document.getElementById('changePasswordModal');
        if (modalElement) {
          const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
          modal.hide();
        }
        this.currentPassword = '';
        this.newPassword = '';
      },
      (error) => {
        Swal.fire({
          position: 'bottom-end',
          icon: 'error',
          title: 'Error',
          text: error.error.message || 'An error occurred while changing the password',
          showConfirmButton: false,
          timer: 3000,
          toast: true
        });
      }
    );
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/landing']);
  }

  selectList(list: List): void {
    this.selectedList = list;
  }

  deleteList(id: string): void {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      position: 'bottom-end',
      toast: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.listService.deleteList(id).subscribe(() => {
          this.loadLists();
          this.selectedList = null;
          Swal.fire({
            position: 'bottom-end',
            icon: 'success',
            title: 'List deleted successfully!',
            showConfirmButton: false,
            timer: 3000,
            toast: true
          });
        });
      }
    });
  }

  createList(): void {
    const newList: List = {
      _id: '',
      name: this.newListName,
      owner: this.username,
      content: [],
      share: []
    };
    this.listService.createList(newList).subscribe(() => {
      this.loadLists();
      this.newListName = '';
      const modalElement = document.getElementById('addListModal');
      if (modalElement) {
        const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
        modal.hide();
      }
      Swal.fire({
        position: 'bottom-end',
        icon: 'success',
        title: 'New list created successfully!',
        showConfirmButton: false,
        timer: 3000,
        toast: true
      });
    });
  }

  openAddItemModal(): void {
    const modalElement = document.getElementById('addItemModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  addItem(): void {
    if (this.selectedList) {
      const newItem: ListItem = {
        item: this.newItemName,
        amountInitial: this.newItemAmountInitial,
        amountFinal: this.newItemAmountInitial,
        checked: false
      };
      this.selectedList.content.push(newItem);
      this.updateListContent();
      this.newItemName = '';
      this.newItemAmountInitial = 1;
      const modalElement = document.getElementById('addItemModal');
      if (modalElement) {
        const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
        modal.hide();
      }
    }
  }

  removeItem(index: number): void {
    if (this.selectedList) {
      this.selectedList.content.splice(index, 1);
      this.updateListContent();
    }
  }

  updateItem(index: number): void {
    if (this.selectedList) {
      this.updateListContent();
    }
  }

  updateListContent(): void {
    if (this.selectedList) {
      this.listService.updateListContent(this.selectedList._id, this.selectedList.content).subscribe(
        () => {
          // Solo enviar el mensaje al WebSocket si la actualización fue exitosa
          this.webSocketService.sendMessage({
            type: 'list_updated',
            listId: this.selectedList?._id,
            content: this.selectedList?.content
          });
        },
        (error) => {
          console.error('Error al actualizar la lista:', error);
        }
      );
    }
  }
  

  shareList(): void {
    if (this.selectedList) {
      this.selectedList.share.push(this.shareWithUsername);
      this.listService.updateListShare(this.selectedList._id, this.selectedList.share).subscribe(() => {
        this.shareWithUsername = '';
        const modalElement = document.getElementById('shareListModal');
        if (modalElement) {
          const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
          modal.hide();
        }
        // Generar el enlace de registro con la lista compartida
        this.shareLink = `${window.location.origin}/register?listId=${this.selectedList?._id}`;
        Swal.fire({
          position: 'bottom-end',
          icon: 'success',
          title: 'List shared successfully!',
          showConfirmButton: false,
          timer: 3000,
          toast: true
        });
      });
    }
  }

  generateShareLink(): void {
    if (this.selectedList) {
      this.shareLink = `${window.location.origin}/register?listId=${this.selectedList._id}`;
    }
  }

  copyShareLink(): void {
    navigator.clipboard.writeText(this.shareLink).then(() => {
      Swal.fire({
        position: 'bottom-end',
        icon: 'success',
        title: 'Link copied to clipboard!',
        showConfirmButton: false,
        timer: 3000,
        toast: true
      });
    });
  }

  removeSharedUser(user: string): void {
    if (this.selectedList) {
      const index = this.selectedList.share.indexOf(user);
      if (index > -1) {
        this.selectedList.share.splice(index, 1);
        this.listService.updateListShare(this.selectedList._id, this.selectedList.share).subscribe(() => {
          if (this.selectedList) {
            this.updateSelectedList(this.selectedList.content);
          }
        });
      }
    }
  }

  filterLists(): void {
    const searchTermLower = this.searchTerm.toLowerCase();
    this.filteredUserLists = this.userLists.filter(list => list.name.toLowerCase().includes(searchTermLower));
    this.filteredSharedLists = this.sharedLists.filter(list => list.name.toLowerCase().includes(searchTermLower));
  }
}