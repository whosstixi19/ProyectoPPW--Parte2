import { Component, OnInit, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-whatsapp-setup-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './whatsapp-setup-modal.html',
  styleUrls: ['./whatsapp-setup-modal.scss']
})
export class WhatsappSetupModalComponent implements OnInit {
  userRole = input.required<'usuario' | 'programador'>();
  onClose = output<void>();
  onSave = output<string>();
  onPostpone = output<void>();

  telefono = '';
  telefonoValido = false;
  mostrarError = false;
  mensajeError = '';

  readonly TWILIO_NUMBER = '+1 415 523 8886';
  readonly JOIN_MESSAGE = 'join chosen-length';

  ngOnInit() {}

  validarTelefono() {
    this.mostrarError = false;
    this.mensajeError = '';
    
    if (!this.telefono.trim()) {
      this.telefonoValido = false;
      return;
    }

    // Limpiar el número (quitar espacios, guiones, paréntesis)
    let numeroLimpio = this.telefono.replace(/[\s\-()]/g, '');

    // Si empieza con 0, es formato local ecuatoriano
    if (numeroLimpio.startsWith('0')) {
      numeroLimpio = '+593' + numeroLimpio.substring(1);
    }
    // Si no tiene +, agregar +593 (asumiendo Ecuador)
    else if (!numeroLimpio.startsWith('+')) {
      if (numeroLimpio.length === 9) {
        numeroLimpio = '+593' + numeroLimpio;
      } else {
        this.mostrarError = true;
        this.mensajeError = 'Formato inválido. Use: 0987654321 o 987654321';
        this.telefonoValido = false;
        return;
      }
    }

    // Validar que tenga un formato correcto
    const regexTelefono = /^\+\d{10,15}$/;
    if (regexTelefono.test(numeroLimpio)) {
      this.telefono = numeroLimpio;
      this.telefonoValido = true;
    } else {
      this.mostrarError = true;
      this.mensajeError = 'Número inválido. Debe tener entre 10 y 15 dígitos';
      this.telefonoValido = false;
    }
  }

  copiarNumero() {
    navigator.clipboard.writeText(this.TWILIO_NUMBER);
    alert('📋 Número copiado al portapapeles');
  }

  copiarMensaje() {
    navigator.clipboard.writeText(this.JOIN_MESSAGE);
    alert('📋 Mensaje copiado al portapapeles');
  }

  agregarMasTarde() {
    this.onPostpone.emit();
  }

  agregarTelefono() {
    if (this.telefonoValido) {
      this.onSave.emit(this.telefono);
    }
  }

  cerrar() {
    this.onClose.emit();
  }
}
