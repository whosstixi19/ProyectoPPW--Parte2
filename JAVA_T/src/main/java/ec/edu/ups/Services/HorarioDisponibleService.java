package ec.edu.ups.Services;

import java.net.URI;
import java.util.List;
import ec.edu.ups.model.HorarioDisponible;
import ec.edu.ups.bussiness.GestionHorarios;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;

@Path("horario")
public class HorarioDisponibleService {
	
	@Inject
	private GestionHorarios gh;
	
	@GET
	@Produces("application/json")
	public Response getListaHorarios(){
		List<HorarioDisponible> listado = gh.getHorario();
		return Response.ok(listado).build();
	}
	
	@GET
	@Path("/{id}")
	@Produces("application/json")
	public Response getHorario(@PathParam("id") Long id) {
		HorarioDisponible h;
		try {
			h = gh.getHorario(id);
		}
		catch(Exception e){
			e.printStackTrace();
			Error error = new Error(
					500,
					"Error interno",
					e.getMessage());
			return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(error).build();
		}
		
		if(h == null) {
			Error error = new Error(
					404,
					"No encontrado",
					"Horario con ID " + id + " no encontrado");
			return Response.status(Response.Status.NOT_FOUND).entity(error).build();
		}
		
		return Response.ok(h).build();
	}
	
	@POST
	@Consumes("application/json")
	@Produces("application/json")
	public Response createHorario(HorarioDisponible horario, @Context UriInfo uriInfo) {	
		
		try {
			gh.crearHorario(horario);
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
				.path(String.valueOf(horario.getId()))
				.build();
		return Response.created(location)
				.entity(horario)
				.build();
	}
	
	@PUT
	@Path("/{id}")
	@Consumes("application/json")
	@Produces("application/json")
	public Response updateHorario(@PathParam("id") Long id, HorarioDisponible horario, @Context UriInfo uriInfo) {
		try {
			if(horario.getId() != null && !id.equals(horario.getId())) {
				Error error = new Error(
						400,
						"Datos incorrectos",
						"El ID no coincide con el parámetro");
				return Response.status(Response.Status.BAD_REQUEST)
						.entity(error).build();
			}
			HorarioDisponible h = gh.getHorario(id);

			if(h == null) {
				Error error = new Error(
						404,
						"No encontrado",
						"Horario con ID " + id + " no existe");
				return Response.status(Response.Status.NOT_FOUND)
						.entity(error).build();
			}

			horario.setId(id);
			gh.actualizarHorario(horario);

		} catch(Exception e) {
			e.printStackTrace();
			Error error = new Error(
					500,
					"Error interno",
					e.getMessage());
			return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
					.entity(error).build();
		}

		return Response.ok(horario).build();
	}
}
