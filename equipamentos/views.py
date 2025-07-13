from rest_framework import generics, permissions, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Categoria, Equipamento, Reserva, ItemReserva
from .serializers import (
    CategoriaSerializer,
    EquipamentoListSerializer,
    EquipamentoDetailSerializer,
    EquipamentoCreateUpdateSerializer,
    EquipamentoCalculoValorSerializer,
    ReservaCreateSerializer,
    ReservaDetailSerializer,
    ReservaListSerializer
)
from .permissions import IsStaffUser
from django.utils import timezone


class CategoriaListView(generics.ListAPIView):
    """
    View para listar categorias ativas
    """
    queryset = Categoria.objects.filter(ativo=True)
    serializer_class = CategoriaSerializer
    permission_classes = [permissions.AllowAny]


class CategoriaCreateView(generics.CreateAPIView):
    """
    View para criar nova categoria (apenas staff)
    """
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [IsStaffUser]


class EquipamentoListView(generics.ListAPIView):
    """
    View para listar equipamentos com filtros
    """
    queryset = Equipamento.objects.all()
    serializer_class = EquipamentoListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['categoria', 'estado', 'marca']
    search_fields = ['nome', 'descricao', 'marca', 'modelo']
    ordering_fields = ['nome', 'valor_diaria', 'data_cadastro']
    ordering = ['categoria__nome', 'nome']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filtro por disponibilidade
        disponivel = self.request.query_params.get('disponivel')
        if disponivel and disponivel != 'all':
            if disponivel.lower() == 'true':
                queryset = queryset.filter(
                    estado='disponivel',
                    quantidade_disponivel__gt=0
                )
            elif disponivel.lower() == 'false':
                queryset = queryset.exclude(
                    estado='disponivel',
                    quantidade_disponivel__gt=0
                )
        
        # Filtro por faixa de preço
        preco_min = self.request.query_params.get('preco_min')
        preco_max = self.request.query_params.get('preco_max')
        
        if preco_min:
            try:
                preco_min_decimal = float(preco_min)
                queryset = queryset.filter(valor_diaria__gte=preco_min_decimal)
            except ValueError:
                pass
        
        if preco_max:
            try:
                preco_max_decimal = float(preco_max)
                queryset = queryset.filter(valor_diaria__lte=preco_max_decimal)
            except ValueError:
                pass
        
        # Filtro por marca
        marca = self.request.query_params.get('marca')
        if marca:
            queryset = queryset.filter(marca__icontains=marca)
        
        # Filtro por categoria
        categoria = self.request.query_params.get('categoria')
        if categoria and categoria != 'all':
            queryset = queryset.filter(categoria_id=categoria)
        
        return queryset


class EquipamentoDetailView(generics.RetrieveAPIView):
    """
    View para detalhes de um equipamento específico
    """
    queryset = Equipamento.objects.all()
    serializer_class = EquipamentoDetailSerializer
    permission_classes = [permissions.AllowAny]


class EquipamentoCreateView(generics.CreateAPIView):
    """
    View para criar novo equipamento (apenas staff)
    """
    queryset = Equipamento.objects.all()
    serializer_class = EquipamentoCreateUpdateSerializer
    permission_classes = [IsStaffUser]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            equipamento = serializer.save()
            
            # Retornar dados completos do equipamento criado
            detail_serializer = EquipamentoDetailSerializer(equipamento)
            
            return Response({
                'message': 'Equipamento cadastrado com sucesso!',
                'equipamento': detail_serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EquipamentoUpdateView(generics.UpdateAPIView):
    """
    View para atualizar equipamento (apenas staff)
    """
    queryset = Equipamento.objects.all()
    serializer_class = EquipamentoCreateUpdateSerializer
    permission_classes = [IsStaffUser]
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        
        if serializer.is_valid():
            equipamento = serializer.save()
            
            # Retornar dados completos do equipamento atualizado
            detail_serializer = EquipamentoDetailSerializer(equipamento)
            
            return Response({
                'message': 'Equipamento atualizado com sucesso!',
                'equipamento': detail_serializer.data
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EquipamentoDeleteView(generics.DestroyAPIView):
    """
    View para deletar equipamento (apenas staff)
    """
    queryset = Equipamento.objects.all()
    permission_classes = [IsStaffUser]
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Verificar se o equipamento está vinculado a reservas futuras ou ativas
        from django.utils import timezone
        hoje = timezone.now().date()
        
        # Buscar reservas aprovadas ou pendentes com data de uso futura ou igual a hoje
        reservas_ativas = ItemReserva.objects.filter(
            equipamento=instance,
            reserva__status__in=['aprovada', 'pendente'],
            reserva__data_uso__gte=hoje
        ).exists()
        
        if reservas_ativas:
            return Response({
                'error': 'Este equipamento não pode ser removido pois está vinculado a reservas futuras ou ativas. Aguarde a conclusão das reservas antes de removê-lo do catálogo.',
                'can_delete': False
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Se não há reservas ativas, pode deletar
        equipamento_nome = instance.nome
        instance.delete()
        
        return Response({
            'message': f'Equipamento "{equipamento_nome}" removido com sucesso!',
            'can_delete': True
        }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsStaffUser])
def verificar_pode_deletar_equipamento_view(request, equipamento_id):
    """
    View para verificar se um equipamento pode ser deletado
    """
    try:
        equipamento = Equipamento.objects.get(id=equipamento_id)
        
        # Verificar se o equipamento está vinculado a reservas futuras ou ativas
        from django.utils import timezone
        hoje = timezone.now().date()
        
        # Buscar reservas aprovadas ou pendentes com data de uso futura ou igual a hoje
        reservas_ativas = ItemReserva.objects.filter(
            equipamento=equipamento,
            reserva__status__in=['aprovada', 'pendente'],
            reserva__data_uso__gte=hoje
        )
        
        can_delete = not reservas_ativas.exists()
        
        response_data = {
            'can_delete': can_delete,
            'equipamento_nome': equipamento.nome
        }
        
        if not can_delete:
            # Contar quantas reservas ativas existem
            count_reservas = reservas_ativas.count()
            response_data['message'] = f'Este equipamento possui {count_reservas} reserva(s) ativa(s) ou futura(s) e não pode ser removido no momento.'
            response_data['reservas_ativas'] = count_reservas
        
        return Response(response_data, status=status.HTTP_200_OK)
        
    except Equipamento.DoesNotExist:
        return Response({
            'error': 'Equipamento não encontrado.'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': f'Erro interno: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class EquipamentoCalculoValorView(APIView):
    """
    View para calcular valor de locação por período
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = EquipamentoCalculoValorSerializer(data=request.data)
        if serializer.is_valid():
            resultado = serializer.get_valor_calculado()
            return Response(resultado, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def equipamentos_disponiveis_view(request):
    """
    View para listar apenas equipamentos disponíveis
    """
    equipamentos = Equipamento.objects.filter(
        estado='disponivel',
        quantidade_disponivel__gt=0
    )
    
    serializer = EquipamentoListSerializer(equipamentos, many=True)
    return Response({
        'count': equipamentos.count(),
        'equipamentos': serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def equipamentos_por_categoria_view(request, categoria_id):
    """
    View para listar equipamentos de uma categoria específica
    """
    try:
        categoria = Categoria.objects.get(id=categoria_id, ativo=True)
    except Categoria.DoesNotExist:
        return Response({
            'error': 'Categoria não encontrada.'
        }, status=status.HTTP_404_NOT_FOUND)
    
    equipamentos = Equipamento.objects.filter(categoria=categoria)
    
    # Aplicar filtro de disponibilidade se solicitado
    disponivel = request.query_params.get('disponivel')
    if disponivel and disponivel.lower() == 'true':
        equipamentos = equipamentos.filter(
            estado='disponivel',
            quantidade_disponivel__gt=0
        )
    
    serializer = EquipamentoListSerializer(equipamentos, many=True)
    return Response({
        'categoria': CategoriaSerializer(categoria).data,
        'count': equipamentos.count(),
        'equipamentos': serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def buscar_equipamentos_view(request):
    """
    View para busca avançada de equipamentos
    """
    query = request.query_params.get('q', '')
    categoria_id = request.query_params.get('categoria')
    disponivel = request.query_params.get('disponivel')
    preco_min = request.query_params.get('preco_min')
    preco_max = request.query_params.get('preco_max')
    marca = request.query_params.get('marca')
    
    equipamentos = Equipamento.objects.all()
    
    # Filtro por texto
    if query:
        equipamentos = equipamentos.filter(
            Q(nome__icontains=query) |
            Q(descricao__icontains=query) |
            Q(marca__icontains=query) |
            Q(modelo__icontains=query)
        )
    
    # Filtro por categoria
    if categoria_id and categoria_id != 'all':
        equipamentos = equipamentos.filter(categoria_id=categoria_id)
    
    # Filtro por disponibilidade
    if disponivel and disponivel != 'all':
        if disponivel.lower() == 'true':
            equipamentos = equipamentos.filter(
                estado='disponivel',
                quantidade_disponivel__gt=0
            )
        elif disponivel.lower() == 'false':
            equipamentos = equipamentos.exclude(
                estado='disponivel',
                quantidade_disponivel__gt=0
            )
    
    # Filtro por faixa de preço
    if preco_min:
        try:
            preco_min_decimal = float(preco_min)
            equipamentos = equipamentos.filter(valor_diaria__gte=preco_min_decimal)
        except ValueError:
            pass
    
    if preco_max:
        try:
            preco_max_decimal = float(preco_max)
            equipamentos = equipamentos.filter(valor_diaria__lte=preco_max_decimal)
        except ValueError:
            pass
    
    # Filtro por marca
    if marca:
        equipamentos = equipamentos.filter(marca__icontains=marca)
    
    # Ordenação
    equipamentos = equipamentos.order_by('categoria__nome', 'nome')
    
    serializer = EquipamentoListSerializer(equipamentos, many=True)
    return Response({
        'query': query,
        'count': equipamentos.count(),
        'equipamentos': serializer.data
    }, status=status.HTTP_200_OK)


class ReservaCreateView(generics.CreateAPIView):
    """
    View para criar nova reserva
    """
    serializer_class = ReservaCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        # Associar o cliente autenticado à reserva
        serializer.save(cliente=self.request.user)
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            try:
                reserva = self.perform_create(serializer)
                detail_serializer = ReservaDetailSerializer(reserva)
                
                return Response({
                    'message': 'Reserva enviada com sucesso! Aguarde aprovação.',
                    'reserva': detail_serializer.data
                }, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({
                    'error': 'Erro ao processar reserva. Tente novamente.'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ReservaListView(generics.ListAPIView):
    """
    View para listar reservas do cliente
    """
    serializer_class = ReservaListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Reserva.objects.filter(cliente=self.request.user)


class ReservaDetailView(generics.RetrieveAPIView):
    """
    View para detalhes de uma reserva
    """
    serializer_class = ReservaDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Reserva.objects.filter(cliente=self.request.user)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def verificar_disponibilidade_view(request):
    """
    View para verificar disponibilidade de equipamentos em uma data específica
    """
    data_uso = request.data.get('data_uso')
    itens = request.data.get('itens', [])
    
    if not data_uso:
        return Response({
            'error': 'Data de uso é obrigatória.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if not itens:
        return Response({
            'error': 'Lista de itens é obrigatória.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Verificar disponibilidade de cada item
    resultados = []
    todos_disponiveis = True
    
    for item in itens:
        equipamento_id = item.get('equipamento_id')
        quantidade = item.get('quantidade', 1)
        
        try:
            equipamento = Equipamento.objects.get(id=equipamento_id)
            
            disponivel = (
                equipamento.estado == 'disponivel' and 
                equipamento.quantidade_disponivel >= quantidade
            )
            
            if not disponivel:
                todos_disponiveis = False
            
            resultados.append({
                'equipamento_id': equipamento_id,
                'equipamento_nome': equipamento.nome,
                'quantidade_solicitada': quantidade,
                'quantidade_disponivel': equipamento.quantidade_disponivel,
                'disponivel': disponivel,
                'motivo': 'Disponível' if disponivel else 'Quantidade insuficiente ou equipamento indisponível'
            })
            
        except Equipamento.DoesNotExist:
            todos_disponiveis = False
            resultados.append({
                'equipamento_id': equipamento_id,
                'disponivel': False,
                'motivo': 'Equipamento não encontrado'
            })
    
    return Response({
        'data_uso': data_uso,
        'todos_disponiveis': todos_disponiveis,
        'resultados': resultados
    }, status=status.HTTP_200_OK)


# Views para administração de reservas (apenas staff)

class AdminReservaListView(generics.ListAPIView):
    """
    View para listar todas as reservas para administradores
    """
    serializer_class = ReservaDetailSerializer
    permission_classes = [IsStaffUser]
    
    def get_queryset(self):
        queryset = Reserva.objects.all()
        
        # Filtros opcionais
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        cliente_id = self.request.query_params.get('cliente_id')
        if cliente_id:
            queryset = queryset.filter(cliente_id=cliente_id)
        
        data_inicio = self.request.query_params.get('data_inicio')
        if data_inicio:
            queryset = queryset.filter(data_solicitacao__gte=data_inicio)
        
        data_fim = self.request.query_params.get('data_fim')
        if data_fim:
            queryset = queryset.filter(data_solicitacao__lte=data_fim)
        
        return queryset


class AdminReservaDetailView(generics.RetrieveAPIView):
    """
    View para detalhes de uma reserva específica (administradores)
    """
    queryset = Reserva.objects.all()
    serializer_class = ReservaDetailSerializer
    permission_classes = [IsStaffUser]


@api_view(['POST'])
@permission_classes([IsStaffUser])
def aprovar_reserva_view(request, reserva_id):
    """
    View para aprovar uma reserva
    """
    try:
        reserva = Reserva.objects.get(id=reserva_id)
        
        if reserva.status != 'pendente':
            return Response({
                'error': 'Apenas reservas pendentes podem ser aprovadas.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verificar disponibilidade dos equipamentos novamente
        for item in reserva.itens.all():
            if item.equipamento.quantidade_disponivel < item.quantidade:
                return Response({
                    'error': f'Equipamento {item.equipamento.nome} não possui quantidade suficiente disponível.'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Aprovar a reserva
        reserva.status = 'aprovada'
        reserva.data_aprovacao = timezone.now()
        reserva.aprovado_por = request.user
        reserva.save()
        
        # Atualizar quantidade disponível dos equipamentos
        for item in reserva.itens.all():
            equipamento = item.equipamento
            equipamento.quantidade_disponivel -= item.quantidade
            equipamento.save()
        
        return Response({
            'message': 'Reserva aprovada com sucesso!',
            'reserva': ReservaDetailSerializer(reserva).data
        }, status=status.HTTP_200_OK)
        
    except Reserva.DoesNotExist:
        return Response({
            'error': 'Reserva não encontrada.'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': f'Erro interno: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsStaffUser])
def rejeitar_reserva_view(request, reserva_id):
    """
    View para rejeitar uma reserva
    """
    try:
        reserva = Reserva.objects.get(id=reserva_id)
        
        if reserva.status != 'pendente':
            return Response({
                'error': 'Apenas reservas pendentes podem ser rejeitadas.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        motivo = request.data.get('motivo', '')
        
        # Rejeitar a reserva
        reserva.status = 'rejeitada'
        reserva.aprovado_por = request.user
        reserva.observacoes = f"{reserva.observacoes}\n\nMotivo da rejeição: {motivo}".strip()
        reserva.save()
        
        return Response({
            'message': 'Reserva rejeitada com sucesso!',
            'reserva': ReservaDetailSerializer(reserva).data
        }, status=status.HTTP_200_OK)
        
    except Reserva.DoesNotExist:
        return Response({
            'error': 'Reserva não encontrada.'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': f'Erro interno: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsStaffUser])
def estatisticas_reservas_view(request):
    """
    View para estatísticas de reservas para administradores
    """
    try:
        total_reservas = Reserva.objects.count()
        reservas_pendentes = Reserva.objects.filter(status='pendente').count()
        reservas_aprovadas = Reserva.objects.filter(status='aprovada').count()
        reservas_rejeitadas = Reserva.objects.filter(status='rejeitada').count()
        
        return Response({
            'total_reservas': total_reservas,
            'reservas_pendentes': reservas_pendentes,
            'reservas_aprovadas': reservas_aprovadas,
            'reservas_rejeitadas': reservas_rejeitadas,
            'percentual_aprovacao': round((reservas_aprovadas / total_reservas * 100) if total_reservas > 0 else 0, 2)
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': f'Erro interno: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

