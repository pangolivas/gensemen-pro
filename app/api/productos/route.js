import { NextResponse } from 'next/server'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'

// GET /api/productos - Listar todos los productos disponibles
export async function GET(request) {
  try {
    console.log('=== INICIO API /api/productos ===')
    
    const { searchParams } = new URL(request.url)
    const categoria = searchParams.get('categoria')
    const disponible = searchParams.get('disponible')
    
    console.log('Parámetros recibidos:', { categoria, disponible })
    console.log('Firebase DB existe:', !!db)
    
    // Query simple sin orderBy para evitar necesidad de índices
    const torosRef = collection(db, 'toros')
    console.log('Referencia a colección toros creada')
    
    let q = torosRef
    
    // Solo filtrar por disponibleTienda si se solicita
    if (disponible === 'true') {
      console.log('Aplicando filtro disponibleTienda === true')
      q = query(torosRef, where('disponibleTienda', '==', true))
    } else {
      console.log('Sin filtro, obteniendo todos los toros')
    }
    
    console.log('Ejecutando query a Firestore...')
    const snapshot = await getDocs(q)
    console.log('Query ejecutada. Documentos encontrados:', snapshot.size)
    
    let productos = []
    snapshot.forEach((doc) => {
      console.log('Procesando documento:', doc.id)
      const data = doc.data()
      console.log('Datos del documento:', {
        nombre: data.nombre,
        disponibleTienda: data.disponibleTienda,
        activo: data.activo
      })
      
      productos.push({
        id: doc.id,
        nombre: data.nombre || '',
        codigo: data.codigo || '',
        raza: data.raza || '',
        categoria: data.raza || '',
        precio: data.precioVenta || 0,
        descripcion: data.descripcion || '',
        imagenUrl: data.fotoUrl || '',
        videoUrl: data.videoUrl || '',
        disponibleTienda: data.disponibleTienda || false,
        activo: data.activo || false
      })
    })
    
    console.log('Total productos procesados:', productos.length)
    
    // Filtrar por categoría/raza en memoria
    if (categoria && categoria !== 'Todos') {
      console.log('Filtrando por categoría:', categoria)
      productos = productos.filter(p => p.raza === categoria)
      console.log('Productos después de filtrar por categoría:', productos.length)
    }
    
    // Ordenar por nombre en memoria
    productos.sort((a, b) => a.nombre.localeCompare(b.nombre))
    
    console.log('=== RESPUESTA FINAL ===')
    console.log('Total productos a devolver:', productos.length)

    return NextResponse.json({
      success: true,
      total: productos.length,
      productos: productos
    })

  } catch (error) {
    console.error('=== ERROR EN API ===')
    console.error('Tipo de error:', error.constructor.name)
    console.error('Mensaje:', error.message)
    console.error('Stack:', error.stack)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener productos',
        message: error.message,
        type: error.constructor.name
      },
      { status: 500 }
    )
  }
}

// POST /api/productos - Crear nuevo producto (para uso interno)
export async function POST(request) {
  try {
    const body = await request.json()
    
    // Validar campos requeridos
    const { nombre, raza, precio } = body
    
    if (!nombre || !raza || !precio) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Faltan campos requeridos: nombre, raza, precio' 
        },
        { status: 400 }
      )
    }

    // Este endpoint está deshabilitado para uso externo
    return NextResponse.json(
      { 
        success: false, 
        error: 'Este endpoint está reservado para uso interno' 
      },
      { status: 403 }
    )

  } catch (error) {
    console.error('Error en POST /api/productos:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al procesar solicitud',
        message: error.message 
      },
      { status: 500 }
    )
  }
}
