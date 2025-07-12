import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { reservaService, utils } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import Layout from './Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Package,
  MapPin,
  User,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

const ReservaDetalhes = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [reserva, setReserva] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadReserva();
  }, [id]);

  const loadReserva = async () => {
    try {
      setLoading(true);
      const response = await reservaService.obter(id);
      setReserva(response);
    } catch (error) {
      console.error('Erro ao carregar reserva:', error);
      setError('Erro ao carregar reserva');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pendente: { 
        label: 'Pendente', 
        variant: 'secondary', 
        className: 'bg-yellow-100 text-yellow-800',
        icon: Clock
      },
      aprovada: { 
        label: 'Aprovada', 
        variant: 'default', 
        className: 'bg-green-100 text-green-800',
        icon: CheckCircle
      },
      rejeitada: { 
        label: 'Rejeitada', 
        variant: 'destructive', 
        className: 'bg-red-100 text-red-800',
        icon: XCircle
      },
      ativa: { 
        label: 'Ativa', 
        variant: 'default', 
        className: 'bg-blue-100 text-blue-800',
        icon: CheckCircle
      },
      concluida: { 
        label: 'Concluída', 
        variant: 'outline', 
        className: 'bg-gray-100 text-gray-800',
        icon: CheckCircle
      },
      cancelada: { 
        label: 'Cancelada', 
        variant: 'destructive', 
        className: 'bg-red-100 text-red-800',
        icon: XCircle
      },
    };
    
    const statusInfo = statusMap[status] || { 
      label: status, 
      variant: 'outline',
      icon: AlertCircle
    };
    
    const IconComponent = statusInfo.icon;
    
    return (
      <Badge variant={statusInfo.variant} className={statusInfo.className}>
        <IconComponent className="h-3 w-3 mr-1" />
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

  if (error || !reserva) {
    return (
      <Layout>
        <div className="text-center py-12">
          <AlertCircle className="h-24 w-24 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Reserva não encontrada
          </h3>
          <p className="text-gray-600 mb-4">
            A reserva solicitada não foi encontrada ou não existe.
          </p>
          <Button asChild>
            <Link to="/reservas">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar às Reservas
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
              <Link to="/reservas">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reserva #{reserva.id}</h1>
              <p className="text-gray-600 mt-1">
                Criada em {utils.formatDateTime(reserva.data_criacao)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {getStatusBadge(reserva.status)}
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
            {/* Detalhes da Reserva */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Detalhes da Reserva</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data do Evento:</Label>
                    <p className="font-medium">{utils.formatDate(reserva.data_uso)}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Local do Evento:</Label>
                    <p className="font-medium">{reserva.local_evento}</p>
                  </div>
                </div>
                {reserva.observacoes && (
                  <div className="space-y-2">
                    <Label>Observações:</Label>
                    <p className="text-gray-700">{reserva.observacoes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Itens da Reserva */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>Itens Reservados</span>
                </CardTitle>
                <CardDescription>
                  {reserva.itens?.length || 0} item(s) reservado(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reserva.itens?.length > 0 ? (
                  <div className="space-y-4">
                    {reserva.itens.map((item) => (
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
                    <p className="text-gray-600">Nenhum item adicionado a esta reserva</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Resumo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Resumo da Reserva</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status:</span>
                  {getStatusBadge(reserva.status)}
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total de Itens:</span>
                  <span className="font-medium">{reserva.itens?.length || 0}</span>
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Valor Total:</span>
                  <span className="text-2xl font-bold text-green-600">
                    {utils.formatCurrency(reserva.valor_total || 0)}
                  </span>
                </div>

                <Separator />

                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Última atualização:</p>
                  <p className="text-sm">{utils.formatDateTime(reserva.data_atualizacao)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Informações do Cliente */}
            {user?.is_staff && reserva.cliente && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Informações do Cliente</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <p>{reserva.cliente.nome_completo}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <p>{reserva.cliente.email}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <p>{reserva.cliente.telefone}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ReservaDetalhes;

