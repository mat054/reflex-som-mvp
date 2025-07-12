from django.urls import path
from . import views

urlpatterns = [
    # Categorias
    path('categorias/', views.CategoriaListCreateView.as_view(), name='categoria-list-create'),
    path('categorias/<int:pk>/', views.CategoriaDetailView.as_view(), name='categoria-detail'),
    
    # Equipamentos
    path('equipamentos/', views.EquipamentoListView.as_view(), name='equipamento-list'),
    path('equipamentos/<int:pk>/', views.EquipamentoDetailView.as_view(), name='equipamento-detail'),
    path('equipamentos/criar/', views.EquipamentoCreateView.as_view(), name='equipamento-create'),
    path('equipamentos/<int:pk>/editar/', views.EquipamentoUpdateView.as_view(), name='equipamento-update'),
    path('equipamentos/<int:pk>/remover/', views.EquipamentoDeleteView.as_view(), name='equipamento-delete'),
    
    # Orçamentos
    path('orcamentos/', views.OrcamentoListView.as_view(), name='orcamento-list'),
    path('orcamentos/criar/', views.OrcamentoCreateView.as_view(), name='orcamento-create'),
    path('orcamentos/<int:pk>/', views.OrcamentoDetailView.as_view(), name='orcamento-detail'),
    path('orcamentos/<int:orcamento_id>/adicionar-item/', views.adicionar_item_orcamento, name='orcamento-adicionar-item'),
    path('orcamentos/<int:orcamento_id>/remover-item/<int:item_id>/', views.remover_item_orcamento, name='orcamento-remover-item'),
    path('orcamentos/<int:orcamento_id>/finalizar/', views.finalizar_orcamento, name='orcamento-finalizar'),
    
    # Reservas
    path('reservas/', views.ReservaListView.as_view(), name='reserva-list'),
    path('reservas/<int:pk>/', views.ReservaDetailView.as_view(), name='reserva-detail'),
    path('orcamentos/<int:orcamento_id>/criar-reserva/', views.criar_reserva_do_orcamento, name='criar-reserva-orcamento'),
    
    # Administração de reservas
    path('admin/reservas/', views.ReservaAdminListView.as_view(), name='reserva-admin-list'),
    path('admin/reservas/<int:reserva_id>/aprovar/', views.aprovar_reserva, name='reserva-aprovar'),
    path('admin/reservas/<int:reserva_id>/rejeitar/', views.rejeitar_reserva, name='reserva-rejeitar'),
]

