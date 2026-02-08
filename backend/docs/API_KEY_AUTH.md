# API Key Authentication - Implementation Guide

## ✅ What's Been Implemented

Your API key authentication middleware now validates against a **Supabase database table** instead of a static environment variable.

### Features

- ✅ **Database-backed validation** - Checks `public.api_keys` table
- ✅ **User association** - Each API key is linked to a `user_id`
- ✅ **Active status check** - Only active keys are accepted
- ✅ **User context attachment** - Attaches `req.user` with `userId` for downstream routes
- ✅ **Activity tracking** - Updates `last_used_at` timestamp on each use
- ✅ **Proper HTTP status codes** - 401 for missing, 403 for invalid/disabled
- ✅ **Error handling** - Graceful handling of database errors

## 📋 Database Schema

The middleware expects this table structure:

```sql
public.api_keys
├── id (UUID, primary key)
├── api_key (TEXT, unique, indexed)
├── user_id (UUID)
├── name (TEXT, optional - e.g., "Production Key")
├── is_active (BOOLEAN)
├── created_at (TIMESTAMP)
├── last_used_at (TIMESTAMP)
└── expires_at (TIMESTAMP, optional)
```

## 🚀 Setup Instructions

### 1. Create the Database Table

Run the SQL in [schema_api_keys.sql](file:///E:/Projects/API%20Hub/backend/database/schema_api_keys.sql):

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Click **SQL Editor**
3. Copy and paste the entire SQL from `database/schema_api_keys.sql`
4. Click **Run**

### 2. Insert Your Test API Key

Update the INSERT statement with a real user UUID:

```sql
INSERT INTO public.api_keys (api_key, user_id, name, is_active)
VALUES 
  ('6b5ef619bc4212854b7b506839fe960cbdca45ba602d9ac1bce511f37e5eaf86', 
   'your-actual-user-uuid-here', 
   'Development Key', 
   true);
```

### 3. Test the Authentication

Use the test script:

```bash
node test-api.js
```

Or manually with PowerShell:

```powershell
# Should succeed (if key exists in DB)
Invoke-WebRequest -Uri "http://localhost:3000/api/accessibility" `
  -Headers @{"x-api-key"="6b5ef619bc4212854b7b506839fe960cbdca45ba602d9ac1bce511f37e5eaf86"} `
  | Select-Object -Expand Content

# Should fail with 401
Invoke-WebRequest -Uri "http://localhost:3000/api/accessibility"
```

## 🔐 How It Works

### Request Flow

```
1. Request comes in with x-api-key header
2. Middleware extracts the key
3. Query Supabase: SELECT ... WHERE api_key = ?
4. Validate: key exists + is_active = true
5. Attach user info to req.user
6. Update last_used_at timestamp
7. Call next() to proceed to route
```

### Request Object Enhancement

After successful authentication, your routes can access:

```javascript
req.user = {
  userId: 'uuid-of-the-user',
  apiKeyId: 'uuid-of-the-api-key',
  apiKeyName: 'Development Key'
}
```

### Example Route Using User Context

```javascript
router.get('/my-data', async (req, res) => {
  const userId = req.user.userId; // Available after auth
  
  // Fetch data specific to this user
  const { data } = await supabase
    .from('user_data')
    .select('*')
    .eq('user_id', userId);
    
  res.json({ success: true, data });
});
```

## 📊 Response Codes

| Status | Scenario | Message |
|--------|----------|---------|
| 401 | No API key provided | "API key is missing" |
| 403 | Invalid API key | "The provided API key is not valid" |
| 403 | Disabled API key | "This API key has been disabled" |
| 500 | Database error | "Authentication error" |

## 🔄 Migration from Old Middleware

**Before:** Static env variable check
```javascript
if (apiKey !== config.apiKey) { ... }
```

**After:** Database validation
```javascript
const { data } = await supabase
  .from('api_keys')
  .select('user_id, is_active')
  .eq('api_key', apiKey)
  .single();
```

## 🎯 Next Steps

1. Create the `api_keys` table in Supabase
2. Insert test API key with a valid user_id
3. Test authentication with `node test-api.js`
4. Use `req.user.userId` in your routes for user-specific data

Your authentication layer is now centralized and database-backed! 🚀
