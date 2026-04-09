from langgraph_sdk import Auth

# Initialize auth
auth = Auth()

# ✅ Allow all users (no Supabase required)
@auth.authenticate
async def get_current_user(authorization: str | None):
    return {
        "identity": "demo-user"
    }

# ✅ Allow all thread operations
@auth.on.threads.create
@auth.on.threads.create_run
@auth.on.threads.read
@auth.on.threads.update
@auth.on.threads.delete
@auth.on.threads.search
async def allow_threads(ctx, value):
    return

# ✅ Allow all assistant operations
@auth.on.assistants.create
@auth.on.assistants.read
@auth.on.assistants.update
@auth.on.assistants.delete
@auth.on.assistants.search
async def allow_assistants(ctx, value):
    return

# ✅ Allow store access
@auth.on.store()
async def allow_store(ctx, value):
    return