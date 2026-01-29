package ec.edu.ups.Services;

import java.net.URI;
import java.util.List;
import ec.edu.ups.model.Proyecto;
import ec.edu.ups.bussiness.GestionProyectos;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;

@Path("proyecto")
public class ProyectoService {
	
	@Inject
	private GestionProyectos gp;
	
	@GET
	@Produces("application/json")
	public Response getListaProyectos(){
		List<Proyecto> listado = gp.getProyecto();
		return Response.ok(listado).build();
	}
	
	@GET
	@Path("/{id}")
	@Produces("application/json")
	public Response getProyecto(@PathParam("id") String id) {
		Proyecto p;
		try {
			p = gp.getProyecto(id);
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
					"Proyecto con ID " + id + " no encontrado");
			return Response.status(Response.Status.NOT_FOUND).entity(error).build();
		}
		
		return Response.ok(p).build();
	}
	
	@POST
	@Consumes("application/json")
	@Produces("application/json")
	public Response createProyecto(Proyecto proyecto, @Context UriInfo uriInfo) {	
		
		try {
			gp.crearProyecto(proyecto);
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
				.path(proyecto.getId())
				.build();
		return Response.created(location)
				.entity(proyecto)
				.build();
	}
	
	@PUT
	@Path("/{id}")
	@Consumes("application/json")
	@Produces("application/json")
	public Response updateProyecto(@PathParam("id") String id, Proyecto proyecto, @Context UriInfo uriInfo) {
		try {
			if(!id.equals(proyecto.getId())) {
				Error error = new Error(
						400,
						"Datos incorrectos",
						"El ID no coincide con el parámetro");
				return Response.status(Response.Status.BAD_REQUEST)
						.entity(error).build();
			}
			Proyecto p = gp.getProyecto(id);

			if(p == null) {
				Error error = new Error(
						404,
						"No encontrado",
						"Proyecto con ID " + id + " no existe");
				return Response.status(Response.Status.NOT_FOUND)
						.entity(error).build();
			}

			gp.actualizarProyecto(proyecto);

		} catch(Exception e) {
			e.printStackTrace();
			Error error = new Error(
					500,
					"Error interno",
					e.getMessage());
			return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
					.entity(error).build();
		}

		return Response.ok(proyecto).build();
	}
}
