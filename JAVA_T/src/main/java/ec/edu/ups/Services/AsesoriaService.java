package ec.edu.ups.Services;

import java.net.URI;
import java.util.List;
import ec.edu.ups.model.Asesoria;
import ec.edu.ups.bussiness.GestionAsesorias;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;

@Path("asesoria")
public class AsesoriaService {
	
	@Inject
	private GestionAsesorias ga;
	
	@GET
	@Produces("application/json")
	public Response getListaAsesorias(){
		List<Asesoria> listado = ga.getAsesoria();
		return Response.ok(listado).build();
	}
	
	@GET
	@Path("/{id}")
	@Produces("application/json")
	public Response getAsesoria(@PathParam("id") String id) {
		Asesoria a;
		try {
			a = ga.getAsesoria(id);
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
					"Asesoría con ID " + id + " no encontrada");
			return Response.status(Response.Status.NOT_FOUND).entity(error).build();
		}
		
		return Response.ok(a).build();
	}
	
	@POST
	@Consumes("application/json")
	@Produces("application/json")
	public Response createAsesoria(Asesoria asesoria, @Context UriInfo uriInfo) {	
		
		try {
			ga.crearAsesoria(asesoria);
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
				.path(asesoria.getId())
				.build();
		return Response.created(location)
				.entity(asesoria)
				.build();
	}
	
	@PUT
	@Path("/{id}")
	@Consumes("application/json")
	@Produces("application/json")
	public Response updateAsesoria(@PathParam("id") String id, Asesoria asesoria, @Context UriInfo uriInfo) {
		try {
			if(!id.equals(asesoria.getId())) {
				Error error = new Error(
						400,
						"Datos incorrectos",
						"El ID no coincide con el parámetro");
				return Response.status(Response.Status.BAD_REQUEST)
						.entity(error).build();
			}
			Asesoria a = ga.getAsesoria(id);

			if(a == null) {
				Error error = new Error(
						404,
						"No encontrado",
						"Asesoría con ID " + id + " no existe");
				return Response.status(Response.Status.NOT_FOUND)
						.entity(error).build();
			}

			ga.actualizarAsesoria(asesoria);

		} catch(Exception e) {
			e.printStackTrace();
			Error error = new Error(
					500,
					"Error interno",
					e.getMessage());
			return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
					.entity(error).build();
		}

		return Response.ok(asesoria).build();
	}
}
