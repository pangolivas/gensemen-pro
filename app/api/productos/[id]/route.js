import { NextResponse } from 'next/server'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

// GET /api/productos/[id] - Obtener un producto específico por ID
export async function GET(request, { params }) {
  try {
    const { id } = params
    
    console.log('=== GET producto individual ===')
    console.log('ID solicitado:', id)
    
    // Leer el DOCUMENTO gensemen/toros
    const torosDocRef = doc(db, 'gensemen', 'toros')
    const torosDoc = await getDoc(torosDocRef)
    
    if (!torosDoc.exists()) {
      console.log('El documento gensemen/toros no existe')
      return NextResponse.json(
        { 
          success: false, 
          error: 'Productos no encontrados' 
        },
        { status: 404 }
      )
    }
    
    const data = torosDoc.data()
    const toros = data.data || []
    
    console.log('Total toros en documento:', toros.length)
    
    // Buscar el toro por ID (puede ser el id del objeto o el índice)
    let toro = null
    
    // Primero buscar por campo 'id'
    toro = toros.find(t => String(t.id) === String(id))
    
    // Si no se encuentra, buscar por índice
    if (!toro) {
      const index = parseInt(id)
      if (!isNaN(index) && index >= 0 && index < toros.length) {
        toro = toros[index]
      }
    }
    
    // Si aún no se encuentra, buscar por código
    if (!toro) {
      toro = toros.find(t => t.codigo === id)
    }
    
    if (!toro) {
      console.log('Producto no encontrado con ID:', id)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Producto no encontrado' 
        },
        { status: 404 }
      )
    }
    
    console.log('Producto encontrado:', toro.nombre)
    
    // Convertir a formato de producto
    const producto = {
      id: toro.id || id,
      nombre: toro.nombre || '',
      codigo: toro.codigo || '',
      raza: toro.raza || '',
      categoria: toro.raza || '',
      precio: toro.precioVenta || 0,
      descripcion: toro.descripcion || '',
      imagenUrl: toro.fotoUrl || '',
      videoUrl: toro.videoUrl || '',
      disponibleTienda: toro.disponibleTienda || false,
      activo: toro.activo || false,
      // Campos adicionales que puedan existir
      descuentos: toro.descuentos || null
    }

    return NextResponse.json({
      success: true,
      producto: producto
    })

  } catch (error) {
    console.error('Error en GET /api/productos/[id]:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener producto',
        message: error.message 
      },
      { status: 500 }
    )
  }
}
