package ec.edu.ups.Services;

public class Error {

	
	private int codigo;
	private String name;
	private String description;

	
	
	public Error(int codigo, String name, String description) {
		super();
		this.codigo = codigo;
		this.name = name;
		this.description = description;
	}
	
	
	public int getCodigo() {
		return codigo;
	}
	public void setCodigo(int codigo) {
		this.codigo = codigo;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getDescription() {
		return description;
	}
	public void setDescription(String description) {
		this.description = description;
	}
}