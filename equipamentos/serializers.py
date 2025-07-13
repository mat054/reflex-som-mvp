from rest_framework import serializers
from .models import Categoria, Equipamento, Reserva, ItemReserva
from clientes.models import Cliente


class CategoriaSerializer(serializers.ModelSerializer):
    """
    Serializer para Categoria de equipamentos
    """
    class Meta:
        model = Categoria
        fields = ['id', 'nome', 'descricao', 'ativo']
        read_only_fields = ['id']


class EquipamentoListSerializer(serializers.ModelSerializer):
    """
    Serializer para listagem de equipamentos (campos resumidos)
    """
    categoria_nome = serializers.CharField(source='categoria.nome', read_only=True)
    disponivel = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Equipamento
        fields = [
            'id', 'nome', 'categoria', 'categoria_nome', 'marca', 'modelo',
            'valor_diaria', 'estado', 'quantidade_disponivel', 'disponivel',
            'imagem_principal'
        ]
        read_only_fields = ['id', 'disponivel']


class EquipamentoDetailSerializer(serializers.ModelSerializer):
    """
    Serializer para detalhes completos do equipamento
    """
    categoria_nome = serializers.CharField(source='categoria.nome', read_only=True)
    disponivel = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Equipamento
        fields = [
            'id', 'nome', 'categoria', 'categoria_nome', 'descricao',
            'marca', 'modelo', 'especificacoes_tecnicas', 'valor_diaria',
            'valor_semanal', 'valor_mensal', 'estado', 'quantidade_disponivel',
            'quantidade_total', 'numero_serie', 'observacoes',
            'imagem_principal', 'imagens_adicionais', 'disponivel',
            'data_cadastro', 'data_atualizacao'
        ]
        read_only_fields = ['id', 'disponivel', 'data_cadastro', 'data_atualizacao']


class EquipamentoCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer para criação e atualização de equipamentos
    """
    class Meta:
        model = Equipamento
        fields = [
            'nome', 'categoria', 'descricao', 'marca', 'modelo',
            'especificacoes_tecnicas', 'valor_diaria', 'valor_semanal',
            'valor_mensal', 'estado', 'quantidade_disponivel',
            'quantidade_total', 'numero_serie', 'observacoes',
            'imagem_principal', 'imagens_adicionais'
        ]
    
    def validate(self, attrs):
        """Validações customizadas"""
        # Validar que quantidade_disponivel não seja maior que quantidade_total
        quantidade_disponivel = attrs.get('quantidade_disponivel', 0)
        quantidade_total = attrs.get('quantidade_total', 1)
        
        if quantidade_disponivel > quantidade_total:
            raise serializers.ValidationError(
                "Quantidade disponível não pode ser maior que a quantidade total."
            )
        
        # Validar valores
        valor_diaria = attrs.get('valor_diaria')
        valor_semanal = attrs.get('valor_semanal')
        valor_mensal = attrs.get('valor_mensal')
        
        if valor_semanal and valor_semanal <= valor_diaria * 7:
            raise serializers.ValidationError(
                "Valor semanal deve ser menor que 7 vezes o valor da diária para ser vantajoso."
            )
        
        if valor_mensal and valor_mensal <= valor_diaria * 30:
            raise serializers.ValidationError(
                "Valor mensal deve ser menor que 30 vezes o valor da diária para ser vantajoso."
            )
        
        return attrs


class EquipamentoCalculoValorSerializer(serializers.Serializer):
    """
    Serializer para cálculo de valor por período
    """
    equipamento_id = serializers.IntegerField(required=True)
    dias = serializers.IntegerField(required=True, min_value=1)
    
    def validate_equipamento_id(self, value):
        """Validar se equipamento existe"""
        try:
            equipamento = Equipamento.objects.get(id=value)
            return value
        except Equipamento.DoesNotExist:
            raise serializers.ValidationError("Equipamento não encontrado.")
    
    def get_valor_calculado(self):
        """Calcular valor para o período especificado"""
        equipamento_id = self.validated_data['equipamento_id']
        dias = self.validated_data['dias']
        
        equipamento = Equipamento.objects.get(id=equipamento_id)
        valor_total = equipamento.calcular_valor_periodo(dias)
        
        return {
            'equipamento_id': equipamento_id,
            'equipamento_nome': equipamento.nome,
            'dias': dias,
            'valor_diaria': equipamento.valor_diaria,
            'valor_semanal': equipamento.valor_semanal,
            'valor_mensal': equipamento.valor_mensal,
            'valor_total_calculado': valor_total
        }


class ItemReservaSerializer(serializers.ModelSerializer):
    """
    Serializer para itens de reserva
    """
    equipamento_nome = serializers.CharField(source='equipamento.nome', read_only=True)
    equipamento_marca = serializers.CharField(source='equipamento.marca', read_only=True)
    equipamento_modelo = serializers.CharField(source='equipamento.modelo', read_only=True)
    equipamento_imagem = serializers.CharField(source='equipamento.imagem_principal', read_only=True)
    
    class Meta:
        model = ItemReserva
        fields = [
            'id', 'equipamento', 'equipamento_nome', 'equipamento_marca', 
            'equipamento_modelo', 'equipamento_imagem', 'quantidade', 
            'modalidade', 'periodo', 'valor_unitario', 'valor_total'
        ]
        read_only_fields = ['id']


class ReservaCreateSerializer(serializers.ModelSerializer):
    """
    Serializer para criação de reservas
    """
    itens = ItemReservaSerializer(many=True, write_only=True)
    
    class Meta:
        model = Reserva
        fields = ['data_uso', 'observacoes', 'itens']
    
    def validate_data_uso(self, value):
        """Validar se a data de uso é futura"""
        from datetime import date
        if value <= date.today():
            raise serializers.ValidationError("A data de uso deve ser futura.")
        return value
    
    def validate_itens(self, value):
        """Validar itens da reserva"""
        if not value:
            raise serializers.ValidationError("A reserva deve ter pelo menos um item.")
        
        # Verificar disponibilidade de cada item
        for item_data in value:
            equipamento = item_data['equipamento']
            quantidade = item_data['quantidade']
            
            if quantidade > equipamento.quantidade_disponivel:
                raise serializers.ValidationError(
                    f"Quantidade solicitada ({quantidade}) excede a disponível "
                    f"({equipamento.quantidade_disponivel}) para {equipamento.nome}."
                )
            
            if not equipamento.disponivel:
                raise serializers.ValidationError(
                    f"Equipamento {equipamento.nome} não está disponível."
                )
        
        return value
    
    def create(self, validated_data):
        """Criar reserva com itens"""
        itens_data = validated_data.pop('itens')
        
        # Calcular valor total
        valor_total = sum(item['valor_total'] for item in itens_data)
        validated_data['valor_total'] = valor_total
        
        # Criar reserva
        reserva = Reserva.objects.create(**validated_data)
        
        # Criar itens
        for item_data in itens_data:
            ItemReserva.objects.create(reserva=reserva, **item_data)
        
        return reserva


class ClienteReservaSerializer(serializers.ModelSerializer):
    """
    Serializer para dados do cliente na reserva
    """
    class Meta:
        model = Cliente
        fields = ['id', 'nome_completo', 'email', 'telefone']


class ReservaDetailSerializer(serializers.ModelSerializer):
    """
    Serializer para detalhes da reserva
    """
    itens = ItemReservaSerializer(many=True, read_only=True)
    cliente = ClienteReservaSerializer(read_only=True)
    aprovado_por_nome = serializers.CharField(source='aprovado_por.nome_completo', read_only=True)
    
    class Meta:
        model = Reserva
        fields = [
            'id', 'cliente', 'data_uso', 'observacoes', 'status', 'valor_total', 
            'data_solicitacao', 'data_aprovacao', 'aprovado_por', 'aprovado_por_nome', 'itens'
        ]
        read_only_fields = [
            'id', 'cliente', 'data_solicitacao', 'data_aprovacao', 'aprovado_por'
        ]


class ReservaListSerializer(serializers.ModelSerializer):
    """
    Serializer para listagem de reservas
    """
    cliente_nome = serializers.CharField(source='cliente.nome_completo', read_only=True)
    total_itens = serializers.SerializerMethodField()
    
    class Meta:
        model = Reserva
        fields = [
            'id', 'cliente_nome', 'data_uso', 'status', 'valor_total',
            'data_solicitacao', 'total_itens'
        ]
        read_only_fields = ['id']
    
    def get_total_itens(self, obj):
        """Retorna o total de itens na reserva"""
        return obj.itens.count()

