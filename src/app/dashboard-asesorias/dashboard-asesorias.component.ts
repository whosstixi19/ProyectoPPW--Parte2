import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-asesorias',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './dashboard-asesorias.component.html',
  styleUrls: ['./dashboard-asesorias.component.scss']
})
export class DashboardAsesoriasComponent {
  // Variables para almacenar la disponibilidad
  diasDisponibles: string = '';
  horariosDisponibles: string = '';
  modalidad: string = 'presencial';

  // Método para registrar la disponibilidad
  registrarDisponibilidad() {
    // Lógica para enviar la disponibilidad al backend
    console.log('Disponibilidad registrada:', {
      dias: this.diasDisponibles,
      horarios: this.horariosDisponibles,
      modalidad: this.modalidad
    });
  }
}