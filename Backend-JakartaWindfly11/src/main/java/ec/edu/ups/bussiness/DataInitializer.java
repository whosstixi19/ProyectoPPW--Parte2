package ec.edu.ups.bussiness;

import ec.edu.ups.DAO.ProyectoDAO;
import ec.edu.ups.DAO.HorarioDisponibleDAO;
import ec.edu.ups.model.Proyecto;
import ec.edu.ups.model.HorarioDisponible;
import jakarta.annotation.PostConstruct;
import jakarta.ejb.Singleton;
import jakarta.ejb.Startup;
import jakarta.inject.Inject;

import java.util.List;

/**
 * Inicializa datos de prueba para Proyectos y Horarios
 * Solo se ejecuta si las tablas están vacías
 */
@Singleton
@Startup
public class DataInitializer {
    
    @Inject
    private ProyectoDAO proyectoDAO;
    
    @Inject
    private HorarioDisponibleDAO horarioDAO;
    
    @PostConstruct
    public void init() {
        System.out.println("🔄 Inicializando datos de prueba...");
        
        // Verificar si ya hay datos
        List<Proyecto> proyectosExistentes = proyectoDAO.getAll();
        List<HorarioDisponible> horariosExistentes = horarioDAO.getAll();
        
        if (proyectosExistentes != null && !proyectosExistentes.isEmpty()) {
            System.out.println("✅ Ya existen " + proyectosExistentes.size() + " proyectos.");
        } else {
            insertarProyectosPrueba();
        }
        
        if (horariosExistentes != null && !horariosExistentes.isEmpty()) {
            System.out.println("✅ Ya existen " + horariosExistentes.size() + " horarios.");
        } else {
            insertarHorariosPrueba();
        }
        
        System.out.println("✅ Inicialización completada.");
    }
    
    private void insertarProyectosPrueba() {
        // Proyecto 1
        Proyecto p1 = new Proyecto();
        p1.setId("proj_001");
        p1.setProgramadorUid("prog001");
        p1.setNombre("Sistema de Gestión Hospitalaria");
        p1.setDescripcion("Aplicación web para gestión de citas médicas y pacientes");
        p1.setTipo("academico");
        p1.setParticipacion("frontend,backend,base-datos");
        p1.setTecnologias("Angular,Spring Boot,PostgreSQL");
        p1.setRepositorio("https://github.com/user/hospital-system");
        p1.setDemo("https://demo-hospital.com");
        proyectoDAO.insert(p1);
        
        // Proyecto 2
        Proyecto p2 = new Proyecto();
        p2.setId("proj_002");
        p2.setProgramadorUid("prog001");
        p2.setNombre("E-commerce con Microservicios");
        p2.setDescripcion("Plataforma de comercio electrónico escalable");
        p2.setTipo("laboral");
        p2.setParticipacion("backend");
        p2.setTecnologias("Jakarta EE,WildFly,MongoDB");
        p2.setRepositorio("https://github.com/user/ecommerce");
        proyectoDAO.insert(p2);
        
        // Proyecto 3
        Proyecto p3 = new Proyecto();
        p3.setId("proj_003");
        p3.setProgramadorUid("prog002");
        p3.setNombre("App Móvil de Fitness");
        p3.setDescripcion("Aplicación para seguimiento de ejercicios y nutrición");
        p3.setTipo("academico");
        p3.setParticipacion("frontend");
        p3.setTecnologias("React Native,Firebase,Redux");
        p3.setRepositorio("https://github.com/user/fitness-app");
        p3.setDemo("https://fitness-demo.com");
        proyectoDAO.insert(p3);
        
        System.out.println("✅ 3 proyectos de prueba insertados");
    }
    
    private void insertarHorariosPrueba() {
        // Horarios del programador 1
        HorarioDisponible h1 = new HorarioDisponible();
        h1.setProgramadorUid("prog001");
        h1.setDia("lunes");
        h1.setHoraInicio("09:00");
        h1.setHoraFin("12:00");
        h1.setActivo(true);
        horarioDAO.insert(h1);
        
        HorarioDisponible h2 = new HorarioDisponible();
        h2.setProgramadorUid("prog001");
        h2.setDia("miercoles");
        h2.setHoraInicio("14:00");
        h2.setHoraFin("17:00");
        h2.setActivo(true);
        horarioDAO.insert(h2);
        
        HorarioDisponible h3 = new HorarioDisponible();
        h3.setProgramadorUid("prog001");
        h3.setDia("viernes");
        h3.setHoraInicio("10:00");
        h3.setHoraFin("13:00");
        h3.setActivo(true);
        horarioDAO.insert(h3);
        
        // Horarios del programador 2
        HorarioDisponible h4 = new HorarioDisponible();
        h4.setProgramadorUid("prog002");
        h4.setDia("martes");
        h4.setHoraInicio("08:00");
        h4.setHoraFin("11:00");
        h4.setActivo(true);
        horarioDAO.insert(h4);
        
        HorarioDisponible h5 = new HorarioDisponible();
        h5.setProgramadorUid("prog002");
        h5.setDia("jueves");
        h5.setHoraInicio("15:00");
        h5.setHoraFin("18:00");
        h5.setActivo(true);
        horarioDAO.insert(h5);
        
        System.out.println("✅ 5 horarios de prueba insertados");
    }
}
