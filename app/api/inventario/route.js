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

// GET /api/inventario - Obtener disponibilidad de inventario
export async function GET(request) {
  try {
    console.log('=== GET inventario ===')
    
    // Leer el DOCUMENTO gensemen/toros
    const torosDocRef = doc(db, 'gensemen', 'toros')
    const torosDoc = await getDoc(torosDocRef)
    
    if (!torosDoc.exists()) {
      return NextResponse.json(
        {
          success: true,
          inventario: []
        },
        { headers: corsHeaders }
      )
    }
    
    const data = torosDoc.data()
    const toros = data.data || []
    
    // Mapear a formato de inventario simplificado
    const inventario = toros
      .filter(toro => toro.disponibleTienda === true)
      .map(toro => ({
        codigo: toro.codigo,
        nombre: toro.nombre,
        disponible: toro.activo === true,
        cantidad: toro.dosis || 0
      }))
    
    return NextResponse.json(
      {
        success: true,
        inventario: inventario
      },
      { headers: corsHeaders }
    )
    
  } catch (error) {
    console.error('Error en GET /api/inventario:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener inventario',
        message: error.message 
      },
      { 
        status: 500,
        headers: corsHeaders 
      }
    )
  }
}
