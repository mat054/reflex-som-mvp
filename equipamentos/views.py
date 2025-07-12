from rest_framework import generics, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.db import transaction
from .models import Categoria, Equipamento, Orcamento, ItemOrcamento, Reserva, ItemReserva
from .serializers import (
    CategoriaSerializer, EquipamentoSerializer, EquipamentoCreateSerializer,
    EquipamentoListSerializer, OrcamentoSerializer, OrcamentoListSerializer,
    ItemOrcamentoSerializer, ItemOrcamentoCreateSerializer,
    ReservaSerializer, ReservaListSerializer, ReservaCreateSerializer,
    ItemReservaSerializer
)


# Views para Categorias
class CategoriaListCreateView(generics.ListCreateAPIView):
    queryset = Categoria.objects.filter(ativo=True)
    serializer_class = CategoriaSerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        """Apenas admins podem criar categorias"""
        if self.request.method == 'POST':
            return [IsAdminUser()]
        return [IsAuthenticated()]


class CategoriaDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [IsAdminUser]


# Views para Equipamentos
class EquipamentoListView(generics.ListAPIView):
    """Lista equipamentos com filtros"""
    queryset = Equipamento.objects.select_related('categoria').all()
    serializer_class = EquipamentoListSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['categoria', 'estado', 'marca']
    search_fields = ['nome', 'marca', 'modelo', 'descricao']
    ordering_fields = ['nome', 'valor_diaria', 'data_cadastro']
    ordering = ['categoria__nome', 'nome']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filtro por disponibilidade
        disponivel = self.request.query_params.get('disponivel')
        if disponivel is not None:
            if disponivel.lower() in ['true', '1']:
                queryset = queryset.filter(estado='disponivel', quantidade_disponivel__gt=0)
            elif disponivel.lower() in ['false', '0']:
                queryset = queryset.exclude(estado='disponivel', quantidade_disponivel__gt=0)
        
        # Filtro por faixa de preço
        preco_min = self.request.query_params.get('preco_min')
        preco_max = self.request.query_params.get('preco_max')
        
        if preco_min:
            try:
                queryset = queryset.filter(valor_diaria__gte=float(preco_min))
            except ValueError:
                pass
        
        if preco_max:
            try:
                queryset = queryset.filter(valor_diaria__lte=float(preco_max))
            except ValueError:
                pass
        
        return queryset


class EquipamentoDetailView(generics.RetrieveAPIView):
    """Detalhes de um equipamento específico"""
    queryset = Equipamento.objects.select_related('categoria').all()
    serializer_class = EquipamentoSerializer
    permission_classes = [IsAuthenticated]


class EquipamentoCreateView(generics.CreateAPIView):
    """Criar novo equipamento (apenas admins)"""
    queryset = Equipamento.objects.all()
    serializer_class = EquipamentoCreateSerializer
    permission_classes = [IsAdminUser]


class EquipamentoUpdateView(generics.UpdateAPIView):
    """Atualizar equipamento (apenas admins)"""
    queryset = Equipamento.objects.all()
    serializer_class = EquipamentoCreateSerializer
    permission_classes = [IsAdminUser]


class EquipamentoDeleteView(generics.DestroyAPIView):
    """Remover equipamento (apenas admins)"""
    queryset = Equipamento.objects.all()
    permission_classes = [IsAdminUser]
    
    def destroy(self, request, *args, **kwargs):
        equipamento = self.get_object()
        
        # Verificar se há reservas futuras ou ativas
        reservas_ativas = ItemReserva.objects.filter(
            equipamento=equipamento,
            reserva__status__in=['pendente', 'aprovada', 'ativa']
        ).exists()
        
        if reservas_ativas:
            return Response(
                {'error': 'Este equipamento não pode ser removido, pois está vinculado a reservas em andamento ou futuras.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return super().destroy(request, *args, **kwargs)


# Views para Orçamentos
class OrcamentoListView(generics.ListAPIView):
    """Lista orçamentos do cliente autenticado"""
    serializer_class = OrcamentoListSerializer
    permission_classes = [IsAuthenticated]
    ordering = ['-data_criacao']
    
    def get_queryset(self):
        return Orcamento.objects.filter(cliente=self.request.user)


class OrcamentoDetailView(generics.RetrieveAPIView):
    """Detalhes de um orçamento específico"""
    serializer_class = OrcamentoSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Orcamento.objects.filter(cliente=self.request.user)


class OrcamentoCreateView(generics.CreateAPIView):
    """Criar novo orçamento"""
    serializer_class = OrcamentoSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(cliente=self.request.user)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def adicionar_item_orcamento(request, orcamento_id):
    """Adicionar item ao orçamento"""
    try:
        orcamento = get_object_or_404(Orcamento, id=orcamento_id, cliente=request.user)
        
        if orcamento.status != 'rascunho':
            return Response(
                {'error': 'Só é possível adicionar itens a orçamentos em rascunho.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = ItemOrcamentoCreateSerializer(data=request.data)
        if serializer.is_valid():
            # Verificar se o item já existe no orçamento
            equipamento = serializer.validated_data['equipamento']
            if ItemOrcamento.objects.filter(orcamento=orcamento, equipamento=equipamento).exists():
                return Response(
                    {'error': 'Este equipamento já foi adicionado ao orçamento.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            serializer.save(orcamento=orcamento)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        return Response(
            {'error': 'Erro interno do servidor.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remover_item_orcamento(request, orcamento_id, item_id):
    """Remover item do orçamento"""
    try:
        orcamento = get_object_or_404(Orcamento, id=orcamento_id, cliente=request.user)
        
        if orcamento.status != 'rascunho':
            return Response(
                {'error': 'Só é possível remover itens de orçamentos em rascunho.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        item = get_object_or_404(ItemOrcamento, id=item_id, orcamento=orcamento)
        item.delete()
        
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    except Exception as e:
        return Response(
            {'error': 'Erro interno do servidor.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def finalizar_orcamento(request, orcamento_id):
    """Finalizar orçamento"""
    try:
        orcamento = get_object_or_404(Orcamento, id=orcamento_id, cliente=request.user)
        
        if orcamento.status != 'rascunho':
            return Response(
                {'error': 'Este orçamento já foi finalizado.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not orcamento.itens.exists():
            return Response(
                {'error': 'Não é possível finalizar um orçamento sem itens.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        orcamento.status = 'finalizado'
        orcamento.save()
        
        serializer = OrcamentoSerializer(orcamento)
        return Response(serializer.data)
    
    except Exception as e:
        return Response(
            {'error': 'Erro interno do servidor.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# Views para Reservas
class ReservaListView(generics.ListAPIView):
    """Lista reservas do cliente autenticado"""
    serializer_class = ReservaListSerializer
    permission_classes = [IsAuthenticated]
    ordering = ['-data_criacao']
    
    def get_queryset(self):
        return Reserva.objects.filter(cliente=self.request.user)


class ReservaDetailView(generics.RetrieveAPIView):
    """Detalhes de uma reserva específica"""
    serializer_class = ReservaSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Reserva.objects.filter(cliente=self.request.user)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def criar_reserva_do_orcamento(request, orcamento_id):
    """Criar reserva a partir de um orçamento"""
    try:
        with transaction.atomic():
            orcamento = get_object_or_404(Orcamento, id=orcamento_id, cliente=request.user)
            
            if orcamento.status != 'finalizado':
                return Response(
                    {'error': 'Só é possível criar reserva de orçamentos finalizados.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if not orcamento.itens.exists():
                return Response(
                    {'error': 'Orçamento não possui itens.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validar dados da reserva
            serializer = ReservaCreateSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            # Verificar disponibilidade final dos equipamentos
            for item in orcamento.itens.all():
                if item.quantidade > item.equipamento.quantidade_disponivel:
                    return Response(
                        {'error': f'Equipamento {item.equipamento.nome} não possui quantidade suficiente disponível.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Criar reserva
            reserva = Reserva.objects.create(
                cliente=request.user,
                orcamento=orcamento,
                data_uso=serializer.validated_data['data_uso'],
                local_evento=serializer.validated_data['local_evento'],
                observacoes=serializer.validated_data.get('observacoes', ''),
                valor_total=orcamento.valor_total
            )
            
            # Criar itens da reserva
            for item_orcamento in orcamento.itens.all():
                ItemReserva.objects.create(
                    reserva=reserva,
                    equipamento=item_orcamento.equipamento,
                    quantidade=item_orcamento.quantidade,
                    modalidade=item_orcamento.modalidade,
                    periodo=item_orcamento.periodo,
                    valor_unitario=item_orcamento.valor_unitario,
                    valor_total=item_orcamento.valor_total
                )
            
            # Marcar orçamento como convertido
            orcamento.status = 'convertido'
            orcamento.save()
            
            serializer = ReservaSerializer(reserva)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        return Response(
            {'error': 'Erro interno do servidor.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# Views administrativas
class ReservaAdminListView(generics.ListAPIView):
    """Lista todas as reservas (apenas admins)"""
    queryset = Reserva.objects.all()
    serializer_class = ReservaListSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'data_uso']
    ordering = ['-data_criacao']


@api_view(['POST'])
@permission_classes([IsAdminUser])
def aprovar_reserva(request, reserva_id):
    """Aprovar reserva (apenas admins)"""
    try:
        reserva = get_object_or_404(Reserva, id=reserva_id)
        
        if reserva.status != 'pendente':
            return Response(
                {'error': 'Só é possível aprovar reservas pendentes.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        reserva.status = 'aprovada'
        reserva.aprovado_por = request.user
        reserva.data_aprovacao = timezone.now()
        reserva.save()
        
        serializer = ReservaSerializer(reserva)
        return Response(serializer.data)
    
    except Exception as e:
        return Response(
            {'error': 'Erro interno do servidor.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAdminUser])
def rejeitar_reserva(request, reserva_id):
    """Rejeitar reserva (apenas admins)"""
    try:
        reserva = get_object_or_404(Reserva, id=reserva_id)
        
        if reserva.status != 'pendente':
            return Response(
                {'error': 'Só é possível rejeitar reservas pendentes.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        reserva.status = 'rejeitada'
        reserva.save()
        
        serializer = ReservaSerializer(reserva)
        return Response(serializer.data)
    
    except Exception as e:
        return Response(
            {'error': 'Erro interno do servidor.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

