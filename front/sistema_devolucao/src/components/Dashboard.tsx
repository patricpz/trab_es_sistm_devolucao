import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Grid, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Button, LinearProgress, Divider
} from '@mui/material';
import {
  School, PrecisionManufacturing, Assignment, Warning,
  CheckCircle, Build, Block, TrendingUp
} from '@mui/icons-material';

interface DashboardProps {
  alunos: any[];
  equipamentos: any[];
  emprestimos: any[];
  onNavegar: (index: number) => void;
}

interface Atraso {
  id: number;
  aluno_nome: string;
  aluno_matricula: string;
  equipamento_nome: string;
  patrimonio: string;
  data_prevista_devolucao: string;
  dias_atraso: number;
}

function CardMetrica({ titulo, valor, icone, cor, subtitulo }: {
  titulo: string;
  valor: number;
  icone: React.ReactNode;
  cor: string;
  subtitulo?: string;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        border: '1px solid #e0e0e0',
        borderRadius: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            {titulo}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 0.5 }}>
            {valor}
          </Typography>
          {subtitulo && (
            <Typography variant="caption" color="text.secondary">
              {subtitulo}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            bgcolor: `${cor}18`,
            color: cor,
            p: 1.2,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icone}
        </Box>
      </Box>
    </Paper>
  );
}

export default function Dashboard({ alunos, equipamentos, emprestimos, onNavegar }: DashboardProps) {
  const [atrasos, setAtrasos] = useState<Atraso[]>([]);
  const [carregandoAtrasos, setCarregandoAtrasos] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/relatorios/atrasos`)
      .then(res => res.ok ? res.json() : [])
      .then(dados => setAtrasos(dados))
      .catch(() => setAtrasos([]))
      .finally(() => setCarregandoAtrasos(false));
  }, [emprestimos]);

  const alunosAtivos = alunos.filter(a => a.ativo).length;
  const emprestimosAtivos = emprestimos.filter(e => !e.data_devolucao);

  const statusEquipamentos = {
    disponivel: equipamentos.filter(e => e.status === 'disponivel').length,
    emprestado: equipamentos.filter(e => e.status === 'emprestado').length,
    manutencao: equipamentos.filter(e => e.status === 'manutencao').length,
    baixado: equipamentos.filter(e => e.status === 'baixado').length,
  };

  const totalEquipamentos = equipamentos.length;
  const pctDisponivel = totalEquipamentos > 0
    ? Math.round((statusEquipamentos.disponivel / totalEquipamentos) * 100)
    : 0;

  const emprestimosEmDia = emprestimosAtivos.filter(e => !e.atrasado).length;

  const statusItems = [
    { label: 'Disponível', valor: statusEquipamentos.disponivel, cor: '#2e7d32', icone: <CheckCircle fontSize="small" /> },
    { label: 'Emprestado', valor: statusEquipamentos.emprestado, cor: '#ed6c02', icone: <Assignment fontSize="small" /> },
    { label: 'Manutenção', valor: statusEquipamentos.manutencao, cor: '#d32f2f', icone: <Build fontSize="small" /> },
    { label: 'Baixado', valor: statusEquipamentos.baixado, cor: '#757575', icone: <Block fontSize="small" /> },
  ];

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Visão geral do controle de empréstimos do laboratório
        </Typography>
      </Box>

      {/* Cards de métricas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <CardMetrica
            titulo="Alunos Ativos"
            valor={alunosAtivos}
            icone={<School />}
            cor="#1976d2"
            subtitulo={`${alunos.length} cadastrados no total`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <CardMetrica
            titulo="Equipamentos"
            valor={totalEquipamentos}
            icone={<PrecisionManufacturing />}
            cor="#2e7d32"
            subtitulo={`${pctDisponivel}% disponíveis`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <CardMetrica
            titulo="Empréstimos Ativos"
            valor={emprestimosAtivos.length}
            icone={<Assignment />}
            cor="#ed6c02"
            subtitulo={`${emprestimosEmDia} em dia`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <CardMetrica
            titulo="Atrasos"
            valor={atrasos.length}
            icone={<Warning />}
            cor="#d32f2f"
            subtitulo={atrasos.length > 0 ? 'Requer atenção imediata' : 'Nenhuma pendência'}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Status dos equipamentos */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper elevation={0} sx={{ p: 2.5, border: '1px solid #e0e0e0', borderRadius: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <TrendingUp color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Status dos Equipamentos
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" color="text.secondary">Taxa de disponibilidade</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{pctDisponivel}%</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={pctDisponivel}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: '#e8f5e9',
                  '& .MuiLinearProgress-bar': { bgcolor: '#2e7d32', borderRadius: 4 },
                }}
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {statusItems.map(item => (
                <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ color: item.cor }}>{item.icone}</Box>
                    <Typography variant="body2">{item.label}</Typography>
                  </Box>
                  <Chip
                    label={item.valor}
                    size="small"
                    sx={{ bgcolor: `${item.cor}18`, color: item.cor, fontWeight: 'bold', minWidth: 40 }}
                  />
                </Box>
              ))}
            </Box>

            <Button
              variant="outlined"
              size="small"
              fullWidth
              sx={{ mt: 2.5 }}
              onClick={() => onNavegar(2)}
            >
              Gerenciar Equipamentos
            </Button>
          </Paper>
        </Grid>

        {/* Relatório de atrasos */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: atrasos.length > 0 ? '#fff5f5' : '#f9fbe7' }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Relatório de Atrasos
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Empréstimos vencidos, ordenados por dias de atraso
                </Typography>
              </Box>
              {atrasos.length > 0 && (
                <Chip label={`${atrasos.length} pendente${atrasos.length > 1 ? 's' : ''}`} color="error" size="small" />
              )}
            </Box>

            {carregandoAtrasos ? (
              <LinearProgress />
            ) : atrasos.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <CheckCircle sx={{ fontSize: 48, color: '#2e7d32', mb: 1 }} />
                <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                  Nenhum atraso registrado
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Todos os empréstimos estão dentro do prazo
                </Typography>
              </Box>
            ) : (
              <TableContainer sx={{ maxHeight: 320 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Aluno</strong></TableCell>
                      <TableCell><strong>Equipamento</strong></TableCell>
                      <TableCell><strong>Prev. Devolução</strong></TableCell>
                      <TableCell align="center"><strong>Atraso</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {atrasos.map(item => (
                      <TableRow key={item.id} sx={{ bgcolor: '#fff5f5' }}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }} color="error">
                            {item.aluno_nome}
                          </Typography>
                          <Typography variant="caption" color="error">
                            {item.aluno_matricula}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{item.equipamento_nome}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Pat: {item.patrimonio}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {new Date(item.data_prevista_devolucao).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={`${item.dias_atraso} dia${item.dias_atraso > 1 ? 's' : ''}`}
                            color="error"
                            size="small"
                            sx={{ fontWeight: 'bold' }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0', display: 'flex', gap: 1 }}>
              <Button variant="contained" color="success" size="small" onClick={() => onNavegar(1)}>
                Ir para Empréstimos
              </Button>
              {atrasos.length > 0 && (
                <Typography variant="caption" color="error" sx={{ alignSelf: 'center', ml: 1 }}>
                  Alunos com pendência não podem retirar novos equipamentos
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
