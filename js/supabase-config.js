// Supabase Configuration
// Get these values from your Supabase project settings:
// https://supabase.com/dashboard/project/[YOUR_PROJECT_ID]/settings/api

const SupabaseConfig = {
    // Your Supabase Project URL
    supabaseUrl: 'https://YOUR_PROJECT_ID.supabase.co',
    
    // Your Supabase Anon Key (public key)
    supabaseAnonKey: 'YOUR_SUPABASE_ANON_KEY',
    
    // Optional: Service Role Key (for server-side operations only)
    // supabaseServiceKey: 'YOUR_SUPABASE_SERVICE_ROLE_KEY',
    
    // Database table names
    tables: {
        users: 'users',
        documents: 'documents',
        signatures: 'signatures',
        auditLog: 'audit_log'
    },
    
    // Storage buckets
    storage: {
        documents: 'documents',
        signatures: 'signatures'
    }
};

// Initialize Supabase Client
let supabaseClient = null;

async function initSupabase() {
    if (supabaseClient) return supabaseClient;
    
    try {
        // Import Supabase library (add to HTML: <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>)
        const { createClient } = window.supabase;
        
        supabaseClient = createClient(
            SupabaseConfig.supabaseUrl,
            SupabaseConfig.supabaseAnonKey
        );
        
        console.log('✓ Supabase client initialized');
        return supabaseClient;
    } catch (error) {
        console.error('✗ Error initializing Supabase:', error);
        return null;
    }
}

// Utility functions for Supabase operations
const SupabaseModule = {
    // Get initialized client
    async getClient() {
        return await initSupabase();
    },
    
    // Insert user
    async insertUser(userData) {
        const client = await initSupabase();
        if (!client) return null;
        
        const { data, error } = await client
            .from(SupabaseConfig.tables.users)
            .insert([userData]);
            
        if (error) {
            console.error('Error inserting user:', error.message);
            return null;
        }
        return data;
    },
    
    // Get user by ID
    async getUserById(userId) {
        const client = await initSupabase();
        if (!client) return null;
        
        const { data, error } = await client
            .from(SupabaseConfig.tables.users)
            .select('*')
            .eq('id', userId)
            .single();
            
        if (error) {
            console.error('Error fetching user:', error.message);
            return null;
        }
        return data;
    },
    
    // Upload document
    async uploadDocument(bucketName, filePath, file) {
        const client = await initSupabase();
        if (!client) return null;
        
        const { data, error } = await client.storage
            .from(bucketName)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });
            
        if (error) {
            console.error('Error uploading document:', error.message);
            return null;
        }
        return data;
    },
    
    // Get public URL for uploaded file
    async getPublicUrl(bucketName, filePath) {
        const client = await initSupabase();
        if (!client) return null;
        
        const { data } = client.storage
            .from(bucketName)
            .getPublicUrl(filePath);
            
        return data?.publicUrl;
    },
    
    // Insert signature record
    async insertSignature(signatureData) {
        const client = await initSupabase();
        if (!client) return null;
        
        const { data, error } = await client
            .from(SupabaseConfig.tables.signatures)
            .insert([signatureData]);
            
        if (error) {
            console.error('Error inserting signature:', error.message);
            return null;
        }
        return data;
    },
    
    // Get audit log
    async getAuditLog(userId = null, limit = 100) {
        const client = await initSupabase();
        if (!client) return null;
        
        let query = client
            .from(SupabaseConfig.tables.auditLog)
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);
            
        if (userId) {
            query = query.eq('user_id', userId);
        }
        
        const { data, error } = await query;
        
        if (error) {
            console.error('Error fetching audit log:', error.message);
            return null;
        }
        return data;
    },
    
    // Real-time subscription example
    subscribeToChanges(tableName, callback) {
        const client = supabaseClient;
        if (!client) return null;
        
        const subscription = client
            .channel('public:' + tableName)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: tableName },
                payload => callback(payload)
            )
            .subscribe();
            
        return subscription;
    }
};
