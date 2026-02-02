package ec.edu.ups.bussiness;

import ec.edu.ups.DAO.ProyectoDAO;
import ec.edu.ups.model.Proyecto;
import jakarta.ejb.Stateless;
import jakarta.inject.Inject;

import java.util.List;

@Stateless
public class GestionProyectos {
	
	@Inject
	private ProyectoDAO daoProyecto;

	public List<Proyecto> getProyecto(){
		return daoProyecto.getAll();
	}
	
	public Proyecto getProyecto(String id) throws Exception {
		if(id.isEmpty())
			throw new Exception("Parámetro incorrecto");
		
		Proyecto p = daoProyecto.read(id);
		return p;
	}
	
	public void crearProyecto(Proyecto proyecto) throws Exception {
		if(proyecto.getId() == null || proyecto.getId().isEmpty())
			throw new Exception("ID requerido");
		
		daoProyecto.insert(proyecto);
	}
	
	public void actualizarProyecto(Proyecto proyecto) throws Exception {
	    if(proyecto.getId() == null || proyecto.getId().isEmpty())
	        throw new Exception("ID requerido");

	    daoProyecto.update(proyecto);
	}
}
