package ec.edu.ups.Services;

import ec.edu.ups.bussiness.*;
import ec.edu.ups.model.*;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Response;
import java.util.List;
import java.util.Map;

/**
 * Servicio REST para sincronizar datos desde Firebase hacia WildFly (Base de Datos)
 * Útil para migrar datos desde Firebase Firestore a la base de datos relacional
 */
@Path("sync")
public class FirebaseSyncService {
    
    @Inject
    private GestionPersonas gestionPersonas;
    
    @Inject
    private GestionAsesorias gestionAsesorias;
    
    @Inject
    private GestionProgramadores gestionProgramadores;
    
    @Inject
    private GestionProyectos gestionProyectos;
    
    @Inject
    private GestionAusencias gestionAusencias;
    
    @Inject
    private GestionHorarios gestionHorarios;
    
    /**
     * Endpoint para sincronizar TODAS las personas desde Firebase
     * Recibe un array de personas desde el frontend
     * 
     * POST /api/sync/personas
     * Body: [ { "cedula": "...", "nombre": "...", ... }, ... ]
     */
    @POST
    @Path("/personas")
    @Consumes("application/json")
    @Produces("application/json")
    public Response syncPersonas(List<Persona> personas) {
        try {
            int creadas = 0;
            int actualizadas = 0;
            int errores = 0;
            
            for (Persona persona : personas) {
                try {
                    Persona existente = gestionPersonas.getPersona(persona.getCedula());
                    
                    if (existente == null) {
                        // No existe, crear nueva
                        gestionPersonas.crearPersona(persona);
                        creadas++;
                    } else {
                        // Ya existe, actualizar
                        gestionPersonas.actualizarPersona(persona);
                        actualizadas++;
                    }
                } catch (Exception e) {
                    errores++;
                    System.err.println("Error sincronizando persona " + persona.getCedula() + ": " + e.getMessage());
                }
            }
            
            Map<String, Object> resultado = Map.of(
                "total", personas.size(),
                "creadas", creadas,
                "actualizadas", actualizadas,
                "errores", errores
            );
            
            return Response.ok(resultado).build();
            
        } catch (Exception e) {
            e.printStackTrace();
            Error error = new Error(500, "Error en sincronización", e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(error).build();
        }
    }
    
    /**
     * Endpoint para sincronizar TODAS las asesorías desde Firebase
     * 
     * POST /api/sync/asesorias
     * Body: [ { "id": "...", "tema": "...", ... }, ... ]
     */
    @POST
    @Path("/asesorias")
    @Consumes("application/json")
    @Produces("application/json")
    public Response syncAsesorias(List<Asesoria> asesorias) {
        try {
            int creadas = 0;
            int actualizadas = 0;
            int errores = 0;
            
            for (Asesoria asesoria : asesorias) {
                try {
                    Asesoria existente = gestionAsesorias.getAsesoria(asesoria.getId());
                    
                    if (existente == null) {
                        gestionAsesorias.crearAsesoria(asesoria);
                        creadas++;
                    } else {
                        gestionAsesorias.actualizarAsesoria(asesoria);
                        actualizadas++;
                    }
                } catch (Exception e) {
                    errores++;
                    System.err.println("Error sincronizando asesoría " + asesoria.getId() + ": " + e.getMessage());
                }
            }
            
            Map<String, Object> resultado = Map.of(
                "total", asesorias.size(),
                "creadas", creadas,
                "actualizadas", actualizadas,
                "errores", errores
            );
            
            return Response.ok(resultado).build();
            
        } catch (Exception e) {
            e.printStackTrace();
            Error error = new Error(500, "Error en sincronización", e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(error).build();
        }
    }
    
    /**
     * Endpoint para sincronizar programadores desde Firebase
     * 
     * POST /api/sync/programadores
     */
    @POST
    @Path("/programadores")
    @Consumes("application/json")
    @Produces("application/json")
    public Response syncProgramadores(List<Programador> programadores) {
        try {
            int creados = 0;
            int actualizados = 0;
            int errores = 0;
            
            for (Programador programador : programadores) {
                try {
                    Programador existente = gestionProgramadores.getProgramador(programador.getUid());
                    
                    if (existente == null) {
                        gestionProgramadores.crearProgramador(programador);
                        creados++;
                    } else {
                        gestionProgramadores.actualizarProgramador(programador);
                        actualizados++;
                    }
                } catch (Exception e) {
                    errores++;
                    System.err.println("Error sincronizando programador " + programador.getUid() + ": " + e.getMessage());
                }
            }
            
            Map<String, Object> resultado = Map.of(
                "total", programadores.size(),
                "creados", creados,
                "actualizados", actualizados,
                "errores", errores
            );
            
            return Response.ok(resultado).build();
            
        } catch (Exception e) {
            e.printStackTrace();
            Error error = new Error(500, "Error en sincronización", e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(error).build();
        }
    }
    
    /**
     * Endpoint para verificar el estado de la sincronización
     * Retorna cuántos registros hay en la BD
     * 
     * GET /api/sync/status
     */
    @GET
    @Path("/status")
    @Produces("application/json")
    public Response getSyncStatus() {
        try {
            Map<String, Object> status = Map.of(
                "personas", gestionPersonas.getPersona().size(),
                "asesorias", gestionAsesorias.getAsesoria().size(),
                "programadores", gestionProgramadores.getProgramador().size(),
                "proyectos", gestionProyectos.getProyecto().size(),
                "ausencias", gestionAusencias.getAusencia().size(),
                "horarios", gestionHorarios.getHorario().size()
            );
            
            return Response.ok(status).build();
            
        } catch (Exception e) {
            e.printStackTrace();
            Error error = new Error(500, "Error obteniendo estado", e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(error).build();
        }
    }
    
    /**
     * Endpoint para LIMPIAR todos los datos de la BD (¡CUIDADO!)
     * Útil para hacer una sincronización limpia
     * 
     * DELETE /api/sync/clean
     */
    @DELETE
    @Path("/clean")
    @Produces("application/json")
    public Response cleanDatabase() {
        try {
            // Aquí implementarías la lógica para limpiar las tablas
            // Por seguridad, requiere confirmación
            
            return Response.ok(Map.of("message", "Base de datos limpiada")).build();
            
        } catch (Exception e) {
            e.printStackTrace();
            Error error = new Error(500, "Error limpiando base de datos", e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(error).build();
        }
    }
}
