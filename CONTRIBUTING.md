# 🤝 Contributing to ProshnoBank

Thank you for considering contributing to ProshnoBank! We appreciate every contribution, whether it's:
- 🐛 Bug reports
- ✨ Feature suggestions
- 📝 Documentation improvements
- 💻 Code contributions
- 🎨 Design improvements
- 🌍 Translations

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Questions & Support](#questions--support)

## Code of Conduct

Please note we have a [Code of Conduct](CODE_OF_CONDUCT.md) - please follow it in all your interactions with the project.

## How to Contribute

### 1️⃣ Report a Bug

**Before creating a bug report**, please check the [issue list](https://github.com/Creativity-Freaks/proshnobank/issues) to avoid duplicates.

When you create a bug report, include as much detail as possible:

```markdown
## Bug Report

### Description
Clear description of the bug

### Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

### Expected Behavior
What should happen?

### Actual Behavior
What actually happens?

### Screenshots/Videos
If applicable, add screenshots or screen recordings

### Environment
- OS: [e.g. macOS, Windows, Linux]
- Browser: [e.g. Chrome, Firefox]
- Node Version: [e.g. 18.0.0]
- npm Version: [e.g. 9.0.0]

### Additional Context
Any other relevant context?
```

### 2️⃣ Request a Feature

Have a great idea? We'd love to hear it!

```markdown
## Feature Request

### Description
Clear description of the feature

### Use Case
Why do you need this feature?

### Proposed Solution
How should it work?

### Alternative Solutions
Any alternatives you've considered?

### Additional Context
Screenshots, mockups, or examples?
```

### 3️⃣ Submit a Pull Request

We use GitHub Pull Requests for code contributions.

## Development Setup

### Prerequisites
- Node.js 18.0.0 or higher
- npm 9.0.0 or higher
- Git
- GitHub account

### Step-by-Step Setup

```bash
# 1. Fork the repository on GitHub
# (Click the "Fork" button on https://github.com/Creativity-Freaks/proshnobank)

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/proshnobank.git
cd proshnobank

# 3. Add upstream remote
git remote add upstream https://github.com/Creativity-Freaks/proshnobank.git

# 4. Create a feature branch
git checkout -b feature/your-feature-name

# 5. Install dependencies
npm install

# 6. Create .env.local file
cp .env.example .env.local
# Edit .env.local with your values

# 7. Start development server
npm run dev
```

### Branch Naming Convention

Use clear, descriptive branch names:

```
feature/add-dark-mode
fix/login-button-responsive
docs/update-readme
refactor/optimize-queries
test/add-unit-tests
chore/update-dependencies
```

## Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that don't affect code meaning (formatting, missing semicolons, etc.)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Code change that improves performance
- **test**: Adding or updating tests
- **chore**: Changes to build process, dependencies, or tools

### Examples

```bash
git commit -m "feat(auth): add two-factor authentication"
git commit -m "fix(exam): correct timer calculation in exam-take component"
git commit -m "docs: update installation instructions"
git commit -m "refactor(hooks): simplify useExamSetup hook"
git commit -m "test: add unit tests for question validation"
```

## Pull Request Process

### Before Creating a PR

1. **Fetch latest changes**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run linting**
   ```bash
   npm run lint
   ```

3. **Type check**
   ```bash
   npm run typecheck
   ```

4. **Run tests**
   ```bash
   npm run test
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

### Creating Your PR

1. **Push your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create PR on GitHub**
   - Go to https://github.com/Creativity-Freaks/proshnobank
   - Click "New Pull Request"
   - Select your branch
   - Fill in the PR template

### PR Description Template

```markdown
## Description
Brief description of changes

## Related Issues
Closes #(issue number)

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing Done
- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] All existing tests pass

## Screenshots/Videos (if applicable)
Attach screenshots or videos

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added where needed
- [ ] Documentation updated
- [ ] No new console errors/warnings
- [ ] Tests pass locally
```

### PR Review Process

- ✅ At least 1 approval required
- 🔍 Code review for quality, security, and performance
- 📝 Suggestions for improvements
- 🐛 Testing for bugs or issues

### After Approval

- PRs will be merged by maintainers
- Your contribution will be credited in CONTRIBUTORS.md
- Your changes will be included in the next release

## Coding Standards

### General Rules

- ✨ Write clean, readable code
- 📝 Add meaningful comments for complex logic
- 🚫 Avoid console.log() in production code
- 🔍 Keep functions small and focused
- 📦 Follow DRY (Don't Repeat Yourself) principle
- 🎯 Use meaningful variable and function names

### TypeScript

```typescript
// ✅ Good
interface User {
  id: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
}

const getUser = (id: string): Promise<User> => {
  // implementation
};

// ❌ Bad
const getUser = (id) => {
  // implementation
};

const user: any = data;
```

### React Components

```typescript
// ✅ Good
import React from 'react';

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ 
  onClick, 
  children, 
  variant = 'primary' 
}) => {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;

// ❌ Bad
const Button = (props) => (
  <button onClick={props.onClick}>{props.children}</button>
);
```

### CSS & Tailwind

```typescript
// ✅ Good - Use Tailwind classes
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">

// ❌ Bad - Inline styles
<div style={{ display: 'flex', padding: '16px' }}>
```

### File Organization

```
src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   └── index.ts
│   └── Form/
│       ├── Form.tsx
│       ├── Form.test.tsx
│       └── index.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useAuth.test.ts
│   └── index.ts
├── lib/
│   ├── api.ts
│   ├── api.test.ts
│   └── utils.ts
└── types/
    └── index.ts
```

## Testing

### Unit Tests

```bash
# Run all tests once
npm run test

# Run tests in watch mode
npm run test:watch
```

### Writing Tests

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Button from './Button';

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('calls onClick handler', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    screen.getByRole('button').click();
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### Coverage Requirements

- Minimum 80% code coverage for new code
- Run: `npm run test -- --coverage`

## Documentation

### Update README

If your changes affect usage or setup, update [README.md](README.md)

### Add Code Comments

For complex logic:

```typescript
// Calculate weighted score with bonus points
const calculateScore = (answers: Answer[]): number => {
  return answers.reduce((sum, answer) => {
    // Each correct answer is worth 1 point
    // Bonus: 0.5 points for answering within time limit
    const basePoints = answer.isCorrect ? 1 : 0;
    const bonusPoints = answer.withinTimeLimit ? 0.5 : 0;
    return sum + basePoints + bonusPoints;
  }, 0);
};
```

### JSDoc Comments

```typescript
/**
 * Calculate the total marks for an exam submission
 * @param submissionId - The ID of the exam submission
 * @param answers - Array of student answers
 * @returns The calculated total score
 * @throws Error if submission is not found
 */
const calculateMarks = (
  submissionId: string,
  answers: Answer[]
): number => {
  // implementation
};
```

## Questions & Support

- 💬 **GitHub Discussions**: [Start a discussion](https://github.com/Creativity-Freaks/proshnobank/discussions)
- 📧 **Email**: dev@proshnobank.io
- 🐦 **Twitter**: [@ProshnoBank](https://twitter.com/proshnobank)
- 📚 **Documentation**: [Full Docs](https://docs.proshnobank.io)

---

## Recognition

Your contributions matter! We recognize our contributors in:
- 🏆 [CONTRIBUTORS.md](CONTRIBUTORS.md)
- 📊 GitHub contributors page
- 🎉 Release notes

## Resources

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)

---

<div align="center">

Thank you for contributing to ProshnoBank! 🙏

Together, we're building an amazing education platform.

[Read our Code of Conduct](CODE_OF_CONDUCT.md)

</div>
