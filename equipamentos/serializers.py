from rest_framework import serializers
from .models import Categoria, Equipamento, Orcamento, ItemOrcamento, Reserva, ItemReserva
from django.utils import timezone
from datetime import date


class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['id', 'nome', 'descricao', 'ativo']


class EquipamentoSerializer(serializers.ModelSerializer):
    categoria_nome = serializers.CharField(source='categoria.nome', read_only=True)
    disponivel = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Equipamento
        fields = [
            'id', 'nome', 'categoria', 'categoria_nome', 'descricao', 'marca', 'modelo',
            'especificacoes_tecnicas', 'valor_diaria', 'valor_semanal', 'valor_mensal',
            'estado', 'quantidade_disponivel', 'quantidade_total', 'numero_serie',
            'observacoes', 'imagem_principal', 'imagens_adicionais', 'disponivel',
            'data_cadastro', 'data_atualizacao'
        ]
        read_only_fields = ['data_cadastro', 'data_atualizacao']
    
    def validate_quantidade_disponivel(self, value):
        """Valida que a quantidade disponível não seja maior que a total"""
        quantidade_total = self.initial_data.get('quantidade_total')
        if quantidade_total and value > quantidade_total:
            raise serializers.ValidationError(
                "A quantidade disponível não pode ser maior que a quantidade total."
            )
        return value
    
    def validate_valor_diaria(self, value):
        """Valida que o valor da diária seja positivo"""
        if value <= 0:
            raise serializers.ValidationError("O valor da diária deve ser maior que zero.")
        return value


class EquipamentoCreateSerializer(serializers.ModelSerializer):
    """Serializer específico para criação de equipamentos"""
    
    class Meta:
        model = Equipamento
        fields = [
            'nome', 'categoria', 'descricao', 'marca', 'modelo',
            'especificacoes_tecnicas', 'valor_diaria', 'valor_semanal', 'valor_mensal',
            'estado', 'quantidade_disponivel', 'quantidade_total', 'numero_serie',
            'observacoes', 'imagem_principal', 'imagens_adicionais'
        ]
    
    def validate(self, data):
        """Validações gerais do equipamento"""
        if data.get('quantidade_disponivel', 0) > data.get('quantidade_total', 0):
            raise serializers.ValidationError({
                'quantidade_disponivel': 'A quantidade disponível não pode ser maior que a quantidade total.'
            })
        
        if data.get('valor_diaria', 0) <= 0:
            raise serializers.ValidationError({
                'valor_diaria': 'O valor da diária deve ser maior que zero.'
            })
        
        return data


class ItemOrcamentoSerializer(serializers.ModelSerializer):
    equipamento_nome = serializers.CharField(source='equipamento.nome', read_only=True)
    equipamento_marca = serializers.CharField(source='equipamento.marca', read_only=True)
    equipamento_modelo = serializers.CharField(source='equipamento.modelo', read_only=True)
    
    class Meta:
        model = ItemOrcamento
        fields = [
            'id', 'equipamento', 'equipamento_nome', 'equipamento_marca', 'equipamento_modelo',
            'quantidade', 'modalidade', 'periodo', 'data_uso', 'valor_unitario', 'valor_total'
        ]
        read_only_fields = ['valor_unitario', 'valor_total']
    
    def validate_data_uso(self, value):
        """Valida que a data de uso seja futura"""
        if value <= date.today():
            raise serializers.ValidationError("A data de uso deve ser futura.")
        return value
    
    def validate(self, data):
        """Validações do item do orçamento"""
        equipamento = data.get('equipamento')
        quantidade = data.get('quantidade', 0)
        modalidade = data.get('modalidade')
        
        # Verificar disponibilidade
        if equipamento and quantidade > equipamento.quantidade_disponivel:
            raise serializers.ValidationError({
                'quantidade': f'Quantidade solicitada ({quantidade}) maior que a disponível ({equipamento.quantidade_disponivel}).'
            })
        
        # Verificar se a modalidade tem valor definido
        if equipamento and modalidade:
            if modalidade == 'semanal' and not equipamento.valor_semanal:
                raise serializers.ValidationError({
                    'modalidade': 'Este equipamento não possui valor semanal definido.'
                })
            elif modalidade == 'mensal' and not equipamento.valor_mensal:
                raise serializers.ValidationError({
                    'modalidade': 'Este equipamento não possui valor mensal definido.'
                })
        
        return data


class ItemOrcamentoCreateSerializer(serializers.ModelSerializer):
    """Serializer para criação de itens do orçamento"""
    
    class Meta:
        model = ItemOrcamento
        fields = ['equipamento', 'quantidade', 'modalidade', 'periodo', 'data_uso']
    
    def validate_data_uso(self, value):
        """Valida que a data de uso seja futura"""
        if value <= date.today():
            raise serializers.ValidationError("A data de uso deve ser futura.")
        return value


class OrcamentoSerializer(serializers.ModelSerializer):
    itens = ItemOrcamentoSerializer(many=True, read_only=True)
    cliente_nome = serializers.CharField(source='cliente.nome_completo', read_only=True)
    
    class Meta:
        model = Orcamento
        fields = [
            'id', 'cliente', 'cliente_nome', 'status', 'valor_total', 'observacoes',
            'data_criacao', 'data_atualizacao', 'itens'
        ]
        read_only_fields = ['cliente', 'valor_total', 'data_criacao', 'data_atualizacao']


class ItemReservaSerializer(serializers.ModelSerializer):
    equipamento_nome = serializers.CharField(source='equipamento.nome', read_only=True)
    equipamento_marca = serializers.CharField(source='equipamento.marca', read_only=True)
    equipamento_modelo = serializers.CharField(source='equipamento.modelo', read_only=True)
    
    class Meta:
        model = ItemReserva
        fields = [
            'id', 'equipamento', 'equipamento_nome', 'equipamento_marca', 'equipamento_modelo',
            'quantidade', 'modalidade', 'periodo', 'valor_unitario', 'valor_total'
        ]


class ReservaSerializer(serializers.ModelSerializer):
    itens = ItemReservaSerializer(many=True, read_only=True)
    cliente_nome = serializers.CharField(source='cliente.nome_completo', read_only=True)
    
    class Meta:
        model = Reserva
        fields = [
            'id', 'cliente', 'cliente_nome', 'orcamento', 'status', 'data_uso',
            'local_evento', 'observacoes', 'valor_total', 'data_criacao',
            'data_atualizacao', 'data_aprovacao', 'aprovado_por', 'itens'
        ]
        read_only_fields = ['cliente', 'data_criacao', 'data_atualizacao', 'data_aprovacao', 'aprovado_por']


class ReservaCreateSerializer(serializers.ModelSerializer):
    """Serializer para criação de reservas"""
    
    class Meta:
        model = Reserva
        fields = ['orcamento', 'data_uso', 'local_evento', 'observacoes']
    
    def validate_data_uso(self, value):
        """Valida que a data de uso seja futura"""
        if value <= date.today():
            raise serializers.ValidationError("A data de uso deve ser futura.")
        return value
    
    def validate_local_evento(self, value):
        """Valida que o local do evento seja informado"""
        if not value or not value.strip():
            raise serializers.ValidationError("O local do evento é obrigatório.")
        return value.strip()


# Serializers para listagem simplificada
class EquipamentoListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listagem de equipamentos"""
    categoria_nome = serializers.CharField(source='categoria.nome', read_only=True)
    disponivel = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Equipamento
        fields = [
            'id', 'nome', 'categoria_nome', 'marca', 'modelo', 'valor_diaria',
            'quantidade_disponivel', 'estado', 'imagem_principal', 'disponivel'
        ]


class OrcamentoListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listagem de orçamentos"""
    cliente_nome = serializers.CharField(source='cliente.nome_completo', read_only=True)
    total_itens = serializers.SerializerMethodField()
    
    class Meta:
        model = Orcamento
        fields = [
            'id', 'cliente_nome', 'status', 'valor_total', 'total_itens', 'data_criacao'
        ]
    
    def get_total_itens(self, obj):
        return obj.itens.count()


class ReservaListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listagem de reservas"""
    cliente_nome = serializers.CharField(source='cliente.nome_completo', read_only=True)
    total_itens = serializers.SerializerMethodField()
    
    class Meta:
        model = Reserva
        fields = [
            'id', 'cliente_nome', 'status', 'data_uso', 'local_evento',
            'valor_total', 'total_itens', 'data_criacao'
        ]
    
    def get_total_itens(self, obj):
        return obj.itens.count()

