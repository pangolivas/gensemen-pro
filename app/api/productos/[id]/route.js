import { NextResponse } from 'next/server'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

// GET /api/productos/[id] - Obtener detalle de un producto específico
export async function GET(request, { params }) {
  try {
    const { id } = params
    
    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ID de producto no proporcionado' 
        },
        { status: 400 }
      )
    }

    // Buscar producto en Firebase
    const docRef = doc(db, 'inventario', id)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Producto no encontrado' 
        },
        { status: 404 }
      )
    }

    const producto = {
      id: docSnap.id,
      ...docSnap.data()
    }

    return NextResponse.json({
      success: true,
      producto: producto
    })

  } catch (error) {
    console.error(`Error en GET /api/productos/${params.id}:`, error)
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
