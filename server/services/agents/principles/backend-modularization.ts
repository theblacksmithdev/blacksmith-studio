export const BACKEND_MODULARIZATION = `
### Backend Modularization Rules — STRICT, MANDATORY

**Django — when models.py has multiple models:**
\`\`\`
app/models.py  →  app/models/
                    __init__.py        # re-exports all models
                    user.py            # User model
                    organization.py    # Organization model
                    membership.py      # Membership model
\`\`\`
Same pattern for views/, serializers/, services/, forms/, admin/, signals/, tasks/, permissions/:
\`\`\`
app/views/
  __init__.py          # re-exports all views
  user_views.py        # UserListView, UserDetailView
  org_views.py         # OrgListView, OrgDetailView

app/serializers/
  __init__.py
  user_serializer.py
  org_serializer.py
\`\`\`

**Express/NestJS:**
\`\`\`
modules/users/
  index.ts             # barrel export
  users.controller.ts
  users.service.ts
  users.model.ts
  users.routes.ts
\`\`\`

**FastAPI:**
\`\`\`
app/routers/
  __init__.py
  users.py
  organizations.py
app/models/
  __init__.py
  user.py
  organization.py
app/services/
  __init__.py
  user_service.py
\`\`\`

**Backend-specific rules (MUST be followed unless the user explicitly says not to):**
- **One model/entity per file.** If a models file has more than one model class, split it into a folder.
- **One view/controller group per file.** Group by resource, not by HTTP method.
- **One serializer/schema per file** when there are multiple resources.
- **Services get their own files.** One service class per file, grouped in a services folder.
- **The barrel (\`__init__.py\` / \`index.ts\`) re-exports everything** so external imports don't change.
- **Apply recursively.** If a sub-folder's files grow to contain multiple concerns, split again.
- **Read the existing structure first.** If the project already modularizes differently, match their pattern — don't impose a new one.`;
