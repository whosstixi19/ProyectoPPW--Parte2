package ec.edu.ups.Services;

import java.net.URI;
import java.util.List;
import ec.edu.ups.model.*;
import ec.edu.ups.bussiness.GestionPersonas;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;

@Path("persona")
public class PersonaService {

	@Inject
	private GestionPersonas gp;

	@GET
	@Produces("application/json")
	public Response getListaPersonas(){	
	List<Persona> listado = gp.getPersona();
	    return Response.ok(listado).build();  //status code 200
	}


	@GET
	@Path("/{id}")
	@Produces("application/json")
	public Response getPersona(@PathParam("id") String cedula) {
	    Persona p;
	    try {
	        p = gp.getPersona(cedula);
	    }
	    catch(Exception e){
	        e.printStackTrace();
	        Error error = new Error(
	                500,
	                "Error interno",
	                e.getMessage());
	        return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(error).build()	;
	        }
	    
	    if(p== null) {
	        Error error = new Error(
	                404,
	                "No encontrado",
	                "Persona con ID "+cedula+" no encuentrada");
	            
	        return Response.status(Response.Status.NOT_FOUND).entity(error).build();
	    }
	    
	    return Response.ok(p).build();
	}

	@POST
	@Consumes("application/json")
	@Produces("application/json")
	public Response createPersona(Persona persona, @Context UriInfo uriInfo) {	
	    
	    try {
	        gp.crearPersona(persona);
	    }
	    catch(Exception e){
	        e.printStackTrace();
	        Error error = new Error(
	                500,
	                "Error interno",
	                e.getMessage());
	        return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(error).build()	;
	        }
	    
	    URI location = uriInfo.getAbsolutePathBuilder()
	            .path(persona.getCedula())
	            .build();
	    return Response.created(location)
	            .entity(persona)
	            .build();
	}

	@PUT
	@Path("/{id}")
	@Consumes("application/json")
	@Produces("application/json")
	public Response updatePersona(@PathParam("id") String id, Persona persona, @Context UriInfo uriInfo) {
	    try {
	         if(!id.equals(persona.getCedula())) {
	                Error error = new Error(
	                        400,
	                        "Datos incorrectos",
	                        "La cédula no coincide con el parámetro");
	                return Response.status(Response.Status.BAD_REQUEST)
	                        .entity(error).build();
	            }
	         Persona p = gp.getPersona(id);

	            if(p == null) {
	                Error error = new Error(
	                        404,
	                        "No encontrado",
	                        "Persona con ID " + id + " no existe");
	                return Response.status(Response.Status.NOT_FOUND)
	                        .entity(error).build();
	            }

	            gp.actualizarPersona(persona);

	        } catch(Exception e) {
	            e.printStackTrace();
	            Error error = new Error(
	                    500,
	                    "Error interno",
	                    e.getMessage());
	            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
	                    .entity(error).build();
	        }

	        return Response.ok(persona).build();
	    
	}
}
