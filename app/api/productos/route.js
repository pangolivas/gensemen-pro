import { NextResponse } from 'next/server'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'

// GET /api/productos - Listar todos los productos disponibles
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoria = searchParams.get('categoria')
    const disponible = searchParams.get('disponible')
    
    // Query simple sin orderBy para evitar necesidad de índices
    const torosRef = collection(db, 'toros')
    let q = torosRef
    
    // Solo filtrar por disponibleTienda si se solicita
    if (disponible === 'true') {
      q = query(torosRef, where('disponibleTienda', '==', true))
    }
    
    const snapshot = await getDocs(q)
    
    let productos = []
    snapshot.forEach((doc) => {
      const data = doc.data()
      productos.push({
        id: doc.id,
        nombre: data.nombre || '',
        codigo: data.codigo || '',
        raza: data.raza || '',
        categoria: data.raza || '', // Usar raza como categoría
        precio: data.precioVenta || 0,
        descripcion: data.descripcion || '',
        imagenUrl: data.fotoUrl || '',
        videoUrl: data.videoUrl || '',
        disponibleTienda: data.disponibleTienda || false,
        activo: data.activo || false
      })
    })
    
    // Filtrar por categoría/raza en memoria (después de obtener los datos)
    if (categoria && categoria !== 'Todos') {
      productos = productos.filter(p => p.raza === categoria)
    }
    
    // Ordenar por nombre en memoria
    productos.sort((a, b) => a.nombre.localeCompare(b.nombre))

    return NextResponse.json({
      success: true,
      total: productos.length,
      productos: productos
    })

  } catch (error) {
    console.error('Error en GET /api/productos:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener productos',
        message: error.message 
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
