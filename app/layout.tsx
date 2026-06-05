import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'Artfix | Portal Comercial 2026',
    description: 'Portal Comercial Artfix - PWR Gestão',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
          <html lang="pt-BR">
                <body>{children}</body>body>
          </html>html>
        )
}</html>
