# Contributing to Cognitive Canvas

Thank you for your interest in contributing to Cognitive Canvas! This document provides guidelines and instructions for contributing.

## 🌟 How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/yourusername/cognitive-canvas/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots (if applicable)
   - Environment details (OS, browser, Node version)

### Suggesting Features

1. Check [existing feature requests](https://github.com/yourusername/cognitive-canvas/issues?q=is%3Aissue+label%3Aenhancement)
2. Create a new issue with the `enhancement` label
3. Describe:
   - The problem you're trying to solve
   - Your proposed solution
   - Alternative solutions you've considered
   - How this aligns with the project vision

### Code Contributions

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes** following our coding standards
4. **Test thoroughly**
5. **Commit with clear messages**: `git commit -m "feat: add XYZ feature"`
6. **Push to your fork**: `git push origin feature/your-feature-name`
7. **Open a Pull Request**

## 📝 Coding Standards

### TypeScript

```typescript
// Use explicit types
function analyzeEntry(entry: JournalEntry): AnalysisResult {
  // Implementation
}

// Prefer interfaces for objects
interface User {
  id: string;
  email: string;
  name?: string;
}

// Use meaningful variable names
const analysisResult = await analyzeEntry(entry);
```

### React Components

```typescript
// Use functional components with TypeScript
interface JournalEditorProps {
  onSave: (content: string) => void;
  initialContent?: string;
}

export const JournalEditor: React.FC<JournalEditorProps> = ({ 
  onSave, 
  initialContent = '' 
}) => {
  // Component implementation
};
```

### File Organization

- One component per file
- Co-locate tests with implementation
- Group related functionality in feature folders
- Use barrel exports (`index.ts`) for cleaner imports

### Naming Conventions

- **Files**: PascalCase for components, camelCase for utilities
- **Variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Types/Interfaces**: PascalCase
- **Private functions**: prefix with underscore `_helperFunction`

## 🧪 Testing

### Required Tests

- Unit tests for all utility functions
- Integration tests for API endpoints
- Component tests for critical UI components
- E2E tests for main user flows

### Running Tests

```bash
# All tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage

# E2E tests
npm run test:e2e
```

### Test Structure

```typescript
describe('AnalysisService', () => {
  describe('analyzeEmotion', () => {
    it('should detect primary emotion correctly', async () => {
      // Arrange
      const entry = createMockEntry('I feel very happy today!');
      
      // Act
      const result = await analyzeEmotion(entry);
      
      // Assert
      expect(result.primary.name).toBe('joy');
    });
  });
});
```

## 📦 Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add emotion intensity scoring
fix: resolve canvas rendering bug on mobile
docs: update API documentation
style: format code with prettier
refactor: simplify pattern matching logic
test: add tests for causal inference
chore: update dependencies
```

## 🔄 Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new functionality
3. **Ensure all tests pass**: `npm test`
4. **Lint your code**: `npm run lint`
5. **Update CHANGELOG.md** with your changes
6. **Request review** from maintainers

### PR Title Format

Use the same format as commit messages:

```
feat: Add voice journaling support
fix: Canvas performance on large graphs
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How did you test this?

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] My code follows the project style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code where needed
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests
- [ ] All tests pass locally
```

## 🎨 Design Guidelines

### UI/UX Principles

- **Simplicity**: Minimize cognitive load
- **Consistency**: Use established patterns
- **Feedback**: Provide clear feedback for actions
- **Accessibility**: Follow WCAG 2.1 AA standards
- **Performance**: Prioritize perceived performance

### Color Usage

Use the established color palette (see `theme.css`):

- Primary: Cognitive function colors (see Phase 3 docs)
- Semantic: Success, warning, error, info colors
- Neutral: Gray scale for text and backgrounds

## 🔒 Security Guidelines

- **Never commit secrets** (API keys, passwords)
- **Sanitize user input** on both client and server
- **Use parameterized queries** to prevent SQL injection
- **Implement rate limiting** on sensitive endpoints
- **Validate data** with Zod or similar library
- **Follow OWASP Top 10** best practices

## 🌐 Internationalization (Future)

Prepare for i18n:

- Use translation keys instead of hard-coded strings
- Avoid concatenating strings
- Consider text expansion (German can be 30% longer)
- Support RTL languages eventually

## 📚 Documentation

### Code Comments

```typescript
/**
 * Analyzes a journal entry for emotional content and cognitive patterns.
 * 
 * @param entry - The journal entry to analyze
 * @param options - Configuration options for the analysis
 * @returns Promise resolving to the analysis results
 * @throws {ValidationError} If the entry is invalid
 * 
 * @example
 * ```typescript
 * const result = await analyzeEntry(entry, { depth: 'detailed' });
 * console.log(result.emotions);
 * ```
 */
async function analyzeEntry(
  entry: JournalEntry,
  options?: AnalysisOptions
): Promise<AnalysisResult> {
  // Implementation
}
```

### README Updates

When adding features, update:
- Main README.md feature list
- Relevant phase documentation
- API.md if adding endpoints
- GETTING_STARTED.md if affecting setup

## 🤝 Code Review Guidelines

### For Authors

- Keep PRs small and focused (< 400 lines)
- Respond to feedback constructively
- Update PR based on review comments
- Re-request review when ready

### For Reviewers

- Be respectful and constructive
- Explain the "why" behind suggestions
- Approve when it meets standards
- Request changes if there are issues

## 🎯 Project Priorities

When contributing, align with these priorities:

1. **User Experience**: Intuitive, delightful interactions
2. **Privacy & Security**: User data protection
3. **AI Quality**: Accurate, helpful insights
4. **Performance**: Fast, responsive interface
5. **Maintainability**: Clean, documented code

## 📧 Contact

Questions? Reach out:

- **GitHub Issues**: For bug reports and features
- **Email**: issa.alrawwash@mail.utoronto.ca

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to Cognitive Canvas! Together, we're building a tool that helps people understand themselves better. 🧠✨**
