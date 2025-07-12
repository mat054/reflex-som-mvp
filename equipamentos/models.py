from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal
from django.conf import settings


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
    
    def calcular_valor_periodo(self, dias):
        """Calcula o valor para um período específico em dias"""
        if dias >= 30 and self.valor_mensal:
            meses = dias // 30
            dias_restantes = dias % 30
            return (meses * self.valor_mensal) + (dias_restantes * self.valor_diaria)
        elif dias >= 7 and self.valor_semanal:
            semanas = dias // 7
            dias_restantes = dias % 7
            return (semanas * self.valor_semanal) + (dias_restantes * self.valor_diaria)
        else:
            return dias * self.valor_diaria


class Orcamento(models.Model):
    """
    Modelo para orçamentos personalizados
    """
    STATUS_CHOICES = [
        ('rascunho', 'Rascunho'),
        ('finalizado', 'Finalizado'),
        ('convertido', 'Convertido em Reserva'),
        ('cancelado', 'Cancelado'),
    ]
    
    cliente = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='orcamentos',
        verbose_name="Cliente"
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='rascunho',
        verbose_name="Status"
    )
    
    valor_total = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        verbose_name="Valor Total"
    )
    
    observacoes = models.TextField(blank=True, verbose_name="Observações")
    
    data_criacao = models.DateTimeField(auto_now_add=True, verbose_name="Data de Criação")
    data_atualizacao = models.DateTimeField(auto_now=True, verbose_name="Última Atualização")
    
    class Meta:
        verbose_name = "Orçamento"
        verbose_name_plural = "Orçamentos"
        ordering = ['-data_criacao']
    
    def __str__(self):
        return f"Orçamento #{self.id} - {self.cliente.nome_completo}"
    
    def calcular_total(self):
        """Calcula o valor total do orçamento"""
        total = sum(item.valor_total for item in self.itens.all())
        self.valor_total = total
        self.save()
        return total


class ItemOrcamento(models.Model):
    """
    Itens do orçamento
    """
    MODALIDADE_CHOICES = [
        ('diaria', 'Diária'),
        ('semanal', 'Semanal'),
        ('mensal', 'Mensal'),
    ]
    
    orcamento = models.ForeignKey(
        Orcamento,
        on_delete=models.CASCADE,
        related_name='itens',
        verbose_name="Orçamento"
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
        max_length=10,
        choices=MODALIDADE_CHOICES,
        default='diaria',
        verbose_name="Modalidade de Preço"
    )
    
    periodo = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
        verbose_name="Período (dias/semanas/meses)"
    )
    
    data_uso = models.DateField(verbose_name="Data Prevista de Uso")
    
    valor_unitario = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Valor Unitário"
    )
    
    valor_total = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name="Valor Total do Item"
    )
    
    class Meta:
        verbose_name = "Item do Orçamento"
        verbose_name_plural = "Itens do Orçamento"
        unique_together = ['orcamento', 'equipamento']
    
    def __str__(self):
        return f"{self.equipamento.nome} - Qtd: {self.quantidade}"
    
    def save(self, *args, **kwargs):
        """Calcula o valor total do item antes de salvar"""
        # Obter o valor unitário baseado na modalidade
        if self.modalidade == 'diaria':
            self.valor_unitario = self.equipamento.valor_diaria
        elif self.modalidade == 'semanal' and self.equipamento.valor_semanal:
            self.valor_unitario = self.equipamento.valor_semanal
        elif self.modalidade == 'mensal' and self.equipamento.valor_mensal:
            self.valor_unitario = self.equipamento.valor_mensal
        else:
            self.valor_unitario = self.equipamento.valor_diaria
        
        # Calcular valor total
        self.valor_total = self.valor_unitario * self.periodo * self.quantidade
        
        super().save(*args, **kwargs)
        
        # Atualizar total do orçamento
        self.orcamento.calcular_total()


class Reserva(models.Model):
    """
    Modelo para reservas de equipamentos
    """
    STATUS_CHOICES = [
        ('pendente', 'Pendente de Aprovação'),
        ('aprovada', 'Aprovada'),
        ('rejeitada', 'Rejeitada'),
        ('ativa', 'Ativa'),
        ('concluida', 'Concluída'),
        ('cancelada', 'Cancelada'),
    ]
    
    cliente = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reservas',
        verbose_name="Cliente"
    )
    
    orcamento = models.ForeignKey(
        Orcamento,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reservas',
        verbose_name="Orçamento Origem"
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pendente',
        verbose_name="Status"
    )
    
    data_uso = models.DateField(verbose_name="Data de Uso")
    local_evento = models.CharField(max_length=255, verbose_name="Local do Evento")
    observacoes = models.TextField(blank=True, verbose_name="Observações")
    
    valor_total = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name="Valor Total"
    )
    
    data_criacao = models.DateTimeField(auto_now_add=True, verbose_name="Data de Criação")
    data_atualizacao = models.DateTimeField(auto_now=True, verbose_name="Última Atualização")
    
    # Campos para controle administrativo
    data_aprovacao = models.DateTimeField(null=True, blank=True, verbose_name="Data de Aprovação")
    aprovado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reservas_aprovadas',
        verbose_name="Aprovado Por"
    )
    
    class Meta:
        verbose_name = "Reserva"
        verbose_name_plural = "Reservas"
        ordering = ['-data_criacao']
    
    def __str__(self):
        return f"Reserva #{self.id} - {self.cliente.nome_completo} - {self.status}"


class ItemReserva(models.Model):
    """
    Itens da reserva
    """
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
        max_length=10,
        choices=ItemOrcamento.MODALIDADE_CHOICES,
        default='diaria',
        verbose_name="Modalidade de Preço"
    )
    
    periodo = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
        verbose_name="Período"
    )
    
    valor_unitario = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Valor Unitário"
    )
    
    valor_total = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name="Valor Total do Item"
    )
    
    class Meta:
        verbose_name = "Item da Reserva"
        verbose_name_plural = "Itens da Reserva"
        unique_together = ['reserva', 'equipamento']
    
    def __str__(self):
        return f"{self.equipamento.nome} - Qtd: {self.quantidade}"

