# Nextcloud Configuration Fix for Permission Issues

## 🚨 **Current Problem**

The Nextcloud integration is failing because the user `mrm360` is trying to create folders in the **root directory** (`/`), which is restricted for security reasons.

## 🔧 **Solution: Change Base Path**

### **Current Configuration (Problematic):**
```bash
NEXTCLOUD_BASE_PATH=/
```

### **Recommended Configuration (Fixed):**
```bash
NEXTCLOUD_BASE_PATH=/mrm360/teams
```

## 📋 **Steps to Fix:**

### **Step 1: Update Environment Variables**
Edit your `.env` file and change:
```bash
# From this (problematic):
NEXTCLOUD_BASE_PATH=/

# To this (working):
NEXTCLOUD_BASE_PATH=/mrm360/teams
```

### **Step 2: Create User Directory Structure**
In Nextcloud, ensure the user `mrm360` has a directory structure:
```
/mrm360/
└── teams/
```

### **Step 3: Set Proper Permissions**
Ensure `mrm360` has:
- ✅ **Read/Write** access to `/mrm360/teams/`
- ✅ **Calendar** permissions (if using calendar features)
- ✅ **Deck** permissions (if using deck features)

## 🎯 **Alternative Base Path Options:**

### **Option 1: User-Specific (Recommended)**
```bash
NEXTCLOUD_BASE_PATH=/mrm360/teams
```

### **Option 2: Shared Directory**
```bash
NEXTCLOUD_BASE_PATH=/shared/teams
```

### **Option 3: Organization Directory**
```bash
NEXTCLOUD_BASE_PATH=/organizations/psuccso/teams
```

## 🔍 **Why This Fixes the Issues:**

### **Before (Root Directory):**
- ❌ User tries to create `/test-group-123/`
- ❌ Nextcloud blocks this (security restriction)
- ❌ Results in permission errors

### **After (User Directory):**
- ✅ User creates `/mrm360/teams/test-group-123/`
- ✅ User has write access to their own directory
- ✅ Nextcloud allows the operation

## 📊 **Expected Results After Fix:**

1. **Folder Management**: ✅ Working (no more permission errors)
2. **Calendar Management**: ✅ Working (if calendar permissions granted)
3. **Deck Board Management**: ✅ Working (if deck permissions granted)

## 🛠️ **Verification Steps:**

### **1. Test Folder Creation**
```bash
# Run the test script
npx tsx scripts/testNextcloudFixes.ts
```

### **2. Check Directory Structure**
In Nextcloud web interface:
- Navigate to `/mrm360/teams/`
- Verify the directory exists and is writable
- Check that test folders are created successfully

### **3. Monitor Logs**
Watch for successful folder creation messages:
```
✅ Group folder created successfully: /mrm360/teams/test-group-123/test-documents
```

## 🔒 **Security Benefits:**

Using a user-specific base path provides:
- ✅ **Isolation**: Each user's teams are in their own directory
- ✅ **Security**: Users can't access other users' directories
- ✅ **Compliance**: Follows Nextcloud security best practices
- ✅ **Auditability**: Clear separation of user data

## 🚀 **Next Steps After Configuration:**

1. **Update the base path** in your `.env` file
2. **Restart your application** to pick up the new configuration
3. **Run the test script** to verify the fix
4. **Monitor the logs** for successful operations

## 📞 **If Issues Persist:**

If you still encounter permission issues after changing the base path:

1. **Check user permissions** in Nextcloud admin panel
2. **Verify directory exists** and is writable
3. **Check Nextcloud logs** for detailed error messages
4. **Ensure user has proper role** (admin, group admin, etc.)

## 🎉 **Expected Outcome:**

After implementing this fix, you should see:
- ✅ Successful folder creation
- ✅ Working calendar management
- ✅ Working deck board management
- ✅ Clear, actionable error messages
- ✅ Proper permission handling

The Nextcloud integration will be fully functional with proper security and user isolation.
