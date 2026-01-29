package ec.edu.ups.bussiness;

import java.util.List;

import ec.edu.ups.DAO.HorarioDisponibleDAO;
import ec.edu.ups.model.HorarioDisponible;
import jakarta.annotation.PostConstruct;
import jakarta.ejb.Singleton;
import jakarta.ejb.Startup;
import jakarta.inject.Inject;

@Singleton
@Startup
public class HorarioDisponibleDemo {
	
	@Inject
	private HorarioDisponibleDAO daoHorario;
	
	@PostConstruct
	public void init() {
		HorarioDisponible h1 = new HorarioDisponible();
		h1.setDia("Lunes");
		h1.setHoraInicio("09:00");
		h1.setHoraFin("12:00");
		h1.setActivo(true);
		h1.setProgramadorUid("prog001");

		HorarioDisponible h2 = new HorarioDisponible();
		h2.setDia("Miércoles");
		h2.setHoraInicio("14:00");
		h2.setHoraFin("18:00");
		h2.setActivo(true);
		h2.setProgramadorUid("prog002");

		daoHorario.insert(h1);
		daoHorario.insert(h2);

		System.out.println("Horarios insertados correctamente");
		List<HorarioDisponible> horarios = daoHorario.getAll();
		for(HorarioDisponible x : horarios) {
			System.out.println("Horario: " + x.getDia());
			System.out.println("Inicio: " + x.getHoraInicio());
			System.out.println("Fin: " + x.getHoraFin());
		}
	}
}
