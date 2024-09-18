const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');
const swaggerJsDoc = require('swagger-jsdoc');  // Import swagger-jsdoc
const swaggerUi = require('swagger-ui-express'); // Import swagger-ui-express

// Load environment variables
dotenv.config();

// Initialize the app
const app = express();
app.use(express.json());  // For parsing JSON bodies

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');

    // Start server only after successful connection to MongoDB
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1); // Exit the process with a failure code
  });

// Swagger definition
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'User Management API',
      version: '1.0.0',
      description: 'User Management System API with CRUD operations and profile management'
    },
    servers: [
      {
        url: 'http://localhost:5000',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{
      BearerAuth: []
    }]
  },
  apis: ['./routes/*.js'],  // Path to your route files where Swagger annotations are added
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


// Routes
app.use('/api/users', userRoutes);
