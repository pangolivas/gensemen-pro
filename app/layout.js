import './globals.css'

export const metadata = {
  title: 'GENSEMEN PRO - La Lagartija Cattle Co.',
  description: 'Sistema de gestión de inventario de semen bovino',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
