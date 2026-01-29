package ec.edu.ups.bussiness;

import java.util.List;

import ec.edu.ups.DAO.ProyectoDAO;
import ec.edu.ups.model.Proyecto;
import jakarta.annotation.PostConstruct;
import jakarta.ejb.Singleton;
import jakarta.ejb.Startup;
import jakarta.inject.Inject;

@Singleton
@Startup
public class ProyectoDemo {
	
	@Inject
	private ProyectoDAO daoProyecto;
	
	@PostConstruct
	public void init() {
		Proyecto p1 = new Proyecto();
		p1.setId("pro001");
		p1.setNombre("Sistema de Asesorías");
		p1.setDescripcion("Plataforma para gestionar asesorías");
		p1.setTipo("Web");
		p1.setParticipacion("Full Stack");
		p1.setTecnologias("Java, Jakarta EE, Angular");
		p1.setRepositorio("https://github.com/example/proyecto");
		p1.setDemo("https://demo.example.com");

		Proyecto p2 = new Proyecto();
		p2.setId("pro002");
		p2.setNombre("Gestión de Horarios");
		p2.setDescripcion("Calendario y disponibilidad de programadores");
		p2.setTipo("Web");
		p2.setParticipacion("Backend");
		p2.setTecnologias("Java, JPA");
		p2.setRepositorio("https://github.com/example/horarios");
		p2.setDemo("https://demo.example.com/horarios");

		daoProyecto.insert(p1);
		daoProyecto.insert(p2);

		System.out.println("Proyectos insertados correctamente");
		List<Proyecto> proyectos = daoProyecto.getAll();
		for(Proyecto x : proyectos) {
			System.out.println("Proyecto: " + x.getNombre());
			System.out.println("Tipo: " + x.getTipo());
			System.out.println("Repo: " + x.getRepositorio());
		}
	}
}
