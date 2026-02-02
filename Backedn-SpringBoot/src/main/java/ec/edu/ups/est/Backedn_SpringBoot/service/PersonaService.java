package ec.edu.ups.est.Backedn_SpringBoot.service;

import ec.edu.ups.est.Backedn_SpringBoot.entity.Persona;
import ec.edu.ups.est.Backedn_SpringBoot.repository.PersonaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PersonaService {

    @Autowired
    private PersonaRepository personaRepository;

    public List<Persona> findAll() {
        return personaRepository.findAll();
    }

    public Optional<Persona> findById(Long id) {
        return personaRepository.findById(id);
    }

    public Optional<Persona> findByEmail(String email) {
        return personaRepository.findByEmail(email);
    }

    public Persona save(Persona persona) {
        return personaRepository.save(persona);
    }

    public Persona update(Long id, Persona personaDetails) {
        return personaRepository.findById(id)
            .map(persona -> {
                persona.setNombre(personaDetails.getNombre());
                persona.setApellido(personaDetails.getApellido());
                persona.setEmail(personaDetails.getEmail());
                persona.setTelefono(personaDetails.getTelefono());
                persona.setDireccion(personaDetails.getDireccion());
                return personaRepository.save(persona);
            })
            .orElseThrow(() -> new RuntimeException("Persona no encontrada con id: " + id));
    }

    public void deleteById(Long id) {
        personaRepository.deleteById(id);
    }
}
