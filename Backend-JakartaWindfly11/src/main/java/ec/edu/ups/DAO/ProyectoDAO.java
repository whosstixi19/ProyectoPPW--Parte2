package ec.edu.ups.DAO;

import java.util.List;
import ec.edu.ups.model.Proyecto;
import jakarta.ejb.Stateless;
import jakarta.persistence.*;

@Stateless
public class ProyectoDAO {
	
	@PersistenceContext
	private EntityManager em;
	
	public void insert(Proyecto proyecto) {
		em.persist(proyecto);
	}
	
	public void update(Proyecto proyecto) {
		em.merge(proyecto);
	}
	
	public Proyecto read(String pk) {
		return em.find(Proyecto.class, pk);
	}
	
	public void delete(String pk) {
		Proyecto proyecto = em.find(Proyecto.class, pk);
		em.remove(proyecto);
	}
	
	public List<Proyecto> getAll(){
		String jpql = "SELECT p FROM Proyecto p";
		TypedQuery<Proyecto> q = em.createQuery(jpql, Proyecto.class);
		return q.getResultList();
	}
}
