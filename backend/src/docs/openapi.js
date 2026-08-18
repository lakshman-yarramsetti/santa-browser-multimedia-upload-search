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
          201: { description: 'Registered and signed in' },
          400: { description: 'Invalid input' },
          409: { description: 'Email already registered' },
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
          200: { description: 'Signed in' },
          401: { description: 'Invalid credentials' },
        },
      },
    },

    '/auth/refresh': {
      post: {
        summary: 'Rotate refresh token and issue access token',
        responses: {
          200: { description: 'Session refreshed' },
          401: { description: 'Invalid refresh token' },
        },
      },
    },

    '/auth/logout': {
      post: {
        summary: 'Sign out and revoke current refresh token',
        security: [{ cookieAuth: [] }],
        responses: {
          204: { description: 'Signed out' },
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
        },
      },
    },

    '/media/upload': {
      post: {
        summary: 'Upload one media file',
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
          400: { description: 'Invalid upload' },
        },
      },
    },

    '/media': {
      get: {
        summary: "List the current user's uploads",
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: 'Owned media library' },
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
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: { description: 'Ranked owned media results' },
          400: { description: 'Invalid query' },
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
          404: { description: 'Not found or not owned' },
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
          404: { description: 'Not found or not owned' },
        },
      },
    },
  },
};