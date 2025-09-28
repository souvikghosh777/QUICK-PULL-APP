const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Board title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  color: {
    type: String,
    default: '#3B82F6' // Default blue color
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Add creator as owner when board is created
boardSchema.pre('save', function(next) {
  if (this.isNew) {
    this.members.push({
      user: this.createdBy,
      role: 'owner'
    });
  }
  next();
});

// Virtual for task count
boardSchema.virtual('taskCount', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'boardId',
  count: true
});

boardSchema.set('toJSON', { virtuals: true });
boardSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Board', boardSchema);