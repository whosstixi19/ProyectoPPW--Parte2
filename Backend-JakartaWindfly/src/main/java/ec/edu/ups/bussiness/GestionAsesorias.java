package ec.edu.ups.bussiness;

import ec.edu.ups.DAO.AsesoriaDAO;
import ec.edu.ups.model.Asesoria;
import jakarta.ejb.Stateless;
import jakarta.inject.Inject;

import java.util.List;

@Stateless
public class GestionAsesorias {
	
	@Inject
	private AsesoriaDAO daoAsesoria;

	public List<Asesoria> getAsesoria(){
		return daoAsesoria.getAll();
	}
	
	public Asesoria getAsesoria(String id) throws Exception {
		if(id.isEmpty())
			throw new Exception("Parámetro incorrecto");
		
		Asesoria a = daoAsesoria.read(id);
		return a;
	}
	
	public void crearAsesoria(Asesoria asesoria) throws Exception {
		if(asesoria.getId() == null || asesoria.getId().isEmpty())
			throw new Exception("ID requerido");
		
		daoAsesoria.insert(asesoria);
	}
	
	public void actualizarAsesoria(Asesoria asesoria) throws Exception {
	    if(asesoria.getId() == null || asesoria.getId().isEmpty())
	        throw new Exception("ID requerido");

	    daoAsesoria.update(asesoria);
	}
}
