package ec.edu.ups.DAO;

import java.util.List;
import ec.edu.ups.model.Programador;
import jakarta.ejb.Stateless;
import jakarta.persistence.*;

@Stateless
public class ProgramadorDAO {
	
	@PersistenceContext
	private EntityManager em;
	
	public void insert(Programador programador) {
		em.persist(programador);
	}
	
	public void update(Programador programador) {
		em.merge(programador);
	}
	
	public Programador read(String pk) {
		return em.find(Programador.class, pk);
	}
	
	public void delete(String pk) {
		Programador programador = em.find(Programador.class, pk);
		em.remove(programador);
	}
	
	public List<Programador> getAll(){
		String jpql = "SELECT p FROM Programador p";
		TypedQuery<Programador> q = em.createQuery(jpql, Programador.class);
		return q.getResultList();
	}
}
