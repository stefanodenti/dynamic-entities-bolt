const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dynamic-entities')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Models
const EntitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  fields: [{
    name: { type: String, required: true },
    type: { type: String, enum: ['string', 'number', 'date', 'array'], required: true },
    required: { type: Boolean, default: false }
  }]
}, { timestamps: true });

const Entity = mongoose.model('Entity', EntitySchema);

// Dynamic Record Schema Generator
const createDynamicModel = (entityName, fields) => {
  const schemaDefinition = {};
  fields.forEach(field => {
    let type;
    switch (field.type) {
      case 'string': type = String; break;
      case 'number': type = Number; break;
      case 'date': type = Date; break;
      case 'array': type = [String]; break;
      default: type = String;
    }
    schemaDefinition[field.name] = {
      type,
      required: field.required
    };
  });

  const schema = new mongoose.Schema(schemaDefinition, { timestamps: true });
  const modelName = `${entityName}_Records`;
  
  // Delete existing model if it exists to prevent OverwriteModelError
  if (mongoose.models[modelName]) {
    delete mongoose.models[modelName];
  }
  
  return mongoose.model(modelName, schema);
};

// Validation middleware
const validateRecord = (entity) => (req, res, next) => {
  const errors = [];
  entity.fields.forEach(field => {
    const value = req.body[field.name];
    if (field.required && (value === undefined || value === null || value === '')) {
      errors.push(`Field '${field.name}' is required`);
    }
    if (value !== undefined && value !== null) {
      switch (field.type) {
        case 'number':
          if (isNaN(value)) {
            errors.push(`Field '${field.name}' must be a number`);
          }
          break;
        case 'date':
          if (isNaN(Date.parse(value))) {
            errors.push(`Field '${field.name}' must be a valid date`);
          }
          break;
        case 'array':
          if (!Array.isArray(value)) {
            errors.push(`Field '${field.name}' must be an array`);
          }
          break;
      }
    }
  });
  
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  next();
};

// Routes
app.post('/api/entities', async (req, res) => {
  try {
    const entity = new Entity(req.body);
    await entity.save();
    res.status(201).json(entity);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/entities', async (req, res) => {
  try {
    const entities = await Entity.find();
    res.json(entities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/entities/:entityId/records', async (req, res) => {
  try {
    const entity = await Entity.findById(req.params.entityId);
    if (!entity) return res.status(404).json({ error: 'Entity not found' });

    const DynamicModel = createDynamicModel(entity.name, entity.fields);
    const records = await DynamicModel.find();
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/entities/:entityId/records', async (req, res) => {
  try {
    const entity = await Entity.findById(req.params.entityId);
    if (!entity) return res.status(404).json({ error: 'Entity not found' });

    const DynamicModel = createDynamicModel(entity.name, entity.fields);
    
    // Apply validation
    const validate = validateRecord(entity);
    await new Promise((resolve, reject) => {
      validate(req, {
        status: (code) => ({
          json: (data) => reject({ code, data })
        })
      }, resolve);
    });
    
    const record = new DynamicModel(req.body);
    await record.save();
    res.status(201).json(record);
  } catch (error) {
    if (error.code === 400) {
      res.status(400).json(error.data);
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

app.put('/api/entities/:entityId/records/:recordId', async (req, res) => {
  try {
    const entity = await Entity.findById(req.params.entityId);
    if (!entity) return res.status(404).json({ error: 'Entity not found' });

    const DynamicModel = createDynamicModel(entity.name, entity.fields);
    
    // Apply validation
    const validate = validateRecord(entity);
    await new Promise((resolve, reject) => {
      validate(req, {
        status: (code) => ({
          json: (data) => reject({ code, data })
        })
      }, resolve);
    });
    
    const record = await DynamicModel.findByIdAndUpdate(
      req.params.recordId,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    res.json(record);
  } catch (error) {
    if (error.code === 400) {
      res.status(400).json(error.data);
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

app.delete('/api/entities/:entityId/records/:recordId', async (req, res) => {
  try {
    const entity = await Entity.findById(req.params.entityId);
    if (!entity) return res.status(404).json({ error: 'Entity not found' });

    const DynamicModel = createDynamicModel(entity.name, entity.fields);
    const record = await DynamicModel.findByIdAndDelete(req.params.recordId);
    
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});