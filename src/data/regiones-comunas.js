
const REGIONES_COMUNAS = [
  {
    region: "Arica y Parinacota",
    comunas: ["Arica", "Camarones", "Putre", "General Lagos"]
  },
  {
    region: "Tarapacá",
    comunas: ["Iquique", "Alto Hospicio", "Pozo Almonte", "Camiña", "Huara", "Pica"]
  },
  {
    region: "Antofagasta",
    comunas: ["Antofagasta", "Mejillones", "Sierra Gorda", "Taltal", "Calama", "Ollagüe", "San Pedro de Atacama"]
  },
  {
    region: "Atacama",
    comunas: ["Copiapó", "Caldera", "Tierra Amarilla", "Chañaral", "Diego de Almagro", "Vallenar", "Alto del Carmen", "Freirina", "Huasco"]
  },
  {
    region: "Coquimbo",
    comunas: ["La Serena", "Coquimbo", "Andacollo", "La Higuera", "Paiguano", "Vicuña", "Illapel", "Canela", "Los Vilos", "Salamanca", "Ovalle", "Combarbalá", "Monte Patria", "Punitaqui", "Río Hurtado"]
  },
  {
    region: "Valparaíso",
    comunas: ["Valparaíso", "Viña del Mar", "Concón", "Quilpué", "Villa Alemana", "Casablanca", "Juan Fernández", "Isla de Pascua", "Los Andes", "Calle Larga", "Rinconada", "San Esteban", "La Ligua", "Petorca", "Zapallar", "Papudo", "Quillota", "Calera", "Hijuelas", "La Cruz", "Nogales", "San Antonio", "Cartagena", "El Quisco", "El Tabo", "Santo Domingo", "San Felipe", "Catemu", "Llaillay", "Panquehue", "Putaendo", "Santa María"]
  },
  {
    region: "Metropolitana de Santiago",
    comunas: ["Santiago", "Cerrillos", "Cerro Navia", "Conchalí", "El Bosque", "Estación Central", "Huechuraba", "Independencia", "La Cisterna", "La Florida", "La Granja", "La Pintana", "La Reina", "Las Condes", "Lo Barnechea", "Lo Espejo", "Lo Prado", "Macul", "Maipú", "Melipilla", "Ñuñoa", "Pedro Aguirre Cerda", "Peñalolén", "Providencia", "Pudahuel", "Quilicura", "Quinta Normal", "Recoleta", "Renca", "San Bernardo", "San Joaquín", "San Miguel", "San Pedro", "San Ramón", "Talagante", "Vitacura"]
  },
  {
    region: "O'Higgins",
    comunas: ["Rancagua", "Codegua", "Coínco", "Coltauco", "Graneros", "Las Cabras", "Lo Miranda", "Mostazal", "Olivar", "Quinta de Tilcoco", "Rengo", "Requinoa", "San Vicente de Tagua Tagua", "San Fernando", "Chépica", "Chimbarongo", "Lolol", "Nancagua", "Palmilla", "Peralillo", "Placilla", "Pumanque", "Santa Cruz"]
  },
  {
    region: "Maule",
    comunas: ["Talca", "Constitución", "Curepto", "Empedrado", "Maule", "Pelarco", "Pencahue", "Río Claro", "San Clemente", "San Rafael", "Cauquenes", "Chanco", "Linares", "Longaví", "Parral", "Retiro", "San Javier", "Villa Alegre", "Yerbas Buenas"]
  },
  {
    region: "Ñuble",
    comunas: ["Chillán", "Bulnes", "Cobquecura", "Coelemu", "Coihueco", "Chillán Viejo", "El Carmen", "Ninhue", "Pemuco", "Quillón", "Ránquil", "San Carlos", "San Fabián", "San Nicolás", "Cobaderas", "Quirihue", "Rángel"]
  },
  {
    region: "Biobío",
    comunas: ["Concepción", "Coronel", "Chiguayante", "Florida", "Hualpén", "Huachihualenco", "Lota", "Penco", "San Pedro de la Paz", "Santa Juana", "Talcahuano", "Tomé", "Los Ángeles", "Antuco", "Cabrero", "Laja", "Los Ángeles", "Mulchén", "Nacimiento", "Negrete", "Quilaco", "Quilleco", "San Rosendo", "Santa Bárbara", "Tirúa", "Alto Biobío", "Contulmo", "Curanilahue", "Lebu", "Los Álamos", "Cañete", "Tirúa"]
  },
  {
    region: "Araucanía",
    comunas: ["Temuco", "Carahue", "Cunco", "Curarrehue", "Freire", "Galvarino", "Gorbea", "Lautaro", "Loncoche", "Melipeuco", "Nueva Imperial", "Padre Las Casas", "Perquenco", "Pitrufquén", "Pucón", "Saavedra", "Teodoro Schmidt", "Toltén", "Villarrica", "Cholchol", "Angol", "Collipulli", "Ercilla", "Lumaco", "Purén", "Renaico", "Los Sauces", "Victoria"]
  },
  {
    region: "Los Ríos",
    comunas: ["Valdivia", "Corral", "Lanco", "Los Lagos", "Máfil", "Mariquina", "Paillaco", "Panguipulli", "La Unión", "Futrono", "Lago Ranco", "Río Bueno"]
  },
  {
    region: "Los Lagos",
    comunas: ["Puerto Montt", "Calbuco", "Cochamó", "Fresia", "Frutillar", "Maullín", "Puerto Varas", "Castro", "Chaitén", "Chonchi", "Curaco de Vélez", "Dalcahue", "Futaleufú", "Hualaihué", "Palena", "Puerto Aysén", "Cisnes", "Guaitecas", "Chile Chico", "Coyhaique", "Aysén", "Cochrane", "O'Higgins", "Río Ibáñez", "Tortel"]
  },
  {
    region: "Aysén",
    comunas: ["Coyhaique", "Lago Verde", "Aysén", "Cisnes", "Guaitecas", "Chile Chico", "Río Ibáñez", "Cochrane", "O'Higgins", "Tortel"]
  },
  {
    region: "Magallanes y de la Antártica Chilena",
    comunas: ["Punta Arenas", "Laguna Blanca", "Porvenir", "Primavera", "Río Verde", "San Gregorio", "Cabo de Hornos", "Antártica", "Porvenir", "Timaukel", "Cabo de Hornos"]
  }
];

export default REGIONES_COMUNAS