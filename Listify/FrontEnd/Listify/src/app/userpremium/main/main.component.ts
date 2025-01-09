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
    const listToDelete = this.userLists.find(list => list._id === id) || this.sharedLists.find(list => list._id === id);
  
    if (listToDelete && listToDelete.owner !== this.username) {
      Swal.fire({
        position: 'bottom-end',
        icon: 'warning',
        title: 'Warning',
        text: 'Only the owner can delete this list',
        showConfirmButton: false,
        timer: 3000,
        toast: true
      });
      return;
    }
  
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
      if (this.shareWithUsername === this.selectedList.owner) {
        Swal.fire({
          position: 'bottom-end',
          icon: 'warning',
          title: 'Warning',
          text: 'You cannot share the list with the owner',
          showConfirmButton: false,
          timer: 3000,
          toast: true
        });
        return;
      }
  
      if (this.selectedList.share.includes(this.shareWithUsername)) {
        Swal.fire({
          position: 'bottom-end',
          icon: 'warning',
          title: 'Warning',
          text: 'This user is already shared with',
          showConfirmButton: false,
          timer: 3000,
          toast: true
        });
        return;
      }
  
      this.authService.checkUserExists(this.shareWithUsername).subscribe(
        (userExists: boolean) => {
          if (!userExists) {
            Swal.fire({
              position: 'bottom-end',
              icon: 'warning',
              title: 'Warning',
              text: 'This user does not exist',
              showConfirmButton: false,
              timer: 3000,
              toast: true
            });
            return;
          }
  
          if (this.selectedList) {
            this.selectedList.share.push(this.shareWithUsername);
          }
          this.listService.updateListShare(this.selectedList!._id, this.selectedList!.share).subscribe(() => {
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
        },
        () => {
          Swal.fire({
            position: 'bottom-end',
            icon: 'error',
            title: 'Error',
            text: 'An error occurred while checking the user',
            showConfirmButton: false,
            timer: 3000,
            toast: true
          });
        }
      );
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