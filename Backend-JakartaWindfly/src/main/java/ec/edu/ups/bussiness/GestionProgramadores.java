package ec.edu.ups.bussiness;

import ec.edu.ups.DAO.ProgramadorDAO;
import ec.edu.ups.model.Programador;
import jakarta.ejb.Stateless;
import jakarta.inject.Inject;

import java.util.List;

@Stateless
public class GestionProgramadores {
	
	@Inject
	private ProgramadorDAO daoProgramador;

	public List<Programador> getProgramador(){
		return daoProgramador.getAll();
	}
	
	public Programador getProgramador(String id) throws Exception {
		if(id.isEmpty() || id.length() < 5)
			throw new Exception("Parámetro incorrecto");
		
		Programador p = daoProgramador.read(id);
		return p;
	}
	
	public void crearProgramador(Programador programador) throws Exception {
		if(programador.getUid() == null || programador.getUid().isEmpty())
			throw new Exception("UID requerido");
		
		daoProgramador.insert(programador);
	}
	
	public void actualizarProgramador(Programador programador) throws Exception {
	    if(programador.getUid() == null || programador.getUid().isEmpty())
	        throw new Exception("UID requerido");

	    daoProgramador.update(programador);
	}
}
