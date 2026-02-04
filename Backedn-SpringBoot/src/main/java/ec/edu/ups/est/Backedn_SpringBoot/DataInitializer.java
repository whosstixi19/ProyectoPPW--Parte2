package ec.edu.ups.est.Backedn_SpringBoot;

import ec.edu.ups.est.Backedn_SpringBoot.entity.Persona;
import ec.edu.ups.est.Backedn_SpringBoot.repository.PersonaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private PersonaRepository personaRepository;

    @Override
    public void run(String... args) throws Exception {
        // Solo insertar datos si la tabla está vacía
        if (personaRepository.count() == 0) {
            System.out.println("Insertando datos de prueba...");

            Persona p1 = new Persona();
            p1.setNombre("Juan Carlos");
            p1.setApellido("Pérez García");
            p1.setEmail("juan.perez@example.com");
            p1.setTelefono("+593987654321");
            p1.setDireccion("Av. 10 de Agosto y Colón, Quito");
            personaRepository.save(p1);

            Persona p2 = new Persona();
            p2.setNombre("María Isabel");
            p2.setApellido("López Fernández");
            p2.setEmail("maria.lopez@example.com");
            p2.setTelefono("+593998765432");
            p2.setDireccion("Calle Larga 123, Cuenca");
            personaRepository.save(p2);

            Persona p3 = new Persona();
            p3.setNombre("Pedro Antonio");
            p3.setApellido("Rodríguez Sánchez");
            p3.setEmail("pedro.rodriguez@example.com");
            p3.setTelefono("+593976543210");
            p3.setDireccion("Malecón 2000, Guayaquil");
            personaRepository.save(p3);

            Persona p4 = new Persona();
            p4.setNombre("Ana Lucía");
            p4.setApellido("Martínez Ruiz");
            p4.setEmail("ana.martinez@example.com");
            p4.setTelefono("+593965432109");
            p4.setDireccion("Av. González Suárez 456, Quito");
            personaRepository.save(p4);

            Persona p5 = new Persona();
            p5.setNombre("Carlos Alberto");
            p5.setApellido("González Mora");
            p5.setEmail("carlos.gonzalez@example.com");
            p5.setTelefono("+593954321098");
            p5.setDireccion("Calle 9 de Octubre 789, Guayaquil");
            personaRepository.save(p5);

            System.out.println("✓ Se insertaron 5 personas de prueba");
        } else {
            System.out.println("Ya existen datos en la base de datos");
        }
    }
}
