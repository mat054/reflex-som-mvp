import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { orcamentoService, equipamentoService, utils } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import Layout from './Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft,
  Plus,
  Trash2,
  Package,
  ShoppingCart,
  Calendar,
  DollarSign,
  Save,
  Check
} from 'lucide-react';

const CriarOrcamento = () => {
  const navigate = useNavigate();
  const { equipamentoId } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  const [orcamento, setOrcamento] = useState(null);
  const [equipamentos, setEquipamentos] = useState([]);
  const [equipamentoSelecionado, setEquipamentoSelecionado] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingEquipamentos, setLoadingEquipamentos] = useState(true);
  const [errors, setErrors] = useState({});

  const [itemForm, setItemForm] = useState({
    quantidade: '1',
    modalidade: 'diaria',
    periodo: '1',
    data_uso: ''
  });

  useEffect(() => {
    loadEquipamentos();
    
    // Se veio de um equipamento específico, criar orçamento automaticamente
    if (equipamentoId) {
      criarOrcamentoComEquipamento();
    } else {
      // Verificar se há um orçamento em rascunho
      verificarOrcamentoRascunho();
    }
  }, [equipamentoId]);

  const loadEquipamentos = async () => {
    try {
      setLoadingEquipamentos(true);
      const response = await equipamentoService.listar({ disponivel: 'true' });
      setEquipamentos(Array.isArray(response) ? response : response.results || []);
    } catch (error) {
      console.error('Erro ao carregar equipamentos:', error);
    } finally {
      setLoadingEquipamentos(false);
    }
  };

  const verificarOrcamentoRascunho = async () => {
    try {
      const response = await orcamentoService.listar();
      const orcamentos = Array.isArray(response) ? response : response.results || [];
      const rascunho = orcamentos.find(o => o.status === 'rascunho');
      
      if (rascunho) {
        const orcamentoDetalhado = await orcamentoService.obter(rascunho.id);
        setOrcamento(orcamentoDetalhado);
      }
    } catch (error) {
      console.error('Erro ao verificar orçamento em rascunho:', error);
    }
  };

  const criarOrcamentoComEquipamento = async () => {
    try {
      setLoading(true);
      
      // Criar orçamento vazio
      const novoOrcamento = await orcamentoService.criar({});
      
      // Buscar dados do equipamento
      const equipamento = await equipamentoService.obter(equipamentoId);
      
      // Adicionar equipamento ao orçamento
      await orcamentoService.adicionarItem(novoOrcamento.id, {
        equipamento: equipamento.id,
        quantidade: 1,
        modalidade: 'diaria',
        periodo: 1,
        data_uso: new Date().toISOString().split('T')[0]
      });
      
      // Recarregar orçamento com itens
      const orcamentoAtualizado = await orcamentoService.obter(novoOrcamento.id);
      setOrcamento(orcamentoAtualizado);
      
    } catch (error) {
      console.error('Erro ao criar orçamento com equipamento:', error);
      setErrors({ general: 'Erro ao adicionar equipamento ao orçamento' });
    } finally {
      setLoading(false);
    }
  };

  const criarNovoOrcamento = async () => {
    try {
      setLoading(true);
      const novoOrcamento = await orcamentoService.criar({});
      setOrcamento(novoOrcamento);
    } catch (error) {
      console.error('Erro ao criar orçamento:', error);
      setErrors({ general: 'Erro ao criar orçamento' });
    } finally {
      setLoading(false);
    }
  };

  const adicionarItem = async () => {
    if (!orcamento) {
      await criarNovoOrcamento();
      return;
    }

    if (!equipamentoSelecionado) {
      setErrors({ equipamento: 'Selecione um equipamento' });
      return;
    }

    if (!itemForm.data_uso) {
      setErrors({ data_uso: 'Selecione a data de uso' });
      return;
    }

    try {
      setLoading(true);
      
      await orcamentoService.adicionarItem(orcamento.id, {
        equipamento: parseInt(equipamentoSelecionado),
        quantidade: parseInt(itemForm.quantidade),
        modalidade: itemForm.modalidade,
        periodo: parseInt(itemForm.periodo),
        data_uso: itemForm.data_uso
      });

      // Recarregar orçamento
      const orcamentoAtualizado = await orcamentoService.obter(orcamento.id);
      setOrcamento(orcamentoAtualizado);

      // Limpar formulário
      setEquipamentoSelecionado('');
      setItemForm({
        quantidade: '1',
        modalidade: 'diaria',
        periodo: '1',
        data_uso: ''
      });
      setErrors({});

    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      if (error.response?.data?.error) {
        setErrors({ general: error.response.data.error });
      } else {
        setErrors({ general: 'Erro ao adicionar item ao orçamento' });
      }
    } finally {
      setLoading(false);
    }
  };

  const removerItem = async (itemId) => {
    if (!window.confirm('Tem certeza de que deseja remover este item?')) {
      return;
    }

    try {
      setLoading(true);
      await orcamentoService.removerItem(orcamento.id, itemId);
      
      // Recarregar orçamento
      const orcamentoAtualizado = await orcamentoService.obter(orcamento.id);
      setOrcamento(orcamentoAtualizado);
    } catch (error) {
      console.error('Erro ao remover item:', error);
      setErrors({ general: 'Erro ao remover item do orçamento' });
    } finally {
      setLoading(false);
    }
  };

  const finalizarOrcamento = async () => {
    if (!orcamento?.itens?.length) {
      setErrors({ general: 'Adicione pelo menos um item ao orçamento' });
      return;
    }

    try {
      setLoading(true);
      await orcamentoService.finalizar(orcamento.id);
      
      navigate('/orcamentos', {
        state: { message: 'Orçamento finalizado com sucesso!' }
      });
    } catch (error) {
      console.error('Erro ao finalizar orçamento:', error);
      setErrors({ general: error.response?.data?.error || 'Erro ao finalizar orçamento' });
    } finally {
      setLoading(false);
    }
  };

  const getModalidadeLabel = (modalidade) => {
    const labels = {
      diaria: 'Diária',
      semanal: 'Semanal',
      mensal: 'Mensal'
    };
    return labels[modalidade] || modalidade;
  };

  const getEquipamentoNome = (equipamentoId) => {
    const equipamento = equipamentos.find(e => e.id === equipamentoId);
    return equipamento ? equipamento.nome : `Equipamento #${equipamentoId}`;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/orcamentos">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {orcamento ? `Orçamento #${orcamento.id}` : 'Novo Orçamento'}
            </h1>
            <p className="text-gray-600 mt-1">
              {orcamento ? 'Adicione equipamentos ao seu orçamento' : 'Crie um novo orçamento para seus equipamentos'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulário de Adição */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span>Adicionar Equipamento</span>
                </CardTitle>
                <CardDescription>
                  Selecione um equipamento e configure os detalhes da locação
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {errors.general && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-red-600 text-sm">{errors.general}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Equipamento</Label>
                  <Select
                    value={equipamentoSelecionado}
                    onValueChange={setEquipamentoSelecionado}
                    disabled={loadingEquipamentos}
                  >
                    <SelectTrigger className={errors.equipamento ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecione um equipamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {equipamentos.map((equipamento) => (
                        <SelectItem key={equipamento.id} value={equipamento.id.toString()}>
                          <div className="flex items-center justify-between w-full">
                            <span>{equipamento.nome}</span>
                            <span className="text-sm text-gray-500 ml-2">
                              {utils.formatCurrency(equipamento.valor_diaria)}/dia
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.equipamento && <p className="text-red-500 text-sm">{errors.equipamento}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantidade">Quantidade</Label>
                    <Input
                      id="quantidade"
                      type="number"
                      min="1"
                      value={itemForm.quantidade}
                      onChange={(e) => setItemForm(prev => ({ ...prev, quantidade: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Modalidade</Label>
                    <Select
                      value={itemForm.modalidade}
                      onValueChange={(value) => setItemForm(prev => ({ ...prev, modalidade: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="diaria">Diária</SelectItem>
                        <SelectItem value="semanal">Semanal</SelectItem>
                        <SelectItem value="mensal">Mensal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="periodo">Período</Label>
                    <Input
                      id="periodo"
                      type="number"
                      min="1"
                      value={itemForm.periodo}
                      onChange={(e) => setItemForm(prev => ({ ...prev, periodo: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="data_uso">Data de Uso</Label>
                    <Input
                      id="data_uso"
                      type="date"
                      value={itemForm.data_uso}
                      onChange={(e) => setItemForm(prev => ({ ...prev, data_uso: e.target.value }))}
                      className={errors.data_uso ? 'border-red-500' : ''}
                    />
                    {errors.data_uso && <p className="text-red-500 text-sm">{errors.data_uso}</p>}
                  </div>
                </div>

                <Button onClick={adicionarItem} disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Adicionando...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar ao Orçamento
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Lista de Itens */}
            {orcamento?.itens?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Package className="h-5 w-5" />
                    <span>Itens do Orçamento</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orcamento.itens.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{getEquipamentoNome(item.equipamento)}</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                            <span>Qtd: {item.quantidade}</span>
                            <span>{getModalidadeLabel(item.modalidade)}</span>
                            <span>Período: {item.periodo}</span>
                            <span>Data: {utils.formatDate(item.data_uso)}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-right">
                            <p className="font-semibold text-green-600">
                              {utils.formatCurrency(item.valor_total)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {utils.formatCurrency(item.valor_unitario)} cada
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removerItem(item.id)}
                            disabled={loading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Resumo */}
          <div className="space-y-6">
            {orcamento && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5" />
                    <span>Resumo do Orçamento</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Status:</span>
                    <Badge variant="secondary">
                      {orcamento.status === 'rascunho' ? 'Rascunho' : orcamento.status}
                    </Badge>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total de Itens:</span>
                    <span className="font-medium">{orcamento.itens?.length || 0}</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Valor Total:</span>
                    <span className="text-2xl font-bold text-green-600">
                      {utils.formatCurrency(orcamento.valor_total || 0)}
                    </span>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Criado em:</p>
                    <p className="text-sm">{utils.formatDateTime(orcamento.data_criacao)}</p>
                  </div>

                  {orcamento.itens?.length > 0 && orcamento.status === 'rascunho' && (
                    <Button onClick={finalizarOrcamento} disabled={loading} className="w-full">
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Finalizando...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Finalizar Orçamento
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {!orcamento && (
              <Card>
                <CardHeader>
                  <CardTitle>Começar Orçamento</CardTitle>
                  <CardDescription>
                    Adicione equipamentos para criar seu orçamento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={criarNovoOrcamento} disabled={loading} className="w-full">
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Criando...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Criar Orçamento
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CriarOrcamento;

