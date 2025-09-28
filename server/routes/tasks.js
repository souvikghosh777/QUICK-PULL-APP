const express = require('express');
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const Board = require('../models/Board');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/boards/:boardId/tasks
// @desc    Create a new task in a board
// @access  Private
router.post('/boards/:boardId/tasks', [
  auth,
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Task title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('status')
    .optional()
    .isIn(['todo', 'inprogress', 'done'])
    .withMessage('Status must be todo, inprogress, or done'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be low, medium, high, or urgent'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  body('assignedTo')
    .optional()
    .isMongoId()
    .withMessage('Assigned user must be a valid user ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { boardId } = req.params;
    const { title, description, status = 'todo', priority = 'medium', dueDate, assignedTo, tags } = req.body;

    // Check if user has access to the board
    const board = await Board.findOne({
      _id: boardId,
      $or: [
        { createdBy: req.user._id },
        { 'members.user': req.user._id }
      ],
      isActive: true
    });

    if (!board) {
      return res.status(404).json({ message: 'Board not found or access denied' });
    }

    // Get the highest position for new task
    const lastTask = await Task.findOne({ boardId, status })
      .sort({ position: -1 })
      .limit(1);
    
    const position = lastTask ? lastTask.position + 1 : 0;

    const task = new Task({
      title,
      description,
      status,
      priority,
      boardId,
      createdBy: req.user._id,
      assignedTo: assignedTo || req.user._id,
      dueDate: dueDate ? new Date(dueDate) : null,
      tags: tags || [],
      position
    });

    await task.save();
    await task.populate('createdBy', 'name email');
    await task.populate('assignedTo', 'name email');

    // Emit socket event for real-time updates
    if (req.io) {
      req.io.to(`board_${boardId}`).emit('task-created', {
        task,
        boardId
      });
    }

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task
    });

  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ 
      message: 'Error creating task',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   PATCH /api/tasks/:id
// @desc    Update task
// @access  Private
router.patch('/tasks/:id', [
  auth,
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Task title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('status')
    .optional()
    .isIn(['todo', 'inprogress', 'done'])
    .withMessage('Status must be todo, inprogress, or done'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be low, medium, high, or urgent'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  body('assignedTo')
    .optional()
    .isMongoId()
    .withMessage('Assigned user must be a valid user ID'),
  body('position')
    .optional()
    .isNumeric()
    .withMessage('Position must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const task = await Task.findById(req.params.id)
      .populate('boardId')
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has permission to update this task
    const hasPermission = 
      task.createdBy._id.toString() === req.user._id.toString() ||
      (task.assignedTo && task.assignedTo._id.toString() === req.user._id.toString()) ||
      task.boardId.createdBy.toString() === req.user._id.toString();

    if (!hasPermission) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    // Update allowed fields
    const allowedUpdates = ['title', 'description', 'status', 'priority', 'dueDate', 'assignedTo', 'tags', 'position'];
    const oldStatus = task.status;
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'dueDate' && req.body[field]) {
          task[field] = new Date(req.body[field]);
        } else {
          task[field] = req.body[field];
        }
      }
    });

    await task.save();
    await task.populate('createdBy', 'name email');
    await task.populate('assignedTo', 'name email');

    // Emit socket event for real-time updates
    if (req.io) {
      req.io.to(`board_${task.boardId._id}`).emit('task-updated', {
        task,
        oldStatus,
        newStatus: task.status,
        boardId: task.boardId._id
      });
    }

    res.json({
      success: true,
      message: 'Task updated successfully',
      task
    });

  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ 
      message: 'Error updating task',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete task (soft delete)
// @access  Private
router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('boardId');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has permission to delete this task
    const hasPermission = 
      task.createdBy.toString() === req.user._id.toString() ||
      task.boardId.createdBy.toString() === req.user._id.toString();

    if (!hasPermission) {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    task.isActive = false;
    await task.save();

    // Emit socket event for real-time updates
    if (req.io) {
      req.io.to(`board_${task.boardId._id}`).emit('task-deleted', {
        taskId: task._id,
        boardId: task.boardId._id
      });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });

  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ 
      message: 'Error deleting task',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   POST /api/tasks/:id/comments
// @desc    Add comment to task
// @access  Private
router.post('/tasks/:id/comments', [
  auth,
  body('text')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Comment must be between 1 and 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const task = await Task.findById(req.params.id).populate('boardId');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has access to the board
    const hasAccess = 
      task.boardId.createdBy.toString() === req.user._id.toString() ||
      task.boardId.members.some(member => 
        member.user.toString() === req.user._id.toString()
      );

    if (!hasAccess) {
      return res.status(403).json({ message: 'Not authorized to comment on this task' });
    }

    task.comments.push({
      text: req.body.text,
      author: req.user._id
    });

    await task.save();
    await task.populate('comments.author', 'name email');

    // Get the new comment
    const newComment = task.comments[task.comments.length - 1];

    // Emit socket event for real-time updates
    if (req.io) {
      req.io.to(`board_${task.boardId._id}`).emit('task-comment-added', {
        taskId: task._id,
        comment: newComment,
        boardId: task.boardId._id
      });
    }

    res.json({
      success: true,
      message: 'Comment added successfully',
      comment: newComment
    });

  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ 
      message: 'Error adding comment',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;