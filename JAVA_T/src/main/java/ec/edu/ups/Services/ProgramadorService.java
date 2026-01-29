package ec.edu.ups.Services;

import java.net.URI;
import java.util.List;
import ec.edu.ups.model.Programador;
import ec.edu.ups.bussiness.GestionProgramadores;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;

@Path("programador")
public class ProgramadorService {
	
	@Inject
	private GestionProgramadores gp;
	
	@GET
	@Produces("application/json")
	public Response getListaProgramadores(){
		List<Programador> listado = gp.getProgramador();
		return Response.ok(listado).build();
	}
	
	@GET
	@Path("/{id}")
	@Produces("application/json")
	public Response getProgramador(@PathParam("id") String uid) {
		Programador p;
		try {
			p = gp.getProgramador(uid);
		}
		catch(Exception e){
			e.printStackTrace();
			Error error = new Error(
					500,
					"Error interno",
					e.getMessage());
			return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(error).build();
		}
		
		if(p == null) {
			Error error = new Error(
					404,
					"No encontrado",
					"Programador con ID " + uid + " no encontrado");
			return Response.status(Response.Status.NOT_FOUND).entity(error).build();
		}
		
		return Response.ok(p).build();
	}
	
	@POST
	@Consumes("application/json")
	@Produces("application/json")
	public Response createProgramador(Programador programador, @Context UriInfo uriInfo) {	
		
		try {
			gp.crearProgramador(programador);
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
				.path(programador.getUid())
				.build();
		return Response.created(location)
				.entity(programador)
				.build();
	}
	
	@PUT
	@Path("/{id}")
	@Consumes("application/json")
	@Produces("application/json")
	public Response updateProgramador(@PathParam("id") String id, Programador programador, @Context UriInfo uriInfo) {
		try {
			if(!id.equals(programador.getUid())) {
				Error error = new Error(
						400,
						"Datos incorrectos",
						"El UID no coincide con el parámetro");
				return Response.status(Response.Status.BAD_REQUEST)
						.entity(error).build();
			}
			Programador p = gp.getProgramador(id);

			if(p == null) {
				Error error = new Error(
						404,
						"No encontrado",
						"Programador con ID " + id + " no existe");
				return Response.status(Response.Status.NOT_FOUND)
						.entity(error).build();
			}

			gp.actualizarProgramador(programador);

		} catch(Exception e) {
			e.printStackTrace();
			Error error = new Error(
					500,
					"Error interno",
					e.getMessage());
			return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
					.entity(error).build();
		}

		return Response.ok(programador).build();
	}
}
