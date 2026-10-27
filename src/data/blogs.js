// Artículos del blog (vistas Blogs y BlogDetalle). Datos fijos, no se editan.
const blogs = [
  {
    id: 1,
    titulo: 'Los Secretos del Chocolate Artesanal',
    categoria: 'Recetas',
    fecha: '15 Agosto 2026',
    autor: 'María García',
    lectura: '5 min de lectura',
    imagen:
      'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=800&h=400&fit=crop',
    resumen:
      'Descubre los ingredientes y técnicas que hacen único a nuestro chocolate belga, desde la selección del cacao hasta el temperado perfecto.',
    intro:
      'El chocolate artesanal es mucho más que un simple dulce. Es el resultado de un proceso meticuloso que comienza con la selección cuidadosa del cacao y termina con una experiencia sensorial única.',
    secciones: [
      {
        titulo: 'El Origen del Cacao',
        texto:
          'En Pastelería 1000 Sabores utilizamos cacao de origen de Ecuador y Colombia, regiones reconocidas mundialmente por la calidad de sus granos. Cada origen tiene características únicas: el cacao ecuatoriano es suave y afrutado, mientras que el colombiano tiene notas intensas y terrosas.',
      },
      {
        titulo: 'El Proceso de Conchado',
        texto:
          'El conchado es el corazón del chocolate artesanal. Durante este proceso, la masa de cacao se mezcla con azúcar y mantequilla de cacao durante varias horas (nuestro chocolate se concha durante 72 horas). Esto desarrolla los sabores y aromas, y crea esa textura sedosa que caracteriza a nuestro chocolate.',
      },
      {
        titulo: 'El Temperado Perfecto',
        texto:
          'El temperado es lo que le da al chocolate ese brillo característico y ese sonido al romperlo. Es un proceso que requiere precisión y experiencia: el chocolate debe calentarse a 50°C, enfriarse a 27°C y volver a calentarse a 32°C. Solo así los cristales de cacao se alinean correctamente.',
      },
    ],
    lista: {
      titulo: 'Nuestros Productos de Chocolate',
      items: [
        {
          nombre: 'Torta Triple Chocolate',
          texto: 'Tres capas de mousse de chocolate sobre base de brownie',
        },
        {
          nombre: 'Trufas Artesanales',
          texto: 'Hechas a mano con ganache de 70% cacao',
        },
        {
          nombre: 'Tabletas de Origen',
          texto: 'Chocolates de un solo origen de Ecuador y Colombia',
        },
        {
          nombre: 'Chocolate Caliente',
          texto: 'Nuestra receta signature con canela y merkén chileno',
        },
      ],
    },
    cita: '"El chocolate no es solo un sabor, es una experiencia que conecta personas y crea recuerdos inolvidables." — María García, Fundadora',
    cierre: '',
  },
  {
    id: 2,
    titulo: 'Tendencias en Repostería 2026',
    categoria: 'Tendencias',
    fecha: '10 Agosto 2026',
    autor: 'Carlos Rodríguez',
    lectura: '4 min de lectura',
    imagen:
      'https://images.unsplash.com/photo-1587668178277-295251f900ce?w=800&h=400&fit=crop',
    resumen:
      'Los sabores, colores y técnicas que marcarán la repostería este año. ¡No te pierdas las novedades!',
    intro:
      'El mundo de la repostería está en constante evolución. Cada año aparecen nuevos sabores, técnicas y tendencias que revolucionan nuestra forma de crear dulces. Estas son las tendencias que marcarán 2026.',
    secciones: [
      {
        titulo: '1. Sabores Botánicos',
        texto:
          'Las flores y hierbas aromáticas están conquistando la repostería. La lavanda, la rosa, el romero y la menta se combinan con chocolate y frutas para crear sabores sofisticados y refrescantes.',
      },
      {
        titulo: '2. Chocolate Blanco con Frutos Rojos',
        texto:
          'Esta combinación clásica vuelve con fuerza, pero con un giro moderno: presentaciones minimalistas, sabores intensos y texturas contrastantes.',
      },
      {
        titulo: '3. Repostería Saludable',
        texto:
          'Sin gluten, sin lácteos, bajos en azúcar... la repostería inclusiva ya no es tendencia, es obligación. Cada vez más personas buscan opciones que se adapten a sus necesidades alimentarias sin sacrificar el sabor.',
      },
      {
        titulo: '4. Deko Maximalista',
        texto:
          'La decoración maximalista regresa: colores vibrantes, texturas exageradas, sprinkles en abundancia y diseños que son verdaderas obras de arte.',
      },
      {
        titulo: '5. Sabores de la Cultura Asiática',
        texto:
          'El matcha, el yuzu, el sésamo negro y el té de jazmín están llegando a nuestra repostería. Estos sabores aportan una dimensión nueva y sofisticada a los postres tradicionales.',
      },
    ],
    lista: null,
    cita: '',
    cierre: '¿Qué tendencia te emociona más? ¡Cuéntanos en nuestras redes!',
  },
]

export default blogs