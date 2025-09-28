import { format, isToday, isTomorrow, isYesterday, isPast, differenceInDays } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  
  if (isToday(dateObj)) {
    return `Today at ${format(dateObj, 'HH:mm')}`;
  }
  
  if (isTomorrow(dateObj)) {
    return `Tomorrow at ${format(dateObj, 'HH:mm')}`;
  }
  
  if (isYesterday(dateObj)) {
    return `Yesterday at ${format(dateObj, 'HH:mm')}`;
  }
  
  const daysDiff = Math.abs(differenceInDays(dateObj, new Date()));
  
  if (daysDiff <= 7) {
    return format(dateObj, 'EEEE \'at\' HH:mm');
  }
  
  return format(dateObj, 'MMM d, yyyy \'at\' HH:mm');
};

export const formatRelativeDate = (date) => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  
  if (isToday(dateObj)) {
    return 'Today';
  }
  
  if (isTomorrow(dateObj)) {
    return 'Tomorrow';
  }
  
  if (isYesterday(dateObj)) {
    return 'Yesterday';
  }
  
  const daysDiff = differenceInDays(dateObj, new Date());
  
  if (daysDiff > 0 && daysDiff <= 7) {
    return format(dateObj, 'EEEE');
  }
  
  if (daysDiff < 0 && daysDiff >= -7) {
    return format(dateObj, 'EEEE');
  }
  
  return format(dateObj, 'MMM d, yyyy');
};

export const isOverdue = (dueDate, status) => {
  if (!dueDate || status === 'done') return false;
  return isPast(new Date(dueDate));
};

export const getDueDateColor = (dueDate, status) => {
  if (!dueDate || status === 'done') return 'text-gray-500';
  
  const dateObj = new Date(dueDate);
  
  if (isPast(dateObj)) {
    return 'text-red-600';
  }
  
  if (isToday(dateObj) || isTomorrow(dateObj)) {
    return 'text-orange-600';
  }
  
  return 'text-gray-600';
};

export const getPriorityColor = (priority) => {
  const colors = {
    low: 'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    urgent: 'bg-red-100 text-red-800 border-red-200'
  };
  return colors[priority] || colors.medium;
};

export const getStatusColor = (status) => {
  const colors = {
    todo: 'bg-gray-100 text-gray-800 border-gray-200',
    inprogress: 'bg-blue-100 text-blue-800 border-blue-200',
    done: 'bg-green-100 text-green-800 border-green-200'
  };
  return colors[status] || colors.todo;
};

export const generateAvatarColor = (name) => {
  const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-gray-500'
  ];
  
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

export const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
};

export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

export const calculateProgress = (tasks) => {
  if (!tasks || tasks.length === 0) return 0;
  
  const completedTasks = tasks.filter(task => task.status === 'done').length;
  return Math.round((completedTasks / tasks.length) * 100);
};

export const groupTasksByStatus = (tasks) => {
  return {
    todo: tasks.filter(task => task.status === 'todo'),
    inprogress: tasks.filter(task => task.status === 'inprogress'),
    done: tasks.filter(task => task.status === 'done')
  };
};

export const sortTasksByPriority = (tasks) => {
  const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
  return [...tasks].sort((a, b) => 
    priorityOrder[b.priority] - priorityOrder[a.priority]
  );
};

export const filterTasks = (tasks, filters) => {
  return tasks.filter(task => {
    if (filters.assignedTo && task.assignedTo?._id !== filters.assignedTo) {
      return false;
    }
    
    if (filters.priority && task.priority !== filters.priority) {
      return false;
    }
    
    if (filters.status && task.status !== filters.status) {
      return false;
    }
    
    if (filters.overdue && !isOverdue(task.dueDate, task.status)) {
      return false;
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const titleMatch = task.title.toLowerCase().includes(searchLower);
      const descriptionMatch = task.description?.toLowerCase().includes(searchLower);
      const tagMatch = task.tags?.some(tag => 
        tag.toLowerCase().includes(searchLower)
      );
      
      if (!titleMatch && !descriptionMatch && !tagMatch) {
        return false;
      }
    }
    
    return true;
  });
};