import { NextResponse } from 'next/server'
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'

// GET /api/productos - Listar todos los productos disponibles
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoria = searchParams.get('categoria')
    const disponible = searchParams.get('disponible') // true/false
    
    // Construir query base
    let q = collection(db, 'toros')
    
    // Filtrar solo productos disponibles para tienda
    if (disponible === 'true') {
      q = query(q, where('disponibleTienda', '==', true))
    }
    
    // Filtrar por categoría si se especifica
    if (categoria && categoria !== 'Todos') {
      q = query(q, where('raza', '==', categoria))
    }
    
    // Ordenar por nombre
    q = query(q, orderBy('nombre', 'asc'))
    
    const snapshot = await getDocs(q)
    
    const productos = []
    snapshot.forEach((doc) => {
      productos.push({
        id: doc.id,
        ...doc.data()
      })
    })

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
    const { nombre, categoria, precio, dosis } = body
    
    if (!nombre || !categoria || !precio || dosis === undefined) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Faltan campos requeridos: nombre, categoria, precio, dosis' 
        },
        { status: 400 }
      )
    }

    // Este endpoint está deshabilitado para uso externo
    // Solo para documentación de la API
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
