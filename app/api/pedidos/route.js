import { NextResponse } from 'next/server'
import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore'
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

// POST /api/pedidos - Crear nuevo pedido
export async function POST(request) {
  try {
    const body = await request.json()
    
    // Validar campos requeridos
    const { cliente, items, total } = body
    
    if (!cliente || !cliente.nombre || !cliente.email || !cliente.telefono) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Faltan datos del cliente (nombre, email, telefono)' 
        },
        { 
          status: 400,
          headers: corsHeaders 
        }
      )
    }
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'El pedido debe tener al menos un producto' 
        },
        { 
          status: 400,
          headers: corsHeaders 
        }
      )
    }
    
    if (typeof total !== 'number' || total <= 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'El total del pedido es inválido' 
        },
        { 
          status: 400,
          headers: corsHeaders 
        }
      )
    }
    
    // Crear el pedido en Firebase
    const pedido = {
      cliente: {
        nombre: cliente.nombre,
        email: cliente.email,
        telefono: cliente.telefono
      },
      items: items,
      total: total,
      notas: body.notas || '',
      estado: 'pendiente',
      fecha: new Date().toISOString(),
      origen: 'landing_page'
    }
    
    const pedidosRef = collection(db, 'pedidos')
    const docRef = await addDoc(pedidosRef, pedido)
    
    console.log('Pedido creado:', docRef.id)
    
    return NextResponse.json(
      {
        success: true,
        pedidoId: docRef.id,
        message: 'Pedido creado exitosamente'
      },
      { 
        status: 201,
        headers: corsHeaders 
      }
    )
    
  } catch (error) {
    console.error('Error en POST /api/pedidos:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al crear el pedido',
        message: error.message 
      },
      { 
        status: 500,
        headers: corsHeaders 
      }
    )
  }
}

// GET /api/pedidos - Listar pedidos (uso interno)
export async function GET(request) {
  try {
    const pedidosRef = collection(db, 'pedidos')
    const q = query(pedidosRef, orderBy('fecha', 'desc'), limit(50))
    const snapshot = await getDocs(q)
    
    const pedidos = []
    snapshot.forEach((doc) => {
      pedidos.push({
        id: doc.id,
        ...doc.data()
      })
    })
    
    return NextResponse.json(
      {
        success: true,
        total: pedidos.length,
        pedidos: pedidos
      },
      { headers: corsHeaders }
    )
    
  } catch (error) {
    console.error('Error en GET /api/pedidos:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener pedidos',
        message: error.message 
      },
      { 
        status: 500,
        headers: corsHeaders 
      }
    )
  }
}
