package ec.edu.ups.bussiness;

import ec.edu.ups.DAO.HorarioDisponibleDAO;
import ec.edu.ups.model.HorarioDisponible;
import jakarta.ejb.Stateless;
import jakarta.inject.Inject;

import java.util.List;

@Stateless
public class GestionHorarios {
	
	@Inject
	private HorarioDisponibleDAO daoHorario;

	public List<HorarioDisponible> getHorario(){
		return daoHorario.getAll();
	}
	
	public HorarioDisponible getHorario(Integer id) throws Exception {
		if(id == null)
			throw new Exception("Parámetro incorrecto");
		
		HorarioDisponible h = daoHorario.read(id);
		return h;
	}
	
	public void crearHorario(HorarioDisponible horario) throws Exception {
		if(horario.getDia() == null || horario.getDia().isEmpty())
			throw new Exception("Día requerido");
		
		daoHorario.insert(horario);
	}
	
	public void actualizarHorario(HorarioDisponible horario) throws Exception {
	    if(horario.getDia() == null || horario.getDia().isEmpty())
	        throw new Exception("Día requerido");

	    daoHorario.update(horario);
	}
	
	public void eliminarHorario(Integer id) throws Exception {
		if(id == null)
			throw new Exception("ID requerido");
		
		HorarioDisponible h = daoHorario.read(id);
		if(h == null)
			throw new Exception("Horario no encontrado");
		
		daoHorario.delete(id);
	}
	
	public List<HorarioDisponible> getHorariosByProgramador(String programadorUid) throws Exception {
		if(programadorUid == null || programadorUid.isEmpty())
			throw new Exception("programadorUid requerido");
		
		return daoHorario.getByProgramador(programadorUid);
	}
}
