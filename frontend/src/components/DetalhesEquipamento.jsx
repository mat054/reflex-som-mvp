import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { equipamentoService } from '../lib/api';
import Layout from './Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft,
  Package,
  Tag,
  DollarSign,
  Hash,
  FileText,
  Image as ImageIcon,
  Settings,
  Calendar,
  MapPin,
  Zap,
  AlertCircle
} from 'lucide-react';

const DetalhesEquipamento = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [equipamento, setEquipamento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imagemPrincipalError, setImagemPrincipalError] = useState(false);

  useEffect(() => {
    loadEquipamento();
  }, [id]);

  const loadEquipamento = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await equipamentoService.obterDetalhes(id);
      setEquipamento(response);
    } catch (error) {
      console.error('Erro ao carregar equipamento:', error);
      setError('Erro ao carregar detalhes do equipamento');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  const handleImageError = () => {
    setImagemPrincipalError(true);
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
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Equipamento não encontrado</h2>
          <p className="text-gray-600 mb-4">{error || 'O equipamento solicitado não existe.'}</p>
          <Button onClick={() => navigate('/equipamentos')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Equipamentos
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/equipamentos')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
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
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Principal - Informações */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações Básicas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>Informações Básicas</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Tag className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Categoria</p>
                      <p className="text-lg">{equipamento.categoria_nome}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Hash className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Quantidade Disponível</p>
                      <p className="text-lg font-semibold text-green-600">
                        {equipamento.quantidade_disponivel} de {equipamento.quantidade_total}
                      </p>
                    </div>
                  </div>

                  {equipamento.numero_serie && (
                    <div className="flex items-center space-x-3">
                      <Hash className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Número de Série</p>
                        <p className="text-lg font-mono">{equipamento.numero_serie}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Data de Cadastro</p>
                      <p className="text-lg">{formatDate(equipamento.data_cadastro)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Descrição */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Descrição</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
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
                    {Object.entries(equipamento.especificacoes_tecnicas).map(([chave, valor]) => (
                      <div key={chave} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-700">{chave}:</span>
                        <span className="text-gray-900">{valor}</span>
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
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Observações</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {equipamento.observacoes}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Coluna Lateral - Preços e Imagens */}
          <div className="space-y-6">
            {/* Preços */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Valores de Locação</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-600">Valor Diária</p>
                  <p className="text-3xl font-bold text-green-700">
                    {formatCurrency(equipamento.valor_diaria)}
                  </p>
                  <p className="text-sm text-green-600">por dia</p>
                </div>

                {equipamento.valor_semanal && (
                  <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-600">Valor Semanal</p>
                    <p className="text-xl font-bold text-blue-700">
                      {formatCurrency(equipamento.valor_semanal)}
                    </p>
                    <p className="text-sm text-blue-600">por semana</p>
                  </div>
                )}

                {equipamento.valor_mensal && (
                  <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-sm font-medium text-purple-600">Valor Mensal</p>
                    <p className="text-xl font-bold text-purple-700">
                      {formatCurrency(equipamento.valor_mensal)}
                    </p>
                    <p className="text-sm text-purple-600">por mês</p>
                  </div>
                )}

                <Separator />

                <Button className="w-full" size="lg" disabled={!equipamento.disponivel}>
                  {equipamento.disponivel ? (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Solicitar Locação
                    </>
                  ) : (
                    'Indisponível'
                  )}
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
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Imagem Principal */}
                {equipamento.imagem_principal && !imagemPrincipalError ? (
                  <div className="aspect-square overflow-hidden rounded-lg border">
                    <img
                      src={equipamento.imagem_principal}
                      alt={equipamento.nome}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                      onError={handleImageError}
                    />
                  </div>
                ) : (
                  <div className="aspect-square flex items-center justify-center bg-gray-100 rounded-lg border border-dashed border-gray-300">
                    <div className="text-center">
                      <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Sem imagem disponível</p>
                    </div>
                  </div>
                )}

                {/* Imagens Adicionais */}
                {equipamento.imagens_adicionais && equipamento.imagens_adicionais.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Imagens Adicionais:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {equipamento.imagens_adicionais.map((url, index) => (
                        <div key={index} className="aspect-square overflow-hidden rounded border">
                          <img
                            src={url}
                            alt={`${equipamento.nome} - ${index + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      ))}
                    </div>
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

export default DetalhesEquipamento; 