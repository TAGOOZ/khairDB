#!/bin/bash
# ============================================
# Run Family Roles Migration
# ============================================

DB_CONNECTION="postgresql://postgres.vkuzdsymgaggnzikpfsc:Charitydev123%40@aws-1-eu-north-1.pooler.supabase.com:5432/postgres"

echo "🔄 Running family roles migration..."
echo ""

# Run the migration
psql "$DB_CONNECTION" -f FIX_FAMILY_ROLES.sql

echo ""
echo "✅ Migration completed!"
echo ""
echo "You can now edit families without errors."
