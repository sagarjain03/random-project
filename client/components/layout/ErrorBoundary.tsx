"use client"

import { Component, ReactNode } from "react"
import { Button } from "@/components/ui/button"

interface Props { children: ReactNode }
interface State { hasError: boolean; message: string }

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, message: "" }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <div className="rounded-full bg-red-100 p-4">
          <div className="h-6 w-6 rounded-full bg-red-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Something went wrong</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            {this.state.message || "An unexpected error occurred."}
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => this.setState({ hasError: false, message: "" })}
        >
          Try again
        </Button>
      </div>
    )
  }
}