package ec.edu.ups.Services;

import java.net.URI;
import java.util.List;
import ec.edu.ups.model.Ausencia;
import ec.edu.ups.bussiness.GestionAusencias;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;

@Path("ausencia")
public class AusenciaService {
	
	@Inject
	private GestionAusencias ga;
	
	@GET
	@Produces("application/json")
	public Response getListaAusencias(){
		List<Ausencia> listado = ga.getAusencia();
		return Response.ok(listado).build();
	}
	
	@GET
	@Path("/{id}")
	@Produces("application/json")
	public Response getAusencia(@PathParam("id") String id) {
		Ausencia a;
		try {
			a = ga.getAusencia(id);
		}
		catch(Exception e){
			e.printStackTrace();
			Error error = new Error(
					500,
					"Error interno",
					e.getMessage());
			return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(error).build();
		}
		
		if(a == null) {
			Error error = new Error(
					404,
					"No encontrado",
					"Ausencia con ID " + id + " no encontrada");
			return Response.status(Response.Status.NOT_FOUND).entity(error).build();
		}
		
		return Response.ok(a).build();
	}
	
	@POST
	@Consumes("application/json")
	@Produces("application/json")
	public Response createAusencia(Ausencia ausencia, @Context UriInfo uriInfo) {	
		
		try {
			ga.crearAusencia(ausencia);
		}
		catch(Exception e){
			e.printStackTrace();
			Error error = new Error(
					500,
					"Error interno",
					e.getMessage());
			return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(error).build();
		}
		
		URI location = uriInfo.getAbsolutePathBuilder()
				.path(ausencia.getId())
				.build();
		return Response.created(location)
				.entity(ausencia)
				.build();
	}
	
	@PUT
	@Path("/{id}")
	@Consumes("application/json")
	@Produces("application/json")
	public Response updateAusencia(@PathParam("id") String id, Ausencia ausencia, @Context UriInfo uriInfo) {
		try {
			if(!id.equals(ausencia.getId())) {
				Error error = new Error(
						400,
						"Datos incorrectos",
						"El ID no coincide con el parámetro");
				return Response.status(Response.Status.BAD_REQUEST)
						.entity(error).build();
			}
			Ausencia a = ga.getAusencia(id);

			if(a == null) {
				Error error = new Error(
						404,
						"No encontrado",
						"Ausencia con ID " + id + " no existe");
				return Response.status(Response.Status.NOT_FOUND)
						.entity(error).build();
			}

			ga.actualizarAusencia(ausencia);

		} catch(Exception e) {
			e.printStackTrace();
			Error error = new Error(
					500,
					"Error interno",
					e.getMessage());
			return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
					.entity(error).build();
		}

		return Response.ok(ausencia).build();
	}
}
