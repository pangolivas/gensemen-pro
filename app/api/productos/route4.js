import { NextResponse } from 'next/server'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

// Configurar cabeceras CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// Manejar peticiones OPTIONS (preflight)
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

// GET /api/productos - Listar todos los productos disponibles
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoria = searchParams.get('categoria')
    const disponible = searchParams.get('disponible')
    
    console.log('=== LEYENDO DOCUMENTO toros ===')
    
    // Leer el DOCUMENTO gensemen/toros
    const torosDocRef = doc(db, 'gensemen', 'toros')
    const torosDoc = await getDoc(torosDocRef)
    
    if (!torosDoc.exists()) {
      console.log('El documento gensemen/toros no existe')
      return NextResponse.json(
        {
          success: true,
          total: 0,
          productos: []
        },
        { headers: corsHeaders }
      )
    }
    
    const data = torosDoc.data()
    console.log('Documento leído. Campos:', Object.keys(data))
    
    // El array de toros está en el campo "data"
    let toros = data.data || []
    console.log('Total toros en array:', toros.length)
    
    // Filtrar por disponibleTienda si se solicita
    if (disponible === 'true') {
      toros = toros.filter(toro => toro.disponibleTienda === true)
      console.log('Toros después de filtrar por disponibleTienda:', toros.length)
    }
    
    // Filtrar por raza/categoría si se especifica
    if (categoria && categoria !== 'Todos') {
      toros = toros.filter(toro => toro.raza === categoria)
      console.log('Toros después de filtrar por categoría:', toros.length)
    }
    
    // Convertir a formato de productos
    const productos = toros.map((toro, index) => ({
      id: toro.id || String(index),
      nombre: toro.nombre || '',
      codigo: toro.codigo || '',
      raza: toro.raza || '',
      categoria: toro.raza || '',
      precio: toro.precioVenta || 0,
      descripcion: toro.descripcion || '',
      imagenUrl: toro.fotoUrl || '',
      videoUrl: toro.videoUrl || '',
      disponibleTienda: toro.disponibleTienda || false,
      activo: toro.activo || false
    }))
    
    // Ordenar por nombre
    productos.sort((a, b) => a.nombre.localeCompare(b.nombre))
    
    console.log('=== RESPUESTA FINAL ===')
    console.log('Total productos a devolver:', productos.length)

    return NextResponse.json(
      {
        success: true,
        total: productos.length,
        productos: productos
      },
      { headers: corsHeaders }
    )

  } catch (error) {
    console.error('Error en GET /api/productos:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener productos',
        message: error.message
      },
      { 
        status: 500,
        headers: corsHeaders 
      }
    )
  }
}

// POST /api/productos - Crear nuevo producto (para uso interno)
export async function POST(request) {
  try {
    const body = await request.json()
    
    const { nombre, raza, precio } = body
    
    if (!nombre || !raza || !precio) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Faltan campos requeridos: nombre, raza, precio' 
        },
        { 
          status: 400,
          headers: corsHeaders 
        }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Este endpoint está reservado para uso interno' 
      },
      { 
        status: 403,
        headers: corsHeaders 
      }
    )

  } catch (error) {
    console.error('Error en POST /api/productos:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al procesar solicitud',
        message: error.message 
      },
      { 
        status: 500,
        headers: corsHeaders 
      }
    )
  }
}
