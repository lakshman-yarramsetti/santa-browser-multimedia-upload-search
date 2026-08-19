export const openapiDefinition = {
  openapi: '3.0.3',

  info: {
    title: 'Santa Multimedia Upload & Search API',
    version: '1.0.0',
    description:
      'Authenticated multimedia upload, preview, search, and ranking API.',
  },

  servers: [{ url: '/api' }],

  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'accessToken',
        description: 'The accessToken cookie authenticates protected operations. Registration, login, and refresh set HTTP-only accessToken and refreshToken cookies.',
      },
    },

    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
        },
      },

      Media: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          originalFilename: { type: 'string' },
          cloudinaryUrl: { type: 'string', format: 'uri' },
          resourceType: {
            type: 'string',
            enum: ['image', 'video', 'audio', 'pdf'],
          },
          mimeType: { type: 'string' },
          fileSize: { type: 'number' },
          tags: {
            type: 'array',
            items: { type: 'string' },
          },
          uploadedAt: {
            type: 'string',
            format: 'date-time',
          },
          viewCount: { type: 'number' },
          relevanceScore: { type: 'number' },
        },
      },

      Error: {
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },

      AuthResponse: {
        type: 'object',
        required: ['user'],
        properties: {
          user: { $ref: '#/components/schemas/User' },
        },
      },

      MediaResponse: {
        type: 'object',
        required: ['media'],
        properties: {
          media: { $ref: '#/components/schemas/Media' },
        },
      },

      MediaListResponse: {
        type: 'object',
        required: ['media'],
        properties: {
          media: {
            type: 'array',
            items: { $ref: '#/components/schemas/Media' },
          },
        },
      },

      SearchResponse: {
        type: 'object',
        required: ['query', 'media', 'count'],
        properties: {
          query: { type: 'string' },
          count: { type: 'integer', minimum: 0 },
          media: {
            type: 'array',
            items: { $ref: '#/components/schemas/Media' },
          },
        },
      },

      HealthResponse: {
        type: 'object',
        required: ['status'],
        properties: {
          status: { type: 'string', example: 'ok' },
        },
      },
  },
    },

  paths: {
    '/auth/register': {
      post: {
        summary: 'Register a user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  password: {
                    type: 'string',
                    format: 'password',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Registered and signed in; HTTP-only cookies are set.', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
          400: { description: 'Invalid input', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          409: { description: 'Email already registered', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          429: { description: 'Too many authentication requests', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Unexpected server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },

    '/auth/login': {
      post: {
        summary: 'Sign in',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string' },
                  password: {
                    type: 'string',
                    format: 'password',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Signed in; HTTP-only cookies are set.', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
          401: { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          429: { description: 'Too many authentication requests', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Unexpected server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },

    '/auth/refresh': {
      post: {
        summary: 'Rotate refresh token and issue access token',
        responses: {
          200: { description: 'Session refreshed; refresh token is rotated.', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
          401: { description: 'Invalid or expired refresh token', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          429: { description: 'Too many authentication requests', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Unexpected server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },

    '/auth/logout': {
      post: {
        summary: 'Sign out and revoke current refresh token',
        security: [{ cookieAuth: [] }],
        responses: {
          204: { description: 'Signed out' },
          401: { description: 'Unauthenticated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          429: { description: 'Too many authentication requests', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Unexpected server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },

    '/auth/me': {
      get: {
        summary: 'Get current user',
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: 'Current user',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: {
                      $ref: '#/components/schemas/User',
                    },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthenticated' },
          429: { description: 'Too many authentication requests', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Unexpected server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },

    '/media/upload': {
      post: {
        summary: 'Upload one media file (JPEG, PNG, GIF, WebP, MP4, MOV, WebM, MP3, WAV, OGG, or PDF; maximum 25 MB)',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['file'],
                properties: {
                  file: {
                    type: 'string',
                    format: 'binary',
                  },
                  tags: {
                    type: 'string',
                    example: 'travel, summer',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Uploaded',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    media: {
                      $ref: '#/components/schemas/Media',
                    },
                  },
                },
              },
            },
          },
          400: { description: 'Invalid upload, unsupported MIME type, oversized file, or invalid tags', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          401: { description: 'Unauthenticated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          429: { description: 'Too many upload requests', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Unexpected server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },

    '/media': {
      get: {
        summary: "List the current user's uploads",
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: 'Owned media library', content: { 'application/json': { schema: { $ref: '#/components/schemas/MediaListResponse' } } } },
          401: { description: 'Unauthenticated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Unexpected server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },

    '/media/search': {
      get: {
        summary:
          "Search the current user's files by filename and tags",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: 'query',
            in: 'query',
            required: true,
            description: 'A non-empty filename or tag substring, 80 characters or fewer.', schema: { type: 'string', minLength: 1, maxLength: 80 },
          },
        ],
        responses: {
          200: { description: 'Ranked owned media results', content: { 'application/json': { schema: { $ref: '#/components/schemas/SearchResponse' } } } },
          400: { description: 'Missing or invalid query', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          401: { description: 'Unauthenticated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          429: { description: 'Too many search requests', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Unexpected server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },

    '/media/{id}': {
      get: {
        summary: 'Get an owned media record',
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Owned media',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    media: {
                      $ref: '#/components/schemas/Media',
                    },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthenticated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Not found or not owned', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Unexpected server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },

    '/media/{id}/view': {
      post: {
        summary: 'Record a preview view for owned media',
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description:
              'Updated media with incremented view count',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    media: {
                      $ref: '#/components/schemas/Media',
                    },
                  },
                },
              },
            },
          },
          401: { description: 'Unauthenticated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Not found or not owned', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          429: { description: 'Too many view requests', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Unexpected server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/health': {
      get: {
        summary: 'API health check',
        responses: {
          200: {
            description: 'API is available',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/HealthResponse' },
              },
            },
          },
          500: { description: 'Unexpected server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
  },
};
