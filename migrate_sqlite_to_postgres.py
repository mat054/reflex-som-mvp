#!/usr/bin/env python3
"""
Script para migrar dados do SQLite para PostgreSQL
Uso: python migrate_sqlite_to_postgres.py
"""

import os
import sys
import django
from pathlib import Path

# Configurar Django
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.core.management import execute_from_command_line
from django.db import connections
from django.conf import settings

def check_sqlite_exists():
    """Verificar se o arquivo SQLite existe"""
    sqlite_path = BASE_DIR / 'db.sqlite3'
    if not sqlite_path.exists():
        print("❌ Arquivo db.sqlite3 não encontrado!")
        return False
    print(f"✅ SQLite encontrado: {sqlite_path}")
    return True

def backup_sqlite():
    """Fazer backup do SQLite atual"""
    import shutil
    from datetime import datetime
    
    sqlite_path = BASE_DIR / 'db.sqlite3'
    backup_path = BASE_DIR / f"db.sqlite3.backup.{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    shutil.copy2(sqlite_path, backup_path)
    print(f"✅ Backup criado: {backup_path}")
    return backup_path

def export_data():
    """Exportar dados do SQLite"""
    print("📤 Exportando dados do SQLite...")
    
    # Configurar para usar SQLite
    os.environ['DATABASE_ENGINE'] = 'sqlite'
    
    # Exportar dados
    execute_from_command_line(['manage.py', 'dumpdata', 
                              '--exclude', 'auth.permission',
                              '--exclude', 'contenttypes',
                              '--indent', '2',
                              '--output', 'sqlite_backup.json'])
    
    print("✅ Dados exportados para sqlite_backup.json")

def configure_postgres():
    """Configurar PostgreSQL"""
    print("🔧 Configurando PostgreSQL...")
    
    # Verificar se as variáveis de ambiente estão configuradas
    required_vars = ['DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_HOST']
    missing_vars = []
    
    for var in required_vars:
        if not os.environ.get(var):
            missing_vars.append(var)
    
    if missing_vars:
        print(f"❌ Variáveis de ambiente faltando: {', '.join(missing_vars)}")
        print("\nConfigure as variáveis de ambiente:")
        print("export DB_NAME=reflexsom_db")
        print("export DB_USER=reflexsom_user")
        print("export DB_PASSWORD=sua_senha")
        print("export DB_HOST=localhost")
        return False
    
    print("✅ Variáveis de ambiente configuradas")
    return True

def import_data():
    """Importar dados para PostgreSQL"""
    print("📥 Importando dados para PostgreSQL...")
    
    # Configurar para usar PostgreSQL
    os.environ['DATABASE_ENGINE'] = 'postgresql'
    
    # Executar migrações
    execute_from_command_line(['manage.py', 'migrate'])
    
    # Importar dados
    execute_from_command_line(['manage.py', 'loaddata', 'sqlite_backup.json'])
    
    print("✅ Dados importados com sucesso!")

def verify_migration():
    """Verificar se a migração foi bem-sucedida"""
    print("🔍 Verificando migração...")
    
    try:
        # Testar conexão com PostgreSQL
        with connections['default'].cursor() as cursor:
            cursor.execute("SELECT version();")
            version = cursor.fetchone()
            print(f"✅ Conectado ao PostgreSQL: {version[0]}")
        
        # Verificar dados
        from clientes.models import Cliente
        from equipamentos.models import Equipamento, Reserva
        
        clientes_count = Cliente.objects.count()
        equipamentos_count = Equipamento.objects.count()
        reservas_count = Reserva.objects.count()
        
        print(f"📊 Dados migrados:")
        print(f"   - Clientes: {clientes_count}")
        print(f"   - Equipamentos: {equipamentos_count}")
        print(f"   - Reservas: {reservas_count}")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro na verificação: {e}")
        return False

def main():
    """Função principal"""
    print("🚀 Iniciando migração SQLite → PostgreSQL")
    print("=" * 50)
    
    # 1. Verificar SQLite
    if not check_sqlite_exists():
        return
    
    # 2. Fazer backup
    backup_path = backup_sqlite()
    
    # 3. Exportar dados
    export_data()
    
    # 4. Configurar PostgreSQL
    if not configure_postgres():
        print("\n💡 Para configurar PostgreSQL:")
        print("1. Instale: sudo apt install postgresql postgresql-contrib")
        print("2. Crie banco: sudo -u postgres createdb reflexsom_db")
        print("3. Crie usuário: sudo -u postgres createuser reflexsom_user")
        print("4. Configure as variáveis de ambiente")
        return
    
    # 5. Importar dados
    import_data()
    
    # 6. Verificar migração
    if verify_migration():
        print("\n🎉 Migração concluída com sucesso!")
        print(f"📁 Backup original: {backup_path}")
        print("💡 Agora você pode usar PostgreSQL em produção!")
    else:
        print("\n❌ Erro na migração. Verifique os logs acima.")

if __name__ == '__main__':
    main() 