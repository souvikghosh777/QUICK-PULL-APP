# Contributing to TaskSync

Thank you for your interest in contributing to TaskSync! This document provides guidelines for contributing to this project.

## 🤝 How to Contribute

### Reporting Issues

1. **Search existing issues** first to avoid duplicates
2. **Use the issue template** when creating new issues
3. **Provide detailed information** including:
   - Steps to reproduce the bug
   - Expected vs actual behavior
   - Screenshots or error messages
   - Environment details (OS, browser, Node.js version)

### Suggesting Features

1. **Check existing feature requests** to avoid duplicates
2. **Clearly describe the feature** and its benefits
3. **Provide use cases** and examples
4. **Consider implementation complexity** and maintenance burden

### Code Contributions

#### Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/tasksync-collaborative-app.git
   cd tasksync-collaborative-app
   ```

3. **Install dependencies**:
   ```bash
   npm run install-all
   ```

4. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

#### Development Guidelines

##### Code Style
- **ESLint**: Follow the existing ESLint configuration
- **Prettier**: Use Prettier for code formatting
- **Naming**: Use descriptive, camelCase variable names
- **Comments**: Add comments for complex logic

##### Frontend (React)
- **Components**: Create reusable, well-documented components
- **Hooks**: Use React hooks appropriately
- **State Management**: Use Context API for global state
- **Styling**: Use Tailwind CSS classes consistently

##### Backend (Node.js)
- **REST API**: Follow RESTful conventions
- **Error Handling**: Include proper error handling and status codes
- **Validation**: Validate all input data
- **Security**: Follow security best practices

##### Database
- **Models**: Define clear Mongoose schemas
- **Queries**: Optimize database queries
- **Indexing**: Add appropriate database indexes

#### Testing
- **Write tests** for new features and bug fixes
- **Run existing tests** to ensure nothing breaks:
  ```bash
  npm test
  ```

#### Commit Guidelines

Use conventional commit messages:
```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```bash
git commit -m "feat(auth): add guest mode functionality"
git commit -m "fix(ui): resolve drag and drop issue on mobile"
git commit -m "docs: update setup instructions"
```

#### Pull Request Process

1. **Update documentation** if necessary
2. **Add or update tests** for your changes
3. **Run the full test suite** and ensure it passes
4. **Update the README** if you've added features
5. **Create a pull request** with:
   - Clear title and description
   - Reference to related issues
   - Screenshots for UI changes
   - Testing instructions

##### Pull Request Template
```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Added tests for new functionality
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots to help explain your changes.

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
```

## 🏗️ Development Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Git

### Environment Setup
1. Create `.env` files in both client and server directories
2. Install dependencies: `npm run install-all`
3. Start development servers: `npm run dev`

### Useful Scripts
```bash
# Install all dependencies
npm run install-all

# Start both client and server
npm run dev

# Start only client
npm run client

# Start only server
npm run server

# Run tests
npm test

# Build for production
npm run build
```

## 🎯 Areas for Contribution

We welcome contributions in these areas:

### High Priority
- **Performance improvements**
- **Accessibility enhancements**
- **Mobile responsiveness**
- **Test coverage**
- **Documentation improvements**

### Features
- **File attachments** for tasks
- **Email notifications**
- **Calendar integration**
- **Advanced filtering and search**
- **Custom themes**
- **Offline support**

### Bug Fixes
- **Cross-browser compatibility**
- **Edge cases in drag and drop**
- **Real-time synchronization issues**
- **UI/UX improvements**

## 📋 Code Review Process

1. **Automated checks** must pass (linting, tests)
2. **Two approvals** required for significant changes
3. **Maintainer review** for breaking changes
4. **Testing verification** by reviewers

## 🆘 Getting Help

- **Documentation**: Check README.md and SETUP.md
- **Issues**: Search existing issues for solutions
- **Discussions**: Use GitHub Discussions for questions
- **Contact**: Reach out to maintainers for complex issues

## 🙏 Recognition

Contributors will be:
- **Listed** in the README.md contributors section
- **Mentioned** in release notes for significant contributions
- **Invited** to join the core team for consistent contributions

Thank you for contributing to TaskSync! 🚀