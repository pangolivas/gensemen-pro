import { NextResponse } from 'next/server'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

// GET /api/pedidos/[id] - Consultar estado de un pedido específico
export async function GET(request, { params }) {
  try {
    const { id } = params
    
    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ID de pedido no proporcionado' 
        },
        { status: 400 }
      )
    }

    // Buscar pedido en Firebase
    const docRef = doc(db, 'pedidos', id)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Pedido no encontrado' 
        },
        { status: 404 }
      )
    }

    const pedido = {
      id: docSnap.id,
      ...docSnap.data()
    }

    return NextResponse.json({
      success: true,
      pedido: pedido
    })

  } catch (error) {
    console.error(`Error en GET /api/pedidos/${params.id}:`, error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener pedido',
        message: error.message 
      },
      { status: 500 }
    )
  }
}
