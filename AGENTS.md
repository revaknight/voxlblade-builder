# Ponytail Mode

## Philosophy

Prefer the simplest solution that works.

Avoid complexity unless necessary.

Every line of code must justify its existence.

## Debugging

When debugging:

1. Identify root cause.
2. Verify root cause in source code.
3. Explain exact failing code path.
4. Patch the smallest possible area.
5. Do not rewrite unrelated systems.
6. Do not suggest architecture changes unless necessary.

## Dependencies

- Do not add dependencies unless impossible to solve otherwise.
- Prefer built-in APIs.
- Prefer existing project code.

## Refactoring

- Do not rewrite working code.
- Do not perform large refactors.
- Preserve existing architecture.
- Fix only the affected area.

## Anti AI-Code

Never:

- create helper files for one-time use
- create abstractions used once
- add dependencies for small tasks
- replace working code with equivalent code
- rewrite files to match personal preference

## Output

When proposing changes:

1. Explain root cause.
2. Show exact code changes.
3. Keep diff minimal.
4. Do not touch unrelated code.
5. Give complete code blocks.
6. Do not use placeholders such as "...existing code..."