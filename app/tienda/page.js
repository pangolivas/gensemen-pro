'use client'

import { useState, useEffect } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import Image from 'next/image'
import Link from 'next/link'

export default function TiendaPage() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todos')

  useEffect(() => {
    cargarProductos()
  }, [])

  const cargarProductos = async () => {
    try {
      setLoading(true)
      
      // Cargar inventario disponible desde Firebase
      const inventarioRef = collection(db, 'inventario')
      const q = query(inventarioRef, where('dosis', '>', 0))
      const snapshot = await getDocs(q)
      
      const productosData = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        productosData.push({
          id: doc.id,
          ...data
        })
      })

      setProductos(productosData)
    } catch (error) {
      console.error('Error cargando productos:', error)
    } finally {
      setLoading(false)
    }
  }

  const categorias = ['Todos', ...new Set(productos.map(p => p.categoria || 'Sin categoría'))]

  const productosFiltrados = categoriaFiltro === 'Todos' 
    ? productos 
    : productos.filter(p => (p.categoria || 'Sin categoría') === categoriaFiltro)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando productos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-emerald-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">La Lagartija Cattle Co.</h1>
              <p className="text-emerald-200 mt-1">Tienda Online - Genética Bovina Premium</p>
            </div>
            <Link 
              href="/app" 
              className="bg-emerald-600 hover:bg-emerald-500 px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Gestión Interna
            </Link>
          </div>
        </div>
      </header>

      {/* Filtros */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex gap-2 overflow-x-auto">
            {categorias.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoriaFiltro(cat)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  categoriaFiltro === cat
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid de Productos */}
      <div className="container mx-auto px-4 py-8">
        {productosFiltrados.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No hay productos disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productosFiltrados.map((producto) => (
              <div key={producto.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                {/* Imagen del producto */}
                {producto.imagenUrl ? (
                  <div className="relative h-48 bg-gray-200">
                    <Image
                      src={producto.imagenUrl}
                      alt={producto.nombre}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center">
                    <svg className="w-16 h-16 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}

                {/* Información del producto */}
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-2">
                    {producto.nombre}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">
                    {producto.categoria || 'Sin categoría'}
                  </p>
                  
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-emerald-700 font-bold text-xl">
                      ${producto.precio?.toLocaleString() || '0'}
                    </span>
                    <span className={`text-sm font-medium ${
                      producto.dosis > 10 ? 'text-emerald-600' : 'text-orange-600'
                    }`}>
                      {producto.dosis} dosis
                    </span>
                  </div>

                  <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded-lg transition-colors">
                    Agregar al Carrito
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-16">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-gray-400">
            © 2026 La Lagartija Cattle Co. - Todos los derechos reservados
          </p>
        </div>
      </footer>
    </div>
  )
}
