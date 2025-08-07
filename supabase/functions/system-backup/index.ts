import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface BackupRequest {
  tables?: string[];
  includeFiles?: boolean;
  compressionLevel?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tables = [], includeFiles = false }: BackupRequest = 
      req.method === 'POST' ? await req.json() : {};

    console.log('Starting backup process...', { tables, includeFiles });

    // Get database schema and data
    const backupData: Record<string, any> = {};
    
    // Default tables to backup if none specified
    const tablesToBackup = tables.length > 0 ? tables : [
      'profiles', 'submissions', 'articles', 'reviews', 'editorial_decisions',
      'discussion_threads', 'discussion_messages', 'notifications',
      'workflow_audit_log', 'file_versions'
    ];

    // Backup each table
    for (const tableName of tablesToBackup) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .order('created_at', { ascending: true });

        if (error) {
          console.error(`Error backing up table ${tableName}:`, error);
          continue;
        }

        backupData[tableName] = {
          count: data?.length || 0,
          data: data || [],
          timestamp: new Date().toISOString()
        };

        console.log(`Backed up ${tableName}: ${data?.length || 0} records`);
      } catch (tableError) {
        console.error(`Failed to backup table ${tableName}:`, tableError);
        backupData[tableName] = {
          error: tableError.message,
          timestamp: new Date().toISOString()
        };
      }
    }

    // Include file metadata if requested
    if (includeFiles) {
      try {
        const { data: files } = await supabase.storage
          .from('journal-website-db1')
          .list('', { limit: 1000, sortBy: { column: 'created_at', order: 'asc' } });

        backupData.storage_files = {
          count: files?.length || 0,
          files: files?.map(file => ({
            name: file.name,
            size: file.metadata?.size,
            created_at: file.created_at,
            updated_at: file.updated_at
          })) || [],
          timestamp: new Date().toISOString()
        };
      } catch (storageError) {
        console.error('Error backing up storage files:', storageError);
        backupData.storage_files = {
          error: storageError.message,
          timestamp: new Date().toISOString()
        };
      }
    }

    // Create backup metadata
    const backupMetadata = {
      backup_id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      version: '1.0',
      tables_included: tablesToBackup,
      files_included: includeFiles,
      total_records: Object.values(backupData)
        .filter(table => typeof table === 'object' && table.count)
        .reduce((sum, table: any) => sum + (table.count || 0), 0)
    };

    const completeBackup = {
      metadata: backupMetadata,
      data: backupData
    };

    // Log backup operation
    await supabase.from('workflow_audit_log').insert({
      submission_id: null,
      old_status: null,
      new_status: 'backup_completed',
      changed_by: null,
      change_reason: 'System backup operation',
      metadata: {
        backup_id: backupMetadata.backup_id,
        tables_count: tablesToBackup.length,
        total_records: backupMetadata.total_records,
        files_included: includeFiles
      }
    });

    console.log('Backup completed successfully:', backupMetadata);

    return new Response(JSON.stringify({
      success: true,
      backup: completeBackup,
      download_size: JSON.stringify(completeBackup).length
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Backup failed:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});