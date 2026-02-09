import { NextResponse } from 'next/server'
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'

// GET /api/inventario - Consultar disponibilidad de inventario
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const productoId = searchParams.get('producto_id')
    const minDosis = searchParams.get('min_dosis') || '1'
    
    let q = collection(db, 'inventario')
    
    // Si se especifica un producto específico
    if (productoId) {
      const docRef = doc(db, 'inventario', productoId)
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
        disponible: producto.dosis > 0,
        dosis_disponibles: producto.dosis,
        producto: {
          id: producto.id,
          nombre: producto.nombre,
          dosis: producto.dosis,
          precio: producto.precio
        }
      })
    }
    
    // Listar todos los productos con disponibilidad
    q = query(q, where('dosis', '>=', parseInt(minDosis)))
    
    const snapshot = await getDocs(q)
    
    const inventario = []
    snapshot.forEach((doc) => {
      const data = doc.data()
      inventario.push({
        id: doc.id,
        nombre: data.nombre,
        categoria: data.categoria,
        dosis: data.dosis,
        precio: data.precio,
        disponible: data.dosis > 0
      })
    })

    // Resumen de inventario
    const resumen = {
      total_productos: inventario.length,
      productos_disponibles: inventario.filter(p => p.disponible).length,
      total_dosis: inventario.reduce((sum, p) => sum + (p.dosis || 0), 0)
    }

    return NextResponse.json({
      success: true,
      resumen: resumen,
      inventario: inventario
    })

  } catch (error) {
    console.error('Error en GET /api/inventario:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al consultar inventario',
        message: error.message 
      },
      { status: 500 }
    )
  }
}
