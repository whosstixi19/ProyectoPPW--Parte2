package ec.edu.ups.bussiness;

import java.util.List;

import ec.edu.ups.DAO.AusenciaDAO;
import ec.edu.ups.model.Ausencia;
import jakarta.annotation.PostConstruct;
import jakarta.ejb.Singleton;
import jakarta.ejb.Startup;
import jakarta.inject.Inject;

@Singleton
@Startup
public class AusenciaDemo {
	
	@Inject
	private AusenciaDAO daoAusencia;
	
	@PostConstruct
	public void init() {
		Ausencia a1 = new Ausencia();
		a1.setId("aus001");
		a1.setFecha("2024-01-20");
		a1.setHoraInicio("09:00");
		a1.setHoraFin("12:00");
		a1.setMotivo("Cita médica");
		a1.setProgramadorUid("prog001");

		Ausencia a2 = new Ausencia();
		a2.setId("aus002");
		a2.setFecha("2024-01-22");
		a2.setHoraInicio("14:00");
		a2.setHoraFin("18:00");
		a2.setMotivo("Capacitación");
		a2.setProgramadorUid("prog002");

		daoAusencia.insert(a1);
		daoAusencia.insert(a2);

		System.out.println("Ausencias insertadas correctamente");
		List<Ausencia> ausencias = daoAusencia.getAll();
		for(Ausencia x : ausencias) {
			System.out.println("Ausencia: " + x.getId());
			System.out.println("Fecha: " + x.getFecha());
			System.out.println("Motivo: " + x.getMotivo());
		}
	}
}
