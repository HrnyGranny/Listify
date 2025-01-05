import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket!: WebSocket | null;
  private messageSubject: BehaviorSubject<any> = new BehaviorSubject(null);
  private isConnected: boolean = false;

  constructor() {
    this.connect();
  }

  // Conectar al WebSocket y manejar la conexión
  private connect(): void {
    if (this.socket && this.isConnected) {
      console.warn('Ya existe una conexión activa de WebSocket.');
      return;
    }

    this.socket = new WebSocket('ws://localhost:3000');

    // Manejar eventos de apertura
    this.socket.onopen = () => {
      console.log('Conexión WebSocket abierta.');
      this.isConnected = true;
    };

    // Manejar eventos de mensaje
    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Mensaje WebSocket recibido:', data);
      this.messageSubject.next(data); // Emitir los datos a los observadores
    };

    // Manejar errores de conexión
    this.socket.onerror = (error) => {
      console.error('Error en la conexión WebSocket:', error);
    };

    // Reconectar si se pierde la conexión
    this.socket.onclose = () => {
      console.log('Conexión WebSocket cerrada. Intentando reconectar...');
      this.isConnected = false;
      setTimeout(() => this.connect(), 1000); // Intentar reconectar después de 1 segundo
    };
  }

  // Obtener los mensajes recibidos como un observable
  getMessages() {
    return this.messageSubject.asObservable();
  }

  // Enviar mensajes al servidor y desconectar inmediatamente después de enviar
  sendMessage(message: any): void {
    // Conectar si no está conectado
    if (!this.isConnected) {
      this.connect();
    }

    // Asegurarse de que la conexión esté abierta antes de enviar el mensaje
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
      console.log('Mensaje enviado:', message);
      
    } else {
      console.error('No se puede enviar el mensaje. WebSocket no está abierto.');
    }
  }

  // Cerrar la conexión cuando ya no se necesite
  disconnect(): void {
    if (this.socket) {
      console.log('Desconectando WebSocket.');
      this.socket.close();
      this.isConnected = false;
    }
  }
}
