const express = require('express');
const { body, validationResult } = require('express-validator');
const Board = require('../models/Board');
const Task = require('../models/Task');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/boards
// @desc    Get all boards for authenticated user
// @access  Private
router.get('/boards', auth, async (req, res) => {
  try {
    const boards = await Board.find({
      $or: [
        { createdBy: req.user._id },
        { 'members.user': req.user._id }
      ],
      isActive: true
    })
    .populate('createdBy', 'name email')
    .populate('members.user', 'name email')
    .sort({ createdAt: -1 });

    // Get task counts for each board
    const boardsWithStats = await Promise.all(
      boards.map(async (board) => {
        const taskStats = await Task.aggregate([
          { $match: { boardId: board._id, isActive: true } },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ]);

        const stats = {
          total: 0,
          todo: 0,
          inprogress: 0,
          done: 0
        };

        taskStats.forEach(stat => {
          stats[stat._id] = stat.count;
          stats.total += stat.count;
        });

        return {
          ...board.toObject(),
          stats
        };
      })
    );

    res.json({
      success: true,
      count: boardsWithStats.length,
      boards: boardsWithStats
    });

  } catch (error) {
    console.error('Get boards error:', error);
    res.status(500).json({ 
      message: 'Error fetching boards',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/boards/:id
// @desc    Get specific board with tasks
// @access  Private
router.get('/boards/:id', auth, async (req, res) => {
  try {
    const board = await Board.findOne({
      _id: req.params.id,
      $or: [
        { createdBy: req.user._id },
        { 'members.user': req.user._id },
        { isPublic: true }
      ],
      isActive: true
    })
    .populate('createdBy', 'name email')
    .populate('members.user', 'name email');

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Get tasks for this board
    const tasks = await Task.find({ 
      boardId: req.params.id, 
      isActive: true 
    })
    .populate('createdBy', 'name email')
    .populate('assignedTo', 'name email')
    .populate('comments.author', 'name email')
    .sort({ position: 1, createdAt: -1 });

    // Group tasks by status
    const tasksByStatus = {
      todo: tasks.filter(task => task.status === 'todo'),
      inprogress: tasks.filter(task => task.status === 'inprogress'),
      done: tasks.filter(task => task.status === 'done')
    };

    res.json({
      success: true,
      board,
      tasks: tasksByStatus,
      totalTasks: tasks.length
    });

  } catch (error) {
    console.error('Get board error:', error);
    res.status(500).json({ 
      message: 'Error fetching board',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/boards
// @desc    Create a new board
// @access  Private
router.post('/boards', [
  auth,
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Board title must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
  body('color')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Color must be a valid hex color')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, description, isPublic = false, color = '#3B82F6' } = req.body;

    const board = new Board({
      title,
      description,
      createdBy: req.user._id,
      isPublic,
      color
    });

    await board.save();
    await board.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Board created successfully',
      board
    });

  } catch (error) {
    console.error('Create board error:', error);
    res.status(500).json({ 
      message: 'Error creating board',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   PATCH /api/boards/:id
// @desc    Update board
// @access  Private
router.patch('/boards/:id', [
  auth,
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Board title must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
  body('color')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Color must be a valid hex color')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const board = await Board.findOne({
      _id: req.params.id,
      $or: [
        { createdBy: req.user._id },
        { 'members.user': req.user._id, 'members.role': { $in: ['owner', 'admin'] } }
      ]
    });

    if (!board) {
      return res.status(404).json({ message: 'Board not found or access denied' });
    }

    // Update allowed fields
    const allowedUpdates = ['title', 'description', 'isPublic', 'color'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        board[field] = req.body[field];
      }
    });

    await board.save();
    await board.populate('createdBy', 'name email');
    await board.populate('members.user', 'name email');

    res.json({
      success: true,
      message: 'Board updated successfully',
      board
    });

  } catch (error) {
    console.error('Update board error:', error);
    res.status(500).json({ 
      message: 'Error updating board',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   DELETE /api/boards/:id
// @desc    Delete board (soft delete)
// @access  Private
router.delete('/boards/:id', auth, async (req, res) => {
  try {
    const board = await Board.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!board) {
      return res.status(404).json({ message: 'Board not found or access denied' });
    }

    board.isActive = false;
    await board.save();

    // Also soft delete all tasks in this board
    await Task.updateMany(
      { boardId: req.params.id },
      { isActive: false }
    );

    res.json({
      success: true,
      message: 'Board deleted successfully'
    });

  } catch (error) {
    console.error('Delete board error:', error);
    res.status(500).json({ 
      message: 'Error deleting board',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;