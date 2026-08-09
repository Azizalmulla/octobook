import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { AppError } from './errors'

export function jsonOk(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, init)
}

export function jsonError(error: unknown) {
  if (error instanceof ZodError) {
    const flat = error.flatten()
    const fields: Record<string, string> = {}
    for (const [key, messages] of Object.entries(flat.fieldErrors)) {
      const list = messages as string[] | undefined
      if (list?.[0]) fields[key] = list[0]
    }
    return NextResponse.json(
      {
        error: 'VALIDATION_FAILED',
        fields,
        message: 'Request validation failed',
      },
      { status: 400 },
    )
  }

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.code ?? 'APP_ERROR',
        message: error.message,
        details: error.details,
      },
      { status: error.statusCode },
    )
  }

  console.error(error)
  return NextResponse.json(
    {
      error: 'INTERNAL_ERROR',
      message: 'Internal server error',
    },
    { status: 500 },
  )
}
