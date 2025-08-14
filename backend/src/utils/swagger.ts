import { NextApiRequest, NextApiResponse } from 'next';

export interface SwaggerRoute {
  path: string;
  method: string;
  summary: string;
  description?: string;
  tags: string[];
  security?: { [key: string]: string[] }[];
  parameters?: any[];
  requestBody?: any;
  responses: { [key: string]: any };
}

export interface SwaggerSchema {
  [key: string]: any;
}

export class SwaggerGenerator {
  private routes: SwaggerRoute[] = [];
  private schemas: SwaggerSchema = {};

  addRoute(route: SwaggerRoute) {
    this.routes.push(route);
  }

  addSchema(name: string, schema: any) {
    this.schemas[name] = schema;
  }

  generateSpec(): any {
    return {
      openapi: '3.0.0',
      info: {
        title: 'MRM360 API',
        description: 'API for MRM360 management system',
        version: '1.0.0',
        contact: {
          name: 'MRM360 Team',
          email: 'support@mrm360.com'
        }
      },
      servers: [
        {
          url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
          description: 'Development server'
        }
      ],
      components: {
        securitySchemes: {
          sessionAuth: {
            type: 'apiKey',
            in: 'cookie',
            name: 'session'
          },
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        },
        schemas: this.schemas
      },
      paths: this.generatePaths(),
      tags: [
        { name: 'Authentication', description: 'Authentication endpoints' },
        { name: 'Users', description: 'User management endpoints' },
        { name: 'Teams', description: 'Team management endpoints' },
        { name: 'Events', description: 'Event management endpoints' },
        { name: 'Groups', description: 'Group management endpoints' },
        { name: 'Tasks', description: 'Background task endpoints' }
      ]
    };
  }

  private generatePaths(): any {
    const paths: any = {};
    
    this.routes.forEach(route => {
      if (!paths[route.path]) {
        paths[route.path] = {};
      }
      
      paths[route.path][route.method.toLowerCase()] = {
        summary: route.summary,
        description: route.description,
        tags: route.tags,
        security: route.security,
        parameters: route.parameters || [],
        requestBody: route.requestBody,
        responses: route.responses
      };
    });
    
    return paths;
  }
}

// Create global swagger instance
export const swagger = new SwaggerGenerator();

// Define common schemas
swagger.addSchema('User', {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    email: { type: 'string', format: 'email' },
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    paidStatus: { type: 'boolean' },
    qrCode: { type: 'string' },
    role: { type: 'string', enum: ['admin', 'exec-board', 'member'] },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
  },
  required: ['email', 'firstName', 'lastName', 'role']
});

swagger.addSchema('Team', {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    description: { type: 'string' },
    type: { type: 'string', enum: ['competition', 'development'] },
    subtype: { type: 'string', enum: ['blue', 'red', 'ctf'] },
    groupId: { type: 'string', format: 'uuid' },
    parentTeamId: { type: 'string', format: 'uuid' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
  },
  required: ['name', 'type']
});

swagger.addSchema('Event', {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    title: { type: 'string' },
    description: { type: 'string' },
    startTime: { type: 'string', format: 'date-time' },
    endTime: { type: 'string', format: 'date-time' },
    category: { type: 'string' },
    linkedTeamId: { type: 'string', format: 'uuid' },
    attendanceType: { type: 'string', enum: ['strict', 'soft'] },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
  },
  required: ['title', 'startTime', 'endTime', 'attendanceType']
});

swagger.addSchema('Group', {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    description: { type: 'string' },
    externalId: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
  },
  required: ['name']
});

swagger.addSchema('Error', {
  type: 'object',
  properties: {
    error: { type: 'string' },
    message: { type: 'string' },
    statusCode: { type: 'integer' }
  }
});

swagger.addSchema('Success', {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    message: { type: 'string' },
    data: { type: 'object' }
  }
});

// Add routes to swagger

// Authentication endpoints
swagger.addRoute({
  path: '/api/auth/login',
  method: 'POST',
  summary: 'User authentication',
  description: 'Authenticate user with username/password or OIDC code',
  tags: ['Authentication'],
  requestBody: {
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            username: { type: 'string', description: 'Username or email for password auth' },
            password: { type: 'string', description: 'Password for password auth' },
            code: { type: 'string', description: 'OIDC authorization code' },
            state: { type: 'string', description: 'OIDC state parameter' }
          }
        }
      }
    }
  },
  responses: {
    '200': {
      description: 'Authentication successful',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              token: { type: 'string', description: 'JWT token' },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  email: { type: 'string' },
                  username: { type: 'string' },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  displayName: { type: 'string' },
                  role: { type: 'string' },
                  paidStatus: { type: 'boolean' },
                  authentikGroups: { type: 'array', items: { type: 'string' } }
                }
              }
            }
          }
        }
      }
    },
    '400': {
      description: 'Invalid request or authentication failed'
    },
    '401': {
      description: 'Invalid credentials'
    }
  }
});

swagger.addRoute({
  path: '/api/auth/session',
  method: 'GET',
  summary: 'Get current session',
  description: 'Retrieve the current user session information using JWT token',
  tags: ['Authentication'],
  security: [{ bearerAuth: [] }],
  responses: {
    '200': {
      description: 'Current session data',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  email: { type: 'string' },
                  username: { type: 'string' },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  displayName: { type: 'string' },
                  role: { type: 'string' },
                  paidStatus: { type: 'boolean' },
                  authentikGroups: { type: 'array', items: { type: 'string' } },
                  abilities: { type: 'array', items: { type: 'object' } }
                }
              }
            }
          }
        }
      }
    },
    '401': {
      description: 'No valid token provided'
    }
  }
});

swagger.addRoute({
  path: '/api/auth/logout',
  method: 'POST',
  summary: 'User logout',
  description: 'Logout the current user (frontend handles token cleanup)',
  tags: ['Authentication'],
  responses: {
    '200': {
      description: 'Logout successful'
    }
  }
});

// User profile endpoint
swagger.addRoute({
  path: '/api/user/profile',
  method: 'GET',
  summary: 'Get current user profile',
  description: 'Retrieve the current authenticated user profile',
  tags: ['Users'],
  security: [{ bearerAuth: [] }],
  responses: {
    '200': {
      description: 'User profile data',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              data: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  email: { type: 'string' },
                  username: { type: 'string' },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  role: { type: 'string' },
                  groups: { type: 'array', items: { type: 'string' } }
                }
              }
            }
          }
        }
      }
    },
    '401': {
      description: 'Unauthorized - invalid or missing token',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' }
        }
      }
    }
  }
});

swagger.addRoute({
  path: '/api/auth/logout',
  method: 'POST',
  summary: 'Logout user',
  description: 'Logs out the current user and clears session',
  tags: ['Authentication'],
  security: [{ sessionAuth: [] }],
  responses: {
    '200': {
      description: 'Logout successful',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Success' }
        }
      }
    }
  }
});

swagger.addRoute({
  path: '/api/users',
  method: 'GET',
  summary: 'Get users',
  description: 'Retrieve list of users with optional filtering',
  tags: ['Users'],
  security: [{ sessionAuth: [] }],
  parameters: [
    { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search by name or email' },
    { name: 'paidStatus', in: 'query', schema: { type: 'boolean' }, description: 'Filter by paid status' },
    { name: 'role', in: 'query', schema: { type: 'string', enum: ['admin', 'exec-board', 'member'] }, description: 'Filter by role' },
    { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 }, description: 'Page number' },
    { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100 }, description: 'Items per page' }
  ],
  responses: {
    '200': {
      description: 'List of users',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              users: { type: 'array', items: { $ref: '#/components/schemas/User' } },
              total: { type: 'integer' },
              page: { type: 'integer' },
              limit: { type: 'integer' }
            }
          }
        }
      }
    }
  }
});

swagger.addRoute({
  path: '/api/users',
  method: 'POST',
  summary: 'Create user',
  description: 'Create a new user',
  tags: ['Users'],
  security: [{ sessionAuth: [] }],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            email: { type: 'string', format: 'email' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            role: { type: 'string', enum: ['admin', 'exec-board', 'member'] },
            paidStatus: { type: 'boolean' }
          },
          required: ['email', 'firstName', 'lastName', 'role']
        }
      }
    }
  },
  responses: {
    '201': {
      description: 'User created successfully',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/User' }
        }
      }
    },
    '400': {
      description: 'Bad request',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' }
        }
      }
    }
  }
});

swagger.addRoute({
  path: '/api/users/{id}',
  method: 'GET',
  summary: 'Get user by ID',
  description: 'Retrieve a specific user by ID',
  tags: ['Users'],
  security: [{ sessionAuth: [] }],
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }
  ],
  responses: {
    '200': {
      description: 'User details',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/User' }
        }
      }
    },
    '404': {
      description: 'User not found',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' }
        }
      }
    }
  }
});

swagger.addRoute({
  path: '/api/users/{id}',
  method: 'PUT',
  summary: 'Update user',
  description: 'Update an existing user',
  tags: ['Users'],
  security: [{ sessionAuth: [] }],
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }
  ],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            email: { type: 'string', format: 'email' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            role: { type: 'string', enum: ['admin', 'exec-board', 'member'] },
            paidStatus: { type: 'boolean' }
          }
        }
      }
    }
  },
  responses: {
    '200': {
      description: 'User updated successfully',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/User' }
        }
      }
    },
    '404': {
      description: 'User not found',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' }
        }
      }
    }
  }
});

swagger.addRoute({
  path: '/api/users/{id}',
  method: 'DELETE',
  summary: 'Delete user',
  description: 'Delete a user',
  tags: ['Users'],
  security: [{ sessionAuth: [] }],
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }
  ],
  responses: {
    '200': {
      description: 'User deleted successfully',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Success' }
        }
      }
    },
    '404': {
      description: 'User not found',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' }
        }
      }
    }
  }
});

swagger.addRoute({
  path: '/api/teams',
  method: 'GET',
  summary: 'Get teams',
  description: 'Retrieve list of teams',
  tags: ['Teams'],
  security: [{ sessionAuth: [] }],
  parameters: [
    { name: 'type', in: 'query', schema: { type: 'string', enum: ['competition', 'development'] }, description: 'Filter by team type' },
    { name: 'groupId', in: 'query', schema: { type: 'string', format: 'uuid' }, description: 'Filter by group ID' }
  ],
  responses: {
    '200': {
      description: 'List of teams',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: { $ref: '#/components/schemas/Team' }
          }
        }
      }
    }
  }
});

swagger.addRoute({
  path: '/api/teams',
  method: 'POST',
  summary: 'Create team',
  description: 'Create a new team',
  tags: ['Teams'],
  security: [{ sessionAuth: [] }],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            type: { type: 'string', enum: ['competition', 'development'] },
            subtype: { type: 'string', enum: ['blue', 'red', 'ctf'] },
            groupId: { type: 'string', format: 'uuid' },
            parentTeamId: { type: 'string', format: 'uuid' }
          },
          required: ['name', 'type']
        }
      }
    }
  },
  responses: {
    '201': {
      description: 'Team created successfully',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Team' }
        }
      }
    }
  }
});

swagger.addRoute({
  path: '/api/events',
  method: 'GET',
  summary: 'Get events',
  description: 'Retrieve list of events',
  tags: ['Events'],
  security: [{ sessionAuth: [] }],
  parameters: [
    { name: 'category', in: 'query', schema: { type: 'string' }, description: 'Filter by category' },
    { name: 'linkedTeamId', in: 'query', schema: { type: 'string', format: 'uuid' }, description: 'Filter by linked team' },
    { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Filter by start date' },
    { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Filter by end date' }
  ],
  responses: {
    '200': {
      description: 'List of events',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: { $ref: '#/components/schemas/Event' }
          }
        }
      }
    }
  }
});

swagger.addRoute({
  path: '/api/events',
  method: 'POST',
  summary: 'Create event',
  description: 'Create a new event',
  tags: ['Events'],
  security: [{ sessionAuth: [] }],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            startTime: { type: 'string', format: 'date-time' },
            endTime: { type: 'string', format: 'date-time' },
            category: { type: 'string' },
            linkedTeamId: { type: 'string', format: 'uuid' },
            attendanceType: { type: 'string', enum: ['strict', 'soft'] }
          },
          required: ['title', 'startTime', 'endTime', 'attendanceType']
        }
      }
    }
  },
  responses: {
    '201': {
      description: 'Event created successfully',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Event' }
        }
      }
    }
  }
});

swagger.addRoute({
  path: '/api/groups',
  method: 'GET',
  summary: 'Get groups',
  description: 'Retrieve list of Authentik groups',
  tags: ['Groups'],
  security: [{ sessionAuth: [] }],
  responses: {
    '200': {
      description: 'List of groups',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: { $ref: '#/components/schemas/Group' }
          }
        }
      }
    }
  }
});

swagger.addRoute({
  path: '/api/tasks/enqueue',
  method: 'POST',
  summary: 'Enqueue background task',
  description: 'Enqueue a background task for processing',
  tags: ['Tasks'],
  security: [{ sessionAuth: [] }],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            taskType: { type: 'string', enum: ['sendEmail', 'generateQRCode', 'syncGroups'] },
            data: { type: 'object', description: 'Task-specific data' }
          },
          required: ['taskType', 'data']
        }
      }
    }
  },
  responses: {
    '200': {
      description: 'Task enqueued successfully',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              jobId: { type: 'string' },
              message: { type: 'string' }
            }
          }
        }
      }
    }
  }
});

export default swagger;
