package ec.edu.ups.est.Backedn_SpringBoot.repository;

import ec.edu.ups.est.Backedn_SpringBoot.entity.Persona;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PersonaRepository extends JpaRepository<Persona, Long> {
    Optional<Persona> findByEmail(String email);
}
