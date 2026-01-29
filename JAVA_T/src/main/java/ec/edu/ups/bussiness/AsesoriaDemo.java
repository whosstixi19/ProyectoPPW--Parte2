package ec.edu.ups.bussiness;

import java.util.List;

import ec.edu.ups.DAO.AsesoriaDAO;
import ec.edu.ups.model.Asesoria;
import jakarta.annotation.PostConstruct;
import jakarta.ejb.Singleton;
import jakarta.ejb.Startup;
import jakarta.inject.Inject;

@Singleton
@Startup
public class AsesoriaDemo {
	
	@Inject
	private AsesoriaDAO daoAsesoria;
	
	@PostConstruct
	public void init() {
		Asesoria a1 = new Asesoria();
		a1.setId("ase001");
		a1.setUsuarioUid("user001");
		a1.setUsuarioNombre("Michelle");
		a1.setUsuarioEmail("michelle@example.com");
		a1.setProgramadorUid("prog001");
		a1.setProgramadorNombre("Juan Pérez");
		a1.setTema("Spring Boot");
		a1.setDescripcion("Configuración inicial del proyecto");
		a1.setFechaSolicitada("2024-01-15");
		a1.setHoraSolicitada("10:00");
		a1.setEstado("pendiente");

		Asesoria a2 = new Asesoria();
		a2.setId("ase002");
		a2.setUsuarioUid("user002");
		a2.setUsuarioNombre("Andrea");
		a2.setUsuarioEmail("andrea@example.com");
		a2.setProgramadorUid("prog002");
		a2.setProgramadorNombre("María García");
		a2.setTema("Angular Avanzado");
		a2.setDescripcion("Directivas personalizadas");
		a2.setFechaSolicitada("2024-01-16");
		a2.setHoraSolicitada("14:00");
		a2.setEstado("pendiente");

		daoAsesoria.insert(a1);
		daoAsesoria.insert(a2);

		System.out.println("Asesorías insertadas correctamente");
		List<Asesoria> asesorias = daoAsesoria.getAll();
		for(Asesoria x : asesorias) {
			System.out.println("Asesoría: " + x.getId());
			System.out.println("Usuario: " + x.getUsuarioNombre());
			System.out.println("Programador: " + x.getProgramadorNombre());
			System.out.println("Tema: " + x.getTema());
			System.out.println("Estado: " + x.getEstado());
		}
	}
}
