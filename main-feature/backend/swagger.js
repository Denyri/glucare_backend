const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'GluCare API',
    description: 'API Documentation for GluCare Backend',
  },
  host: 'glucare.my.id',
  schemes: ['https', 'http'],
  securityDefinitions: {
      bearerAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'Authorization',
          description: 'Enter your bearer token in the format **Bearer &lt;token>**'
      }
  }
};

const outputFile = './swagger_output.json';
const endpointsFiles = ['./server.js'];

swaggerAutogen(outputFile, endpointsFiles, doc);
