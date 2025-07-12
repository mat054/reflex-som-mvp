from django.contrib import admin
from .models import Categoria, Equipamento, Orcamento, ItemOrcamento, Reserva, ItemReserva


@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ['nome', 'ativo']
    list_filter = ['ativo']
    search_fields = ['nome']
    ordering = ['nome']


class ItemOrcamentoInline(admin.TabularInline):
    model = ItemOrcamento
    extra = 0
    readonly_fields = ['valor_unitario', 'valor_total']


class ItemReservaInline(admin.TabularInline):
    model = ItemReserva
    extra = 0
    readonly_fields = ['valor_unitario', 'valor_total']


@admin.register(Equipamento)
class EquipamentoAdmin(admin.ModelAdmin):
    list_display = [
        'nome', 'categoria', 'marca', 'modelo', 'valor_diaria', 
        'quantidade_disponivel', 'quantidade_total', 'estado'
    ]
    list_filter = ['categoria', 'estado', 'marca']
    search_fields = ['nome', 'marca', 'modelo', 'descricao']
    ordering = ['categoria__nome', 'nome']
    readonly_fields = ['data_cadastro', 'data_atualizacao']
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('nome', 'categoria', 'marca', 'modelo', 'descricao', 'numero_serie')
        }),
        ('Valores', {
            'fields': ('valor_diaria', 'valor_semanal', 'valor_mensal')
        }),
        ('Estoque e Estado', {
            'fields': ('quantidade_total', 'quantidade_disponivel', 'estado')
        }),
        ('Especificações e Imagens', {
            'fields': ('especificacoes_tecnicas', 'imagem_principal', 'imagens_adicionais'),
            'classes': ('collapse',)
        }),
        ('Observações', {
            'fields': ('observacoes',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('data_cadastro', 'data_atualizacao'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Orcamento)
class OrcamentoAdmin(admin.ModelAdmin):
    list_display = ['id', 'cliente', 'status', 'valor_total', 'data_criacao']
    list_filter = ['status', 'data_criacao']
    search_fields = ['cliente__nome_completo', 'cliente__email']
    ordering = ['-data_criacao']
    readonly_fields = ['valor_total', 'data_criacao', 'data_atualizacao']
    inlines = [ItemOrcamentoInline]
    
    def get_readonly_fields(self, request, obj=None):
        if obj and obj.status != 'rascunho':
            return self.readonly_fields + ['cliente', 'status']
        return self.readonly_fields


@admin.register(Reserva)
class ReservaAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'cliente', 'status', 'data_uso', 'local_evento', 
        'valor_total', 'data_criacao'
    ]
    list_filter = ['status', 'data_uso', 'data_criacao']
    search_fields = ['cliente__nome_completo', 'cliente__email', 'local_evento']
    ordering = ['-data_criacao']
    readonly_fields = ['data_criacao', 'data_atualizacao', 'data_aprovacao']
    inlines = [ItemReservaInline]
    
    fieldsets = (
        ('Informações da Reserva', {
            'fields': ('cliente', 'orcamento', 'status', 'data_uso', 'local_evento')
        }),
        ('Valores', {
            'fields': ('valor_total',)
        }),
        ('Observações', {
            'fields': ('observacoes',),
            'classes': ('collapse',)
        }),
        ('Controle Administrativo', {
            'fields': ('aprovado_por', 'data_aprovacao'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('data_criacao', 'data_atualizacao'),
            'classes': ('collapse',)
        }),
    )
    
    def save_model(self, request, obj, form, change):
        if change and 'status' in form.changed_data:
            if obj.status == 'aprovada' and not obj.aprovado_por:
                obj.aprovado_por = request.user
                from django.utils import timezone
                obj.data_aprovacao = timezone.now()
        super().save_model(request, obj, form, change)


@admin.register(ItemOrcamento)
class ItemOrcamentoAdmin(admin.ModelAdmin):
    list_display = [
        'orcamento', 'equipamento', 'quantidade', 'modalidade', 
        'periodo', 'valor_total'
    ]
    list_filter = ['modalidade', 'data_uso']
    search_fields = ['equipamento__nome', 'orcamento__cliente__nome_completo']
    readonly_fields = ['valor_unitario', 'valor_total']


@admin.register(ItemReserva)
class ItemReservaAdmin(admin.ModelAdmin):
    list_display = [
        'reserva', 'equipamento', 'quantidade', 'modalidade', 
        'periodo', 'valor_total'
    ]
    list_filter = ['modalidade']
    search_fields = ['equipamento__nome', 'reserva__cliente__nome_completo']
    readonly_fields = ['valor_unitario', 'valor_total']

