import { NextResponse } from 'next/server'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

// Configurar cabeceras CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// Manejar peticiones OPTIONS (preflight)
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

// GET /api/pedidos/[id] - Obtener estado de un pedido
export async function GET(request, { params }) {
  try {
    const { id } = params
    
    console.log('=== GET pedido:', id, '===')
    
    const pedidoRef = doc(db, 'pedidos', id)
    const pedidoDoc = await getDoc(pedidoRef)
    
    if (!pedidoDoc.exists()) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Pedido no encontrado' 
        },
        { 
          status: 404,
          headers: corsHeaders 
        }
      )
    }
    
    const pedido = {
      id: pedidoDoc.id,
      ...pedidoDoc.data()
    }
    
    return NextResponse.json(
      {
        success: true,
        pedido: pedido
      },
      { headers: corsHeaders }
    )
    
  } catch (error) {
    console.error('Error en GET /api/pedidos/[id]:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener el pedido',
        message: error.message 
      },
      { 
        status: 500,
        headers: corsHeaders 
      }
    )
  }
}
