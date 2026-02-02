package ec.edu.ups.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "ausencias")
public class Ausencia {

    @Id
    @Column(name = "id")
    private String id;

    @Column(name = "fecha")
    private String fecha;

    @Column(name = "hora_inicio")
    private String horaInicio;

    @Column(name = "hora_fin")
    private String horaFin;

    @Column(name = "motivo")
    private String motivo;

    @Column(name = "programador_uid")
    private String programadorUid;

    public Ausencia() {
    }

    public Ausencia(String id, String fecha, String horaInicio, String horaFin, String motivo) {
        this.id = id;
        this.fecha = fecha;
        this.horaInicio = horaInicio;
        this.horaFin = horaFin;
        this.motivo = motivo;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFecha() {
        return fecha;
    }

    public void setFecha(String fecha) {
        this.fecha = fecha;
    }

    public String getHoraInicio() {
        return horaInicio;
    }

    public void setHoraInicio(String horaInicio) {
        this.horaInicio = horaInicio;
    }

    public String getHoraFin() {
        return horaFin;
    }

    public void setHoraFin(String horaFin) {
        this.horaFin = horaFin;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }

    public String getProgramadorUid() {
        return programadorUid;
    }

    public void setProgramadorUid(String programadorUid) {
        this.programadorUid = programadorUid;
    }
}
