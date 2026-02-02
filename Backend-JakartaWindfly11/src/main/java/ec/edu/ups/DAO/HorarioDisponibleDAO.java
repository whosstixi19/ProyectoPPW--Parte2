package ec.edu.ups.DAO;

import java.util.List;
import ec.edu.ups.model.HorarioDisponible;
import jakarta.ejb.Stateless;
import jakarta.persistence.*;

@Stateless
public class HorarioDisponibleDAO {
	
	@PersistenceContext
	private EntityManager em;
	
	public void insert(HorarioDisponible horario) {
		em.persist(horario);
	}
	
	public void update(HorarioDisponible horario) {
		em.merge(horario);
	}
	
	public HorarioDisponible read(Long pk) {
		return em.find(HorarioDisponible.class, pk);
	}
	
	public void delete(Long pk) {
		HorarioDisponible horario = em.find(HorarioDisponible.class, pk);
		em.remove(horario);
	}
	
	public List<HorarioDisponible> getAll(){
		String jpql = "SELECT h FROM HorarioDisponible h";
		TypedQuery<HorarioDisponible> q = em.createQuery(jpql, HorarioDisponible.class);
		return q.getResultList();
	}
}
