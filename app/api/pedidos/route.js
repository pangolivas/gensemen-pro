import { NextResponse } from 'next/server'
import { collection, addDoc, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

// POST /api/pedidos - Crear nuevo pedido desde tienda online
export async function POST(request) {
  try {
    const body = await request.json()
    
    // Validar campos requeridos
    const { cliente, productos, total, metodoPago } = body
    
    if (!cliente || !productos || !total || !metodoPago) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Faltan campos requeridos: cliente, productos, total, metodoPago' 
        },
        { status: 400 }
      )
    }

    // Validar estructura de cliente
    if (!cliente.nombre || !cliente.email || !cliente.telefono) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Datos de cliente incompletos. Se requiere: nombre, email, telefono' 
        },
        { status: 400 }
      )
    }

    // Validar que productos sea un array con al menos 1 item
    if (!Array.isArray(productos) || productos.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'El pedido debe contener al menos un producto' 
        },
        { status: 400 }
      )
    }

    // Validar estructura de cada producto
    for (const producto of productos) {
      if (!producto.id || !producto.nombre || !producto.cantidad || !producto.precio) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Cada producto debe tener: id, nombre, cantidad, precio' 
          },
          { status: 400 }
        )
      }
    }

    // Crear objeto de pedido
    const nuevoPedido = {
      // Información del cliente
      cliente: {
        nombre: cliente.nombre,
        email: cliente.email,
        telefono: cliente.telefono,
        direccion: cliente.direccion || '',
        rfc: cliente.rfc || ''
      },
      
      // Productos del pedido
      productos: productos.map(p => ({
        id: p.id,
        nombre: p.nombre,
        cantidad: p.cantidad,
        precio: p.precio,
        subtotal: p.cantidad * p.precio
      })),
      
      // Totales
      total: total,
      
      // Información de pago
      metodoPago: metodoPago,
      estadoPago: 'pendiente',
      
      // Información del pedido
      estado: 'pendiente',
      origen: 'tienda_online',
      
      // Fechas
      fechaCreacion: Timestamp.now(),
      fechaActualizacion: Timestamp.now(),
      
      // Notas
      notas: body.notas || ''
    }

    // Guardar en Firebase
    const docRef = await addDoc(collection(db, 'pedidos'), nuevoPedido)

    return NextResponse.json({
      success: true,
      message: 'Pedido creado exitosamente',
      pedido: {
        id: docRef.id,
        ...nuevoPedido
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error en POST /api/pedidos:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al crear pedido',
        message: error.message 
      },
      { status: 500 }
    )
  }
}

// GET /api/pedidos - Listar pedidos (con filtros opcionales)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const estado = searchParams.get('estado')
    const clienteEmail = searchParams.get('cliente_email')
    
    let q = collection(db, 'pedidos')
    
    // Filtrar por estado si se especifica
    if (estado) {
      q = query(q, where('estado', '==', estado))
    }
    
    // Filtrar por email de cliente si se especifica
    if (clienteEmail) {
      q = query(q, where('cliente.email', '==', clienteEmail))
    }
    
    // Ordenar por fecha de creación (más recientes primero)
    q = query(q, orderBy('fechaCreacion', 'desc'))
    
    const snapshot = await getDocs(q)
    
    const pedidos = []
    snapshot.forEach((doc) => {
      pedidos.push({
        id: doc.id,
        ...doc.data()
      })
    })

    return NextResponse.json({
      success: true,
      total: pedidos.length,
      pedidos: pedidos
    })

  } catch (error) {
    console.error('Error en GET /api/pedidos:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener pedidos',
        message: error.message 
      },
      { status: 500 }
    )
  }
}
