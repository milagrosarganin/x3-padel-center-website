"use client"

import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ErrorBoundaryProps {
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error, errorInfo: null }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("ErrorBoundary caught an error:", error, errorInfo)
    this.setState({ errorInfo })
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950 p-4">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <CardTitle className="text-red-500">¡Algo salió mal!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                Lo sentimos, ha ocurrido un error inesperado. Por favor, intenta recargar la página.
              </p>
              {this.state.error && (
                <details className="text-sm text-gray-600 dark:text-gray-400">
                  <summary>Detalles del error</summary>
                  <pre className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md text-left overflow-auto">
                    {this.state.error.toString()}
                    <br />
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
              <Button onClick={() => window.location.reload()}>Recargar Página</Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
