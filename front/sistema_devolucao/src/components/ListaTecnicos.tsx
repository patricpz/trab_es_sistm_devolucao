import React, { useState } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Switch, FormControlLabel
} from '@mui/material';

export default function ListaTecnicos({ tecnicos, setTecnicos }) {
  const [modalAberto, setModalAberto] = useState(false);
  const [novo, setNovo] = useState({ nome: '', login: '', ativo: true });

  const handleCadastrar = () => {
    if (!novo.nome || !novo.login) return;
    setTecnicos([...tecnicos, { id: Date.now(), ...novo }]);
    setNovo({ nome: '', login: '', ativo: true });
    setModalAberto(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Técnicos do Laboratório</Typography>
        <Button variant="contained" onClick={() => setModalAberto(true)}>+ Novo Técnico</Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: '#f0f0f0' }}>
            <TableRow>
              <TableCell><strong>Nome</strong></TableCell>
              <TableCell><strong>Login</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tecnicos.map((tec) => (
              <TableRow key={tec.id}>
                <TableCell>{tec.nome}</TableCell>
                <TableCell>{tec.login}</TableCell>
                <TableCell>
                  <Chip label={tec.ativo ? 'Ativo' : 'Inativo'} color={tec.ativo ? 'primary' : 'default'} size="small" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={modalAberto} onClose={() => setModalAberto(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Cadastrar Técnico</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Nome" fullWidth value={novo.nome} onChange={(e) => setNovo({ ...novo, nome: e.target.value })} />
            <TextField label="Login de Acesso" fullWidth value={novo.login} onChange={(e) => setNovo({ ...novo, login: e.target.value })} />
            <FormControlLabel control={<Switch checked={novo.ativo} onChange={(e) => setNovo({ ...novo, ativo: e.target.checked })} />} label="Técnico Ativo" />
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