package ec.edu.ups.bussiness;

import java.util.List;

import ec.edu.ups.DAO.ProgramadorDAO;
import ec.edu.ups.model.Programador;
import jakarta.annotation.PostConstruct;
import jakarta.ejb.Singleton;
import jakarta.ejb.Startup;
import jakarta.inject.Inject;

@Singleton
@Startup
public class ProgramadorDemo {
	
	@Inject
	private ProgramadorDAO daoProgramador;
	
	@PostConstruct
	public void init() {
		Programador p1 = new Programador();
		p1.setUid("prog001");
		p1.setEmail("juan.perez@example.com");
		p1.setDisplayName("Juan Pérez");
		p1.setRole("programador");
		p1.setPassword("pass123");
		p1.setEnabled(true);
		p1.setEspecialidad("Backend Java");
		p1.setDescripcion("Desarrollador Java con 5 años de experiencia");
		p1.setGithub("https://github.com/juanperez");
		p1.setLinkedin("https://linkedin.com/in/juanperez");
		
		Programador p2 = new Programador();
		p2.setUid("prog002");
		p2.setEmail("maria.garcia@example.com");
		p2.setDisplayName("María García");
		p2.setRole("programador");
		p2.setPassword("pass123");
		p2.setEnabled(true);
		p2.setEspecialidad("Frontend Angular");
		p2.setDescripcion("Experta en Angular y diseño UI/UX");
		p2.setGithub("https://github.com/mariagarcia");
		p2.setLinkedin("https://linkedin.com/in/mariagarcia");

		Programador p3 = new Programador();
		p3.setUid("prog003");
		p3.setEmail("luis.lopez@example.com");
		p3.setDisplayName("Luis López");
		p3.setRole("programador");
		p3.setPassword("pass123");
		p3.setEnabled(true);
		p3.setEspecialidad("Full Stack");
		p3.setDescripcion("Desarrollador Full Stack especializado en microservicios");
		p3.setGithub("https://github.com/luislopez");
		p3.setLinkedin("https://linkedin.com/in/luislopez");

		daoProgramador.insert(p1);
		daoProgramador.insert(p2);
		daoProgramador.insert(p3);

		System.out.println("Programadores insertados correctamente");
		List<Programador> programadores = daoProgramador.getAll();
		for(Programador x : programadores) {
			System.out.println("Programador: " + x.getDisplayName());
			System.out.println("UID: " + x.getUid());
			System.out.println("Email: " + x.getEmail());
			System.out.println("Especialidad: " + x.getEspecialidad());
		}
	}
}
