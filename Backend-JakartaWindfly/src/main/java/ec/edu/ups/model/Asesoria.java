package ec.edu.ups.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "asesorias")
public class Asesoria {

    @Id
    @Column(name = "id")
    private String id;

    @Column(name = "usuario_uid")
    private String usuarioUid;

    @Column(name = "usuario_nombre")
    private String usuarioNombre;

    @Column(name = "usuario_email")
    private String usuarioEmail;

    @Column(name = "programador_uid")
    private String programadorUid;

    @Column(name = "programador_nombre")
    private String programadorNombre;

    @Column(name = "tema")
    private String tema;

    @Column(name = "descripcion")
    private String descripcion;

    @Column(name = "fecha_solicitada")
    private String fechaSolicitada;

    @Column(name = "hora_solicitada")
    private String horaSolicitada;

    @Column(name = "estado")
    private String estado;

    @Column(name = "respuesta")
    private String respuesta;

    public Asesoria() {
    }

    public Asesoria(String id, String usuarioUid, String usuarioNombre, String usuarioEmail,
                    String programadorUid, String programadorNombre, String tema, String descripcion,
                    String fechaSolicitada, String horaSolicitada, String estado) {
        this.id = id;
        this.usuarioUid = usuarioUid;
        this.usuarioNombre = usuarioNombre;
        this.usuarioEmail = usuarioEmail;
        this.programadorUid = programadorUid;
        this.programadorNombre = programadorNombre;
        this.tema = tema;
        this.descripcion = descripcion;
        this.fechaSolicitada = fechaSolicitada;
        this.horaSolicitada = horaSolicitada;
        this.estado = estado;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUsuarioUid() {
        return usuarioUid;
    }

    public void setUsuarioUid(String usuarioUid) {
        this.usuarioUid = usuarioUid;
    }

    public String getUsuarioNombre() {
        return usuarioNombre;
    }

    public void setUsuarioNombre(String usuarioNombre) {
        this.usuarioNombre = usuarioNombre;
    }

    public String getUsuarioEmail() {
        return usuarioEmail;
    }

    public void setUsuarioEmail(String usuarioEmail) {
        this.usuarioEmail = usuarioEmail;
    }

    public String getProgramadorUid() {
        return programadorUid;
    }

    public void setProgramadorUid(String programadorUid) {
        this.programadorUid = programadorUid;
    }

    public String getProgramadorNombre() {
        return programadorNombre;
    }

    public void setProgramadorNombre(String programadorNombre) {
        this.programadorNombre = programadorNombre;
    }

    public String getTema() {
        return tema;
    }

    public void setTema(String tema) {
        this.tema = tema;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getFechaSolicitada() {
        return fechaSolicitada;
    }

    public void setFechaSolicitada(String fechaSolicitada) {
        this.fechaSolicitada = fechaSolicitada;
    }

    public String getHoraSolicitada() {
        return horaSolicitada;
    }

    public void setHoraSolicitada(String horaSolicitada) {
        this.horaSolicitada = horaSolicitada;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getRespuesta() {
        return respuesta;
    }

    public void setRespuesta(String respuesta) {
        this.respuesta = respuesta;
    }
}
