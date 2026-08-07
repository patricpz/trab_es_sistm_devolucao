import React, { useState } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, TextField, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem
} from '@mui/material';

export default function ListaEquipamentos({ equipamentos, setEquipamentos }) {
  const [modalAberto, setModalAberto] = useState(false);
  const [novo, setNovo] = useState({ nome: '', patrimonio: '', categoria: '', status: 'disponivel' });

  const handleCadastrar = () => {
    if (!novo.nome || !novo.patrimonio) return;
    setEquipamentos([...equipamentos, { id: Date.now(), ...novo }]);
    setNovo({ nome: '', patrimonio: '', categoria: '', status: 'disponivel' });
    setModalAberto(false);
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Equipamentos</Typography>
        <Button variant="contained" onClick={() => setModalAberto(true)}>+ Novo Equipamento</Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: '#f0f0f0' }}>
            <TableRow>
              <TableCell><strong>Patrimônio</strong></TableCell>
              <TableCell><strong>Nome</strong></TableCell>
              <TableCell><strong>Categoria</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {equipamentos.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.patrimonio}</TableCell>
                <TableCell>{item.nome}</TableCell>
                <TableCell>{item.categoria}</TableCell>
                <TableCell>
                  <Chip label={formatarStatus(item.status).label} color={formatarStatus(item.status).color} size="small" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={modalAberto} onClose={() => setModalAberto(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Cadastrar Equipamento</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Nome do Equipamento" fullWidth value={novo.nome} onChange={(e) => setNovo({ ...novo, nome: e.target.value })} />
            <TextField label="Patrimônio" fullWidth value={novo.patrimonio} onChange={(e) => setNovo({ ...novo, patrimonio: e.target.value })} />
            <TextField label="Categoria" fullWidth value={novo.categoria} onChange={(e) => setNovo({ ...novo, categoria: e.target.value })} />
            <TextField select label="Status Inicial" fullWidth value={novo.status} onChange={(e) => setNovo({ ...novo, status: e.target.value })}>
              <MenuItem value="disponivel">Disponível</MenuItem>
              <MenuItem value="manutencao">Em Manutenção</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalAberto(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleCadastrar}>Salvar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}