import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

// Polyfill for Next.js Web APIs
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder as typeof global.TextDecoder

// Mock Request and Response for Next.js API routes
if (typeof Request === 'undefined') {
  global.Request = class Request {
    url: string
    method: string
    headers: Headers
    body: ReadableStream | null
    private _bodyText: string | null = null

    constructor(input: string | Request, init?: RequestInit) {
      if (typeof input === 'string') {
        this.url = input
        this.method = init?.method || 'GET'
        this.headers = new Headers(init?.headers)
        this.body = null
        if (init?.body) {
          this._bodyText = typeof init.body === 'string' ? init.body : JSON.stringify(init.body)
        }
      } else {
        this.url = input.url
        this.method = input.method
        this.headers = input.headers
        this.body = input.body
      }
    }

    async json() {
      if (this._bodyText) {
        return JSON.parse(this._bodyText)
      }
      return {}
    }

    async text() {
      return this._bodyText || ''
    }
  } as unknown as typeof global.Request
}

if (typeof Response === 'undefined') {
  global.Response = class Response {
    status: number
    statusText: string
    headers: Headers
    body: ReadableStream | null
    private _bodyText: string

    constructor(body?: BodyInit | null, init?: ResponseInit) {
      this.status = init?.status || 200
      this.statusText = init?.statusText || ''
      this.headers = new Headers(init?.headers)
      this.body = null
      if (body === null || body === undefined) {
        this._bodyText = ''
      } else if (typeof body === 'string') {
        this._bodyText = body
      } else {
        this._bodyText = JSON.stringify(body)
      }
    }

    static json(data: unknown, init?: ResponseInit) {
      return new Response(JSON.stringify(data), {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...init?.headers,
        },
      })
    }

    async json() {
      if (!this._bodyText) {
        return null
      }
      return JSON.parse(this._bodyText)
    }

    async text() {
      return this._bodyText
    }
  } as unknown as typeof global.Response
}

if (typeof Headers === 'undefined') {
  global.Headers = class Headers {
    private _headers: Record<string, string> = {}

    constructor(init?: HeadersInit) {
      if (init) {
        if (Array.isArray(init)) {
          init.forEach(([key, value]) => {
            this._headers[key.toLowerCase()] = value
          })
        } else if (init instanceof Headers) {
          init.forEach((value: string, key: string) => {
            this._headers[key.toLowerCase()] = value
          })
        } else {
          Object.entries(init).forEach(([key, value]) => {
            this._headers[key.toLowerCase()] = value
          })
        }
      }
    }

    get(name: string) {
      return this._headers[name.toLowerCase()] || null
    }

    set(name: string, value: string) {
      this._headers[name.toLowerCase()] = value
    }

    has(name: string) {
      return name.toLowerCase() in this._headers
    }

    delete(name: string) {
      delete this._headers[name.toLowerCase()]
    }

    forEach(callback: (value: string, key: string) => void) {
      Object.entries(this._headers).forEach(([key, value]) => {
        callback(value, key)
      })
    }
  } as unknown as typeof global.Headers
}
