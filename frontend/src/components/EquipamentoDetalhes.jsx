import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { equipamentoService } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import Layout from './Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Package, 
  ArrowLeft,
  ShoppingCart,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  Info,
  Settings,
  Image as ImageIcon
} from 'lucide-react';

const EquipamentoDetalhes = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [equipamento, setEquipamento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isStaff = user?.is_staff || false;

  useEffect(() => {
    loadEquipamento();
  }, [id]);

  const loadEquipamento = async () => {
    try {
      setLoading(true);
      const response = await equipamentoService.obter(id);
      setEquipamento(response);
    } catch (error) {
      console.error('Erro ao carregar equipamento:', error);
      setError('Erro ao carregar equipamento');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Tem certeza de que deseja remover este equipamento? Esta ação não poderá ser desfeita.')) {
      return;
    }

    try {
      await equipamentoService.remover(id);
      navigate('/equipamentos', { 
        state: { message: 'Equipamento removido com sucesso!' }
      });
    } catch (error) {
      console.error('Erro ao remover equipamento:', error);
      alert(error.response?.data?.error || 'Erro ao remover equipamento');
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStatusBadge = (estado, disponivel) => {
    if (disponivel) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Disponível</Badge>;
    }
    
    const statusMap = {
      locado: { label: 'Locado', variant: 'secondary' },
      manutencao: { label: 'Manutenção', variant: 'destructive' },
      inativo: { label: 'Inativo', variant: 'outline' },
    };
    
    const status = statusMap[estado] || { label: estado, variant: 'outline' };
    return <Badge variant={status.variant}>{status.label}</Badge>;
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

  if (error || !equipamento) {
    return (
      <Layout>
        <div className="text-center py-12">
          <Package className="h-24 w-24 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Equipamento não encontrado
          </h3>
          <p className="text-gray-600 mb-4">
            O equipamento solicitado não foi encontrado ou não existe.
          </p>
          <Button asChild>
            <Link to="/equipamentos">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar aos Equipamentos
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
              <Link to="/equipamentos">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{equipamento.nome}</h1>
              <p className="text-gray-600 mt-1">
                {equipamento.marca} {equipamento.modelo}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {getStatusBadge(equipamento.estado, equipamento.disponivel)}
            {isStaff && (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/equipamentos/${equipamento.id}/editar`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Link>
                </Button>
                <Button variant="destructive" size="sm" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remover
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Imagens */}
            {equipamento.imagem_principal && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ImageIcon className="h-5 w-5" />
                    <span>Imagens</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <img
                      src={equipamento.imagem_principal}
                      alt={equipamento.nome}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    
                    {equipamento.imagens_adicionais && equipamento.imagens_adicionais.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {equipamento.imagens_adicionais.map((imagem, index) => (
                          <img
                            key={index}
                            src={imagem}
                            alt={`${equipamento.nome} - ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Descrição */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Info className="h-5 w-5" />
                  <span>Descrição</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {equipamento.descricao}
                </p>
              </CardContent>
            </Card>

            {/* Especificações Técnicas */}
            {equipamento.especificacoes_tecnicas && Object.keys(equipamento.especificacoes_tecnicas).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>Especificações Técnicas</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(equipamento.especificacoes_tecnicas).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                        <span className="font-medium text-gray-600">{key}:</span>
                        <span className="text-gray-900">{value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Observações */}
            {equipamento.observacoes && (
              <Card>
                <CardHeader>
                  <CardTitle>Observações</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    {equipamento.observacoes}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Informações Básicas */}
            <Card>
              <CardHeader>
                <CardTitle>Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Categoria</p>
                  <p className="text-gray-900">{equipamento.categoria_nome}</p>
                </div>
                
                <Separator />
                
                <div>
                  <p className="text-sm font-medium text-gray-600">Marca</p>
                  <p className="text-gray-900">{equipamento.marca}</p>
                </div>
                
                <Separator />
                
                <div>
                  <p className="text-sm font-medium text-gray-600">Modelo</p>
                  <p className="text-gray-900">{equipamento.modelo}</p>
                </div>
                
                {equipamento.numero_serie && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Número de Série</p>
                      <p className="text-gray-900 font-mono text-sm">{equipamento.numero_serie}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Disponibilidade */}
            <Card>
              <CardHeader>
                <CardTitle>Disponibilidade</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Quantidade Total</p>
                  <p className="text-2xl font-bold text-gray-900">{equipamento.quantidade_total}</p>
                </div>
                
                <Separator />
                
                <div>
                  <p className="text-sm font-medium text-gray-600">Quantidade Disponível</p>
                  <p className="text-2xl font-bold text-green-600">{equipamento.quantidade_disponivel}</p>
                </div>
                
                <Separator />
                
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <div className="mt-1">
                    {getStatusBadge(equipamento.estado, equipamento.disponivel)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preços */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Valores de Locação</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Valor Diário</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(equipamento.valor_diaria)}
                  </p>
                </div>
                
                {equipamento.valor_semanal && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Valor Semanal</p>
                      <p className="text-xl font-semibold text-green-600">
                        {formatCurrency(equipamento.valor_semanal)}
                      </p>
                    </div>
                  </>
                )}
                
                {equipamento.valor_mensal && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Valor Mensal</p>
                      <p className="text-xl font-semibold text-green-600">
                        {formatCurrency(equipamento.valor_mensal)}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Ações */}
            {equipamento.disponivel && (
              <Card>
                <CardHeader>
                  <CardTitle>Ações</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" size="lg" asChild>
                    <Link to={`/orcamento/adicionar/${equipamento.id}`}>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Adicionar ao Orçamento
                    </Link>
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

export default EquipamentoDetalhes;

