# Agent Operating Instructions & Knowledge Reference

> **CRITICAL DIRECTIVE**: Whenever executing tasks, building features, debugging, or extending this project, **ALWAYS** inspect and refer to the documentation and records maintained inside the [`agents/`](./agents/) directory before taking action.

## Key Agents Knowledge Files

1. **[`agents/commands.md`](./agents/commands.md)**: Master log of all user requests, specifications, and constraints provided across conversation turns.
2. **[`agents/project_overview.md`](./agents/project_overview.md)**: High-level architectural specification, complete tool inventory, PhotoPills alignment, TransitChaser integration, and tech stack details.
3. **[`agents/design_system.md`](./agents/design_system.md)**: Design rules from `landing-page-design` and `TEMPLATE_GUIDE.md` (typography, color tokens, spacing, radii, tactile controls, mobile/tablet responsive constraints).
4. **[`agents/implementation_steps.md`](./agents/implementation_steps.md)**: Structured step-by-step implementation log, milestone tracker, and verification checklist.
5. **[`agents/mathematical_models.md`](./agents/mathematical_models.md)**: Mathematical formulas and optical/astronomical ephemeris specifications (DoF, Hyperfocal, ND Reciprocity, 500 Rule, NPF Rule, Star Trails, Hyperlapse, Lunar Transit geometry).

## Rules for Agents

- **Always review `agents/commands.md`** to ensure full compliance with the user's explicit instructions.
- **Always update the appropriate files in `agents/`** as new commands are received, milestones are completed, or architectural decisions are made.
- **Maintain documentation integrity**: Do not overwrite historical instructions; append and version accordingly.
