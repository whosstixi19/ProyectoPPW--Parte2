package ec.edu.ups.est.Backedn_SpringBoot.controller;

import ec.edu.ups.est.Backedn_SpringBoot.entity.Persona;
import ec.edu.ups.est.Backedn_SpringBoot.service.PersonaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/personas")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})
public class PersonaController {

    @Autowired
    private PersonaService personaService;

    @GetMapping
    public ResponseEntity<List<Persona>> getAllPersonas() {
        List<Persona> personas = personaService.findAll();
        return ResponseEntity.ok(personas);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Persona> getPersonaById(@PathVariable Long id) {
        return personaService.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<Persona> getPersonaByEmail(@PathVariable String email) {
        return personaService.findByEmail(email)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Persona> createPersona(@RequestBody Persona persona) {
        Persona savedPersona = personaService.save(persona);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedPersona);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Persona> updatePersona(@PathVariable Long id, @RequestBody Persona persona) {
        try {
            Persona updatedPersona = personaService.update(id, persona);
            return ResponseEntity.ok(updatedPersona);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePersona(@PathVariable Long id) {
        personaService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Spring Boot API - Persona - OK");
    }

    @GetMapping(value = "/dashboard", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> getDashboard(@RequestParam(defaultValue = "usuario") String role) {
        List<Persona> personas = personaService.findAll();
        Map<String, Object> payload = new HashMap<>();
        payload.put("personas", personas);
        payload.put("total", personas.size());
        payload.put("hasData", !personas.isEmpty());
        payload.put("message", personas.isEmpty() ? "No hay personas registradas" : "OK");
        payload.put("backUrl", role.equalsIgnoreCase("programador") ? "/perfil/programador" : "/perfil/usuario");
        return ResponseEntity.ok(payload);
    }

    @GetMapping(value = "/dashboard/summary", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> getDashboardSummary(@RequestParam(defaultValue = "usuario") String role) {
        List<Persona> personas = personaService.findAll();
        Map<String, Object> payload = new HashMap<>();
        payload.put("total", personas.size());
        payload.put("hasData", !personas.isEmpty());
        payload.put("backUrl", role.equalsIgnoreCase("programador") ? "/perfil/programador" : "/perfil/usuario");
        return ResponseEntity.ok(payload);
    }
}
