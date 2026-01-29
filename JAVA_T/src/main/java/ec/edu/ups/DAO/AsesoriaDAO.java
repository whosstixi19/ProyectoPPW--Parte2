package ec.edu.ups.DAO;

import java.util.List;
import ec.edu.ups.model.Asesoria;
import jakarta.ejb.Stateless;
import jakarta.persistence.*;

@Stateless
public class AsesoriaDAO {
	
	@PersistenceContext
	private EntityManager em;
	
	public void insert(Asesoria asesoria) {
		em.persist(asesoria);
	}
	
	public void update(Asesoria asesoria) {
		em.merge(asesoria);
	}
	
	public Asesoria read(String pk) {
		return em.find(Asesoria.class, pk);
	}
	
	public void delete(String pk) {
		Asesoria asesoria = em.find(Asesoria.class, pk);
		em.remove(asesoria);
	}
	
	public List<Asesoria> getAll(){
		String jpql = "SELECT a FROM Asesoria a";
		TypedQuery<Asesoria> q = em.createQuery(jpql, Asesoria.class);
		return q.getResultList();
	}
}
