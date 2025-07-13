from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal


class Categoria(models.Model):
    """
    Categorias de equipamentos (ex: Som, Iluminação, Estrutura)
    """
    nome = models.CharField(max_length=100, unique=True, verbose_name="Nome da Categoria")
    descricao = models.TextField(blank=True, verbose_name="Descrição")
    ativo = models.BooleanField(default=True, verbose_name="Ativo")
    
    class Meta:
        verbose_name = "Categoria"
        verbose_name_plural = "Categorias"
        ordering = ['nome']
    
    def __str__(self):
        return self.nome


class Equipamento(models.Model):
    """
    Modelo de Equipamento para locação
    """
    ESTADO_CHOICES = [
        ('disponivel', 'Disponível'),
        ('locado', 'Locado'),
        ('manutencao', 'Em Manutenção'),
        ('inativo', 'Inativo'),
    ]
    
    nome = models.CharField(max_length=200, verbose_name="Nome do Equipamento")
    categoria = models.ForeignKey(
        Categoria, 
        on_delete=models.CASCADE, 
        related_name='equipamentos',
        verbose_name="Categoria"
    )
    
    descricao = models.TextField(verbose_name="Descrição")
    marca = models.CharField(max_length=100, verbose_name="Marca")
    modelo = models.CharField(max_length=100, verbose_name="Modelo")
    
    # Especificações técnicas
    especificacoes_tecnicas = models.JSONField(
        default=dict, 
        blank=True,
        help_text="Especificações técnicas em formato JSON",
        verbose_name="Especificações Técnicas"
    )
    
    # Valores
    valor_diaria = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        verbose_name="Valor da Diária"
    )
    
    valor_semanal = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        null=True,
        blank=True,
        verbose_name="Valor Semanal"
    )
    
    valor_mensal = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        null=True,
        blank=True,
        verbose_name="Valor Mensal"
    )
    
    # Estado e disponibilidade
    estado = models.CharField(
        max_length=20,
        choices=ESTADO_CHOICES,
        default='disponivel',
        verbose_name="Estado"
    )
    
    quantidade_disponivel = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(0)],
        verbose_name="Quantidade Disponível"
    )
    
    quantidade_total = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1)],
        verbose_name="Quantidade Total"
    )
    
    # Informações adicionais
    numero_serie = models.CharField(
        max_length=100, 
        unique=True, 
        null=True, 
        blank=True,
        verbose_name="Número de Série"
    )
    
    observacoes = models.TextField(blank=True, verbose_name="Observações")
    
    # Imagens
    imagem_principal = models.URLField(
        blank=True,
        verbose_name="URL da Imagem Principal"
    )
    
    imagens_adicionais = models.JSONField(
        default=list,
        blank=True,
        help_text="URLs de imagens adicionais em formato JSON",
        verbose_name="Imagens Adicionais"
    )
    
    # Timestamps
    data_cadastro = models.DateTimeField(auto_now_add=True, verbose_name="Data de Cadastro")
    data_atualizacao = models.DateTimeField(auto_now=True, verbose_name="Última Atualização")
    
    class Meta:
        verbose_name = "Equipamento"
        verbose_name_plural = "Equipamentos"
        ordering = ['categoria__nome', 'nome']
    
    def __str__(self):
        return f"{self.nome} - {self.marca} {self.modelo}"
    
    @property
    def disponivel(self):
        """Verifica se o equipamento está disponível para locação"""
        return self.estado == 'disponivel' and self.quantidade_disponivel > 0


class Reserva(models.Model):
    """
    Modelo para solicitações de reserva de equipamentos
    """
    STATUS_CHOICES = [
        ('pendente', 'Pendente'),
        ('aprovada', 'Aprovada'),
        ('rejeitada', 'Rejeitada'),
        ('cancelada', 'Cancelada'),
    ]
    
    # Relacionamentos
    cliente = models.ForeignKey(
        'clientes.Cliente',
        on_delete=models.CASCADE,
        related_name='reservas',
        verbose_name="Cliente"
    )
    
    # Dados da reserva
    data_uso = models.DateField(verbose_name="Data de Uso")
    observacoes = models.TextField(blank=True, verbose_name="Observações")
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pendente',
        verbose_name="Status"
    )
    
    # Valor total estimado
    valor_total = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        verbose_name="Valor Total Estimado"
    )
    
    # Timestamps
    data_solicitacao = models.DateTimeField(auto_now_add=True, verbose_name="Data da Solicitação")
    data_aprovacao = models.DateTimeField(null=True, blank=True, verbose_name="Data de Aprovação")
    data_atualizacao = models.DateTimeField(auto_now=True, verbose_name="Última Atualização")
    
    # Dados do staff que aprovou/rejeitou
    aprovado_por = models.ForeignKey(
        'clientes.Cliente',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reservas_aprovadas',
        verbose_name="Aprovado Por"
    )
    
    class Meta:
        verbose_name = "Reserva"
        verbose_name_plural = "Reservas"
        ordering = ['-data_solicitacao']
    
    def __str__(self):
        return f"Reserva #{self.id} - {self.cliente.nome} - {self.data_uso}"


class ItemReserva(models.Model):
    """
    Itens individuais de uma reserva
    """
    MODALIDADE_CHOICES = [
        ('diaria', 'Diária'),
        ('semanal', 'Semanal'),
        ('mensal', 'Mensal'),
    ]
    
    reserva = models.ForeignKey(
        Reserva,
        on_delete=models.CASCADE,
        related_name='itens',
        verbose_name="Reserva"
    )
    
    equipamento = models.ForeignKey(
        Equipamento,
        on_delete=models.CASCADE,
        verbose_name="Equipamento"
    )
    
    quantidade = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
        verbose_name="Quantidade"
    )
    
    modalidade = models.CharField(
        max_length=20,
        choices=MODALIDADE_CHOICES,
        verbose_name="Modalidade"
    )
    
    periodo = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
        verbose_name="Período"
    )
    
    valor_unitario = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        verbose_name="Valor Unitário"
    )
    
    valor_total = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        verbose_name="Valor Total do Item"
    )
    
    class Meta:
        verbose_name = "Item de Reserva"
        verbose_name_plural = "Itens de Reserva"
    
    def __str__(self):
        return f"{self.equipamento.nome} - Qtd: {self.quantidade}"

