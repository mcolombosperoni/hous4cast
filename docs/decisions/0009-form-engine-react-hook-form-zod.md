# ADR-0009: Form engine with react-hook-form and Zod

## Status
Accepted

## Context
The project requires a configurable, localizable, and validated form engine for property estimation. The form fields, validation, and copy must be driven by agency config and support both Italian and English. The form must be easily extensible and maintainable.

## Decision
- Use **react-hook-form** for form state management and dynamic field rendering.
- Use **Zod** for schema-based validation, integrated via @hookform/resolvers.
- Form fields, labels, and validation messages are defined in the agency config and support localization.
- The form is generated dynamically from the config, supporting conditional logic and custom field types.

## Consequences
- Forms are type-safe, easily extensible, and maintainable.
- Validation and error messages are localizable and consistent.
- The codebase depends on react-hook-form, Zod, and @hookform/resolvers.
- Existing forms and configs must be refactored to the new structure.

---
- Date: 2026-04-28
- Authors: Team hous4cast

