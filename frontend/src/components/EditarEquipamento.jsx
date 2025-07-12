import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { equipamentoService } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import Layout from './Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Package,
  DollarSign,
  Settings,
  Image as ImageIcon,
  Info
} from 'lucide-react';

const EditarEquipamento = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    nome: '',
    categoria: '',
    marca: '',
    modelo: '',
    descricao: '',
    numero_serie: '',
    valor_diaria: '',
    valor_semanal: '',
    valor_mensal: '',
    quantidade_total: '1',
    quantidade_disponivel: '1',
    estado: 'disponivel',
    imagem_principal: '',
    observacoes: '',
    especificacoes_tecnicas: {}
  });

  const [especificacoes, setEspecificacoes] = useState([{ chave: '', valor: '' }]);
  const [imagensAdicionais, setImagensAdicionais] = useState(['']);

  useEffect(() => {
    if (!user?.is_staff) {
      navigate('/equipamentos');
      return;
    }
    loadCategorias();
    loadEquipamento();
  }, [user, navigate, id]);

  const loadCategorias = async () => {
    try {
      const response = await equipamentoService.listarCategorias();
      setCategorias(Array.isArray(response) ? response : response.results || []);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const loadEquipamento = async () => {
    try {
      setLoading(true);
      const data = await equipamentoService.obter(id);
      setFormData({
        nome: data.nome || '',
        categoria: data.categoria ? data.categoria.toString() : '',
        marca: data.marca || '',
        modelo: data.modelo || '',
        descricao: data.descricao || '',
        numero_serie: data.numero_serie || '',
        valor_diaria: data.valor_diaria || '',
        valor_semanal: data.valor_semanal || '',
        valor_mensal: data.valor_mensal || '',
        quantidade_total: data.quantidade_total ? data.quantidade_total.toString() : '1',
        quantidade_disponivel: data.quantidade_disponivel ? data.quantidade_disponivel.toString() : '1',
        estado: data.estado || 'disponivel',
        imagem_principal: data.imagem_principal || '',
        observacoes: data.observacoes || '',
        especificacoes_tecnicas: data.especificacoes_tecnicas || {}
      });

      if (data.especificacoes_tecnicas && Object.keys(data.especificacoes_tecnicas).length > 0) {
        setEspecificacoes(Object.entries(data.especificacoes_tecnicas).map(([chave, valor]) => ({ chave, valor })));
      } else {
        setEspecificacoes([{ chave: '', valor: '' }]);
      }

      if (data.imagens_adicionais && data.imagens_adicionais.length > 0) {
        setImagensAdicionais(data.imagens_adicionais);
      } else {
        setImagensAdicionais(['']);
      }

    } catch (error) {
      console.error('Erro ao carregar equipamento para edição:', error);
      setErrors({ general: 'Erro ao carregar equipamento para edição.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleEspecificacaoChange = (index, field, value) => {
    const newEspecificacoes = [...especificacoes];
    newEspecificacoes[index][field] = value;
    setEspecificacoes(newEspecificacoes);
  };

  const addEspecificacao = () => {
    setEspecificacoes([...especificacoes, { chave: '', valor: '' }]);
  };

  const removeEspecificacao = (index) => {
    if (especificacoes.length > 1) {
      setEspecificacoes(especificacoes.filter((_, i) => i !== index));
    }
  };

  const handleImagemAdicionalChange = (index, value) => {
    const newImagens = [...imagensAdicionais];
    newImagens[index] = value;
    setImagensAdicionais(newImagens);
  };

  const addImagemAdicional = () => {
    setImagensAdicionais([...imagensAdicionais, '']);
  };

  const removeImagemAdicional = (index) => {
    if (imagensAdicionais.length > 1) {
      setImagensAdicionais(imagensAdicionais.filter((_, i) => i !== index));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nome.trim()) newErrors.nome = 'Nome é obrigatório';
    if (!formData.categoria) newErrors.categoria = 'Categoria é obrigatória';
    if (!formData.marca.trim()) newErrors.marca = 'Marca é obrigatória';
    if (!formData.modelo.trim()) newErrors.modelo = 'Modelo é obrigatório';
    if (!formData.descricao.trim()) newErrors.descricao = 'Descrição é obrigatória';
    if (!formData.valor_diaria || parseFloat(formData.valor_diaria) <= 0) {
      newErrors.valor_diaria = 'Valor da diária deve ser maior que zero';
    }

    const qtdTotal = parseInt(formData.quantidade_total);
    const qtdDisponivel = parseInt(formData.quantidade_disponivel);
    
    if (!qtdTotal || qtdTotal < 1) {
      newErrors.quantidade_total = 'Quantidade total deve ser maior que zero';
    }
    if (!qtdDisponivel || qtdDisponivel < 0) {
      newErrors.quantidade_disponivel = 'Quantidade disponível deve ser maior ou igual a zero';
    }
    if (qtdDisponivel > qtdTotal) {
      newErrors.quantidade_disponivel = 'Quantidade disponível não pode ser maior que a total';
    }

    if (formData.valor_semanal && parseFloat(formData.valor_semanal) <= 0) {
      newErrors.valor_semanal = 'Valor semanal deve ser maior que zero';
    }
    if (formData.valor_mensal && parseFloat(formData.valor_mensal) <= 0) {
      newErrors.valor_mensal = 'Valor mensal deve ser maior que zero';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const especificacoesTecnicas = {};
      especificacoes.forEach(spec => {
        if (spec.chave.trim() && spec.valor.trim()) {
          especificacoesTecnicas[spec.chave.trim()] = spec.valor.trim();
        }
      });

      const imagensAdicionaisLimpas = imagensAdicionais
        .filter(img => img.trim())
        .map(img => img.trim());

      const equipamentoData = {
        ...formData,
        especificacoes_tecnicas: especificacoesTecnicas,
        imagens_adicionais: imagensAdicionaisLimpas,
        valor_diaria: parseFloat(formData.valor_diaria),
        valor_semanal: formData.valor_semanal ? parseFloat(formData.valor_semanal) : null,
        valor_mensal: formData.valor_mensal ? parseFloat(formData.valor_mensal) : null,
        quantidade_total: parseInt(formData.quantidade_total),
        quantidade_disponivel: parseInt(formData.quantidade_disponivel)
      };

      await equipamentoService.atualizar(id, equipamentoData);
      
      navigate('/equipamentos', {
        state: { message: 'Equipamento atualizado com sucesso!' }
      });
    } catch (error) {
      console.error('Erro ao atualizar equipamento:', error);
      
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ general: 'Erro ao atualizar equipamento. Tente novamente.' });
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/equipamentos/${id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Editar Equipamento</h1>
            <p className="text-gray-600 mt-1">
              Atualize as informações do equipamento
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Informações Básicas</span>
              </CardTitle>
              <CardDescription>
                Dados principais do equipamento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-red-600 text-sm">{errors.general}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Equipamento *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => handleInputChange('nome', e.target.value)}
                    placeholder="Ex: Caixa de Som JBL EON615"
                    className={errors.nome ? 'border-red-500' : ''}
                  />
                  {errors.nome && <p className="text-red-500 text-sm">{errors.nome}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Categoria *</Label>
                  <Select
                    value={formData.categoria}
                    onValueChange={(value) => handleInputChange('categoria', value)}
                  >
                    <SelectTrigger className={errors.categoria ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((categoria) => (
                        <SelectItem key={categoria.id} value={categoria.id.toString()}>
                          {categoria.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.categoria && <p className="text-red-500 text-sm">{errors.categoria}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="marca">Marca *</Label>
                  <Input
                    id="marca"
                    value={formData.marca}
                    onChange={(e) => handleInputChange('marca', e.target.value)}
                    placeholder="Ex: JBL"
                    className={errors.marca ? 'border-red-500' : ''}
                  />
                  {errors.marca && <p className="text-red-500 text-sm">{errors.marca}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="modelo">Modelo *</Label>
                  <Input
                    id="modelo"
                    value={formData.modelo}
                    onChange={(e) => handleInputChange('modelo', e.target.value)}
                    placeholder="Ex: EON615"
                    className={errors.modelo ? 'border-red-500' : ''}
                  />
                  {errors.modelo && <p className="text-red-500 text-sm">{errors.modelo}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição *</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => handleInputChange('descricao', e.target.value)}
                  placeholder="Descreva o equipamento, suas características e aplicações..."
                  rows={3}
                  className={errors.descricao ? 'border-red-500' : ''}
                />
                {errors.descricao && <p className="text-red-500 text-sm">{errors.descricao}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="numero_serie">Número de Série</Label>
                <Input
                  id="numero_serie"
                  value={formData.numero_serie}
                  onChange={(e) => handleInputChange('numero_serie', e.target.value)}
                  placeholder="Ex: JBL123456789"
                />
              </div>
            </CardContent>
          </Card>

          {/* Valores de Locação */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Valores de Locação</span>
              </CardTitle>
              <CardDescription>
                Defina os preços para diferentes modalidades
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valor_diaria">Valor Diário (R$) *</Label>
                  <Input
                    id="valor_diaria"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.valor_diaria}
                    onChange={(e) => handleInputChange('valor_diaria', e.target.value)}
                    placeholder="0,00"
                    className={errors.valor_diaria ? 'border-red-500' : ''}
                  />
                  {errors.valor_diaria && <p className="text-red-500 text-sm">{errors.valor_diaria}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valor_semanal">Valor Semanal (R$)</Label>
                  <Input
                    id="valor_semanal"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.valor_semanal}
                    onChange={(e) => handleInputChange('valor_semanal', e.target.value)}
                    placeholder="0,00"
                    className={errors.valor_semanal ? 'border-red-500' : ''}
                  />
                  {errors.valor_semanal && <p className="text-red-500 text-sm">{errors.valor_semanal}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valor_mensal">Valor Mensal (R$)</Label>
                  <Input
                    id="valor_mensal"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.valor_mensal}
                    onChange={(e) => handleInputChange('valor_mensal', e.target.value)}
                    placeholder="0,00"
                    className={errors.valor_mensal ? 'border-red-500' : ''}
                  />
                  {errors.valor_mensal && <p className="text-red-500 text-sm">{errors.valor_mensal}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quantidade e Estado */}
          <Card>
            <CardHeader>
              <CardTitle>Quantidade e Estado</CardTitle>
              <CardDescription>
                Controle de estoque e disponibilidade
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantidade_total">Quantidade Total *</Label>
                  <Input
                    id="quantidade_total"
                    type="number"
                    min="1"
                    value={formData.quantidade_total}
                    onChange={(e) => handleInputChange('quantidade_total', e.target.value)}
                    className={errors.quantidade_total ? 'border-red-500' : ''}
                  />
                  {errors.quantidade_total && <p className="text-red-500 text-sm">{errors.quantidade_total}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantidade_disponivel">Quantidade Disponível *</Label>
                  <Input
                    id="quantidade_disponivel"
                    type="number"
                    min="0"
                    value={formData.quantidade_disponivel}
                    onChange={(e) => handleInputChange('quantidade_disponivel', e.target.value)}
                    className={errors.quantidade_disponivel ? 'border-red-500' : ''}
                  />
                  {errors.quantidade_disponivel && <p className="text-red-500 text-sm">{errors.quantidade_disponivel}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select
                    value={formData.estado}
                    onValueChange={(value) => handleInputChange('estado', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="disponivel">Disponível</SelectItem>
                      <SelectItem value="manutencao">Em Manutenção</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Especificações Técnicas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Especificações Técnicas</span>
              </CardTitle>
              <CardDescription>
                Adicione características técnicas do equipamento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {especificacoes.map((spec, index) => (
                <div key={index} className="flex space-x-2">
                  <Input
                    placeholder="Característica (ex: Potência)"
                    value={spec.chave}
                    onChange={(e) => handleEspecificacaoChange(index, 'chave', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Valor (ex: 1000W RMS)"
                    value={spec.valor}
                    onChange={(e) => handleEspecificacaoChange(index, 'valor', e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeEspecificacao(index)}
                    disabled={especificacoes.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addEspecificacao}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Especificação
              </Button>
            </CardContent>
          </Card>

          {/* Imagens */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ImageIcon className="h-5 w-5" />
                <span>Imagens</span>
              </CardTitle>
              <CardDescription>
                URLs das imagens do equipamento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="imagem_principal">Imagem Principal</Label>
                <Input
                  id="imagem_principal"
                  type="url"
                  value={formData.imagem_principal}
                  onChange={(e) => handleInputChange('imagem_principal', e.target.value)}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Imagens Adicionais</Label>
                {imagensAdicionais.map((imagem, index) => (
                  <div key={index} className="flex space-x-2">
                    <Input
                      type="url"
                      placeholder="https://exemplo.com/imagem.jpg"
                      value={imagem}
                      onChange={(e) => handleImagemAdicionalChange(index, e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeImagemAdicional(index)}
                      disabled={imagensAdicionais.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addImagemAdicional}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Imagem
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Observações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Info className="h-5 w-5" />
                <span>Observações</span>
              </CardTitle>
              <CardDescription>
                Informações adicionais sobre o equipamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.observacoes}
                onChange={(e) => handleInputChange('observacoes', e.target.value)}
                placeholder="Observações gerais, cuidados especiais, acessórios inclusos..."
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" asChild>
              <Link to={`/equipamentos/${id}`}>Cancelar</Link>
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EditarEquipamento;

