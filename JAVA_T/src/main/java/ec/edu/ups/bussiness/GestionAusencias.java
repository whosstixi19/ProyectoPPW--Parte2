package ec.edu.ups.bussiness;

import ec.edu.ups.DAO.AusenciaDAO;
import ec.edu.ups.model.Ausencia;
import jakarta.ejb.Stateless;
import jakarta.inject.Inject;

import java.util.List;

@Stateless
public class GestionAusencias {
	
	@Inject
	private AusenciaDAO daoAusencia;

	public List<Ausencia> getAusencia(){
		return daoAusencia.getAll();
	}
	
	public Ausencia getAusencia(String id) throws Exception {
		if(id.isEmpty())
			throw new Exception("Parámetro incorrecto");
		
		Ausencia a = daoAusencia.read(id);
		return a;
	}
	
	public void crearAusencia(Ausencia ausencia) throws Exception {
		if(ausencia.getId() == null || ausencia.getId().isEmpty())
			throw new Exception("ID requerido");
		
		daoAusencia.insert(ausencia);
	}
	
	public void actualizarAusencia(Ausencia ausencia) throws Exception {
	    if(ausencia.getId() == null || ausencia.getId().isEmpty())
	        throw new Exception("ID requerido");

	    daoAusencia.update(ausencia);
	}
}
