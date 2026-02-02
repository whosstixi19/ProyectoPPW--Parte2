package ec.edu.ups.DAO;

import java.util.List;
import ec.edu.ups.model.Ausencia;
import jakarta.ejb.Stateless;
import jakarta.persistence.*;

@Stateless
public class AusenciaDAO {
	
	@PersistenceContext
	private EntityManager em;
	
	public void insert(Ausencia ausencia) {
		em.persist(ausencia);
	}
	
	public void update(Ausencia ausencia) {
		em.merge(ausencia);
	}
	
	public Ausencia read(String pk) {
		return em.find(Ausencia.class, pk);
	}
	
	public void delete(String pk) {
		Ausencia ausencia = em.find(Ausencia.class, pk);
		em.remove(ausencia);
	}
	
	public List<Ausencia> getAll(){
		String jpql = "SELECT a FROM Ausencia a";
		TypedQuery<Ausencia> q = em.createQuery(jpql, Ausencia.class);
		return q.getResultList();
	}
}
