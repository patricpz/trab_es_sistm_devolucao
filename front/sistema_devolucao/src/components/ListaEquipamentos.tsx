import React, { useState } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, TextField, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem
} from '@mui/material';
import { AddBox } from '@mui/icons-material';

export default function ListaEquipamentos({ equipamentos, setEquipamentos }) {
  const [modalAberto, setModalAberto] = useState(false);
  const [novo, setNovo] = useState({ nome: '', patrimonio: '', categoria: '', status: 'disponivel' });

  // Transformado em Async para comunicar com a API
  const handleCadastrar = async () => {
    if (!novo.nome || !novo.patrimonio) return;

    try {
      const resposta = await fetch(`${import.meta.env.VITE_API_URL}/equipamentos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novo),
      });

      if (resposta.ok) {
        const equipamentoSalvo = await resposta.json();
        // Atualiza usando o objeto que retornou do banco (com ID real)
        setEquipamentos([...equipamentos, equipamentoSalvo]);
        setNovo({ nome: '', patrimonio: '', categoria: '', status: 'disponivel' });
        setModalAberto(false);
      } else {
        console.error("Erro na API ao salvar equipamento.");
      }
    } catch (erro) {
      console.error("Erro de comunicação com o servidor:", erro);
    }
  };

  const formatarStatus = (status) => {
    const mapa = {
      'disponivel': { label: 'Disponível', color: 'success' },
      'emprestado': { label: 'Emprestado', color: 'warning' },
      'manutencao': { label: 'Em Manutenção', color: 'error' },
      'baixado': { label: 'Baixado', color: 'default' },
    };
    return mapa[status] || mapa['disponivel'];
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Controle de Equipamentos</Typography>
        <Button variant="contained" color="success" startIcon={<AddBox />} onClick={() => setModalAberto(true)}>
          Novo Equipamento
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Equipamento</strong></TableCell>
              <TableCell><strong>Categoria</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {equipamentos.map((item) => (
              <TableRow key={item.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {item.nome}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Pat: {item.patrimonio}
                  </Typography>
                </TableCell>
                <TableCell>{item.categoria}</TableCell>
                <TableCell>
                  <Chip 
                    label={formatarStatus(item.status).label} 
                    color={formatarStatus(item.status).color} 
                    size="small" 
                    sx={{ fontWeight: 'bold' }} 
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={modalAberto} onClose={() => setModalAberto(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Cadastrar Equipamento</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            <TextField label="Nome do Equipamento" fullWidth value={novo.nome} onChange={(e) => setNovo({ ...novo, nome: e.target.value })} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Patrimônio" fullWidth value={novo.patrimonio} onChange={(e) => setNovo({ ...novo, patrimonio: e.target.value })} />
              <TextField label="Categoria" fullWidth value={novo.categoria} onChange={(e) => setNovo({ ...novo, categoria: e.target.value })} />
            </Box>
            <TextField select label="Status Inicial" fullWidth value={novo.status} onChange={(e) => setNovo({ ...novo, status: e.target.value })}>
              <MenuItem value="disponivel">Disponível</MenuItem>
              <MenuItem value="manutencao">Em Manutenção</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setModalAberto(false)} color="inherit">Cancelar</Button>
          <Button variant="contained" color="success" onClick={handleCadastrar}>Salvar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}