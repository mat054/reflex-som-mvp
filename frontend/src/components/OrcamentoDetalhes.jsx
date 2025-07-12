import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { orcamentoService, utils } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import Layout from './Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft,
  FileText,
  Package,
  Calendar,
  DollarSign,
  MapPin,
  ShoppingCart,
  Edit,
  Check,
  AlertCircle
} from 'lucide-react';

const OrcamentoDetalhes = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  const [orcamento, setOrcamento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [error, setError] = useState(null);
  const [showReservaForm, setShowReservaForm] = useState(false);
  
  const [reservaForm, setReservaForm] = useState({
    data_uso: '',
    local_evento: '',
    observacoes: ''
  });

  useEffect(() => {
    loadOrcamento();
    
    // Verificar se deve mostrar formulário de reserva
    if (searchParams.get('action') === 'reservar') {
      setShowReservaForm(true);
    }
  }, [id, searchParams]);

  const loadOrcamento = async () => {
    try {
      setLoading(true);
      const response = await orcamentoService.obter(id);
      setOrcamento(response);
    } catch (error) {
      console.error('Erro ao carregar orçamento:', error);
      setError('Erro ao carregar orçamento');
    } finally {
      setLoading(false);
    }
  };

  const finalizarOrcamento = async () => {
    try {
      setLoadingAction(true);
      await orcamentoService.finalizar(id);
      await loadOrcamento(); // Recarregar para atualizar status
    } catch (error) {
      console.error('Erro ao finalizar orçamento:', error);
      setError(error.response?.data?.error || 'Erro ao finalizar orçamento');
    } finally {
      setLoadingAction(false);
    }
  };

  const criarReserva = async () => {
    if (!reservaForm.data_uso) {
      setError('Data de uso é obrigatória');
      return;
    }

    if (!reservaForm.local_evento.trim()) {
      setError('Local do evento é obrigatório');
      return;
    }

    try {
      setLoadingAction(true);
      await orcamentoService.criarReserva(id, reservaForm);
      
      navigate('/reservas', {
        state: { message: 'Reserva criada com sucesso!' }
      });
    } catch (error) {
      console.error('Erro ao criar reserva:', error);
      setError(error.response?.data?.error || 'Erro ao criar reserva');
    } finally {
      setLoadingAction(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      rascunho: { label: 'Rascunho', variant: 'secondary', className: 'bg-gray-100 text-gray-800' },
      finalizado: { label: 'Finalizado', variant: 'default', className: 'bg-blue-100 text-blue-800' },
      convertido: { label: 'Convertido', variant: 'default', className: 'bg-green-100 text-green-800' },
    };
    
    const statusInfo = statusMap[status] || { label: status, variant: 'outline' };
    return (
      <Badge variant={statusInfo.variant} className={statusInfo.className}>
        {statusInfo.label}
      </Badge>
    );
  };

  const getModalidadeLabel = (modalidade) => {
    const labels = {
      diaria: 'Diária',
      semanal: 'Semanal',
      mensal: 'Mensal'
    };
    return labels[modalidade] || modalidade;
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

  if (error || !orcamento) {
    return (
      <Layout>
        <div className="text-center py-12">
          <FileText className="h-24 w-24 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Orçamento não encontrado
          </h3>
          <p className="text-gray-600 mb-4">
            O orçamento solicitado não foi encontrado ou não existe.
          </p>
          <Button asChild>
            <Link to="/orcamentos">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar aos Orçamentos
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link to="/orcamentos">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Orçamento #{orcamento.id}</h1>
              <p className="text-gray-600 mt-1">
                Criado em {utils.formatDateTime(orcamento.data_criacao)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {getStatusBadge(orcamento.status)}
            {orcamento.status === 'rascunho' && (
              <Button variant="outline" size="sm" asChild>
                <Link to={`/orcamentos/criar?orcamento=${orcamento.id}`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Mensagens de erro */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Itens do Orçamento */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>Itens do Orçamento</span>
                </CardTitle>
                <CardDescription>
                  {orcamento.itens?.length || 0} item(s) selecionado(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {orcamento.itens?.length > 0 ? (
                  <div className="space-y-4">
                    {orcamento.itens.map((item) => (
                      <div key={item.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-lg">{item.equipamento_nome}</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Quantidade:</span>
                                <p>{item.quantidade}</p>
                              </div>
                              <div>
                                <span className="font-medium">Modalidade:</span>
                                <p>{getModalidadeLabel(item.modalidade)}</p>
                              </div>
                              <div>
                                <span className="font-medium">Período:</span>
                                <p>{item.periodo}</p>
                              </div>
                              <div>
                                <span className="font-medium">Data de Uso:</span>
                                <p>{utils.formatDate(item.data_uso)}</p>
                              </div>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-lg font-semibold text-green-600">
                              {utils.formatCurrency(item.valor_total)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {utils.formatCurrency(item.valor_unitario)} cada
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-600">Nenhum item adicionado ao orçamento</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Formulário de Reserva */}
            {showReservaForm && orcamento.status === 'finalizado' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ShoppingCart className="h-5 w-5" />
                    <span>Solicitar Reserva</span>
                  </CardTitle>
                  <CardDescription>
                    Preencha os dados para converter este orçamento em uma reserva
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="data_uso">Data do Evento *</Label>
                      <Input
                        id="data_uso"
                        type="date"
                        value={reservaForm.data_uso}
                        onChange={(e) => setReservaForm(prev => ({ ...prev, data_uso: e.target.value }))}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="local_evento">Local do Evento *</Label>
                      <Input
                        id="local_evento"
                        value={reservaForm.local_evento}
                        onChange={(e) => setReservaForm(prev => ({ ...prev, local_evento: e.target.value }))}
                        placeholder="Ex: Salão de Festas ABC"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea
                      id="observacoes"
                      value={reservaForm.observacoes}
                      onChange={(e) => setReservaForm(prev => ({ ...prev, observacoes: e.target.value }))}
                      placeholder="Informações adicionais sobre o evento..."
                      rows={3}
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button onClick={criarReserva} disabled={loadingAction}>
                      {loadingAction ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Criando Reserva...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Solicitar Reserva
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={() => setShowReservaForm(false)}>
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Resumo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Resumo</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status:</span>
                  {getStatusBadge(orcamento.status)}
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
                  <p className="text-sm text-gray-600">Última atualização:</p>
                  <p className="text-sm">{utils.formatDateTime(orcamento.data_atualizacao)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Ações */}
            <Card>
              <CardHeader>
                <CardTitle>Ações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {orcamento.status === 'rascunho' && orcamento.itens?.length > 0 && (
                  <Button onClick={finalizarOrcamento} disabled={loadingAction} className="w-full">
                    {loadingAction ? (
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

                {orcamento.status === 'finalizado' && !showReservaForm && (
                  <Button onClick={() => setShowReservaForm(true)} className="w-full">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Solicitar Reserva
                  </Button>
                )}

                {orcamento.status === 'rascunho' && (
                  <Button variant="outline" asChild className="w-full">
                    <Link to={`/orcamentos/criar?orcamento=${orcamento.id}`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Continuar Editando
                    </Link>
                  </Button>
                )}

                {orcamento.status === 'convertido' && (
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-green-800">
                      Este orçamento foi convertido em reserva
                    </p>
                    <Button variant="outline" size="sm" asChild className="mt-2">
                      <Link to="/reservas">
                        Ver Reservas
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrcamentoDetalhes;

