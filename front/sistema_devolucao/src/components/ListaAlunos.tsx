import React, { useState } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Switch, FormControlLabel
} from '@mui/material';

export default function ListaAlunos({ alunos, setAlunos }) {
  const [modalAberto, setModalAberto] = useState(false);
  const [novo, setNovo] = useState({ nome: '', matricula: '', email: '', telefone: '', ativo: true });

  const handleCadastrar = () => {
    if (!novo.nome || !novo.matricula) return;
    setAlunos([...alunos, { id: Date.now(), ...novo }]);
    setNovo({ nome: '', matricula: '', email: '', telefone: '', ativo: true });
    setModalAberto(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Alunos</Typography>
        <Button variant="contained" onClick={() => setModalAberto(true)}>+ Novo Aluno</Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: '#f0f0f0' }}>
            <TableRow>
              <TableCell><strong>Matrícula</strong></TableCell>
              <TableCell><strong>Nome</strong></TableCell>
              <TableCell><strong>E-mail</strong></TableCell>
              <TableCell><strong>Telefone</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {alunos.map((aluno) => (
              <TableRow key={aluno.id}>
                <TableCell>{aluno.matricula}</TableCell>
                <TableCell>{aluno.nome}</TableCell>
                <TableCell>{aluno.email}</TableCell>
                <TableCell>{aluno.telefone}</TableCell>
                <TableCell>
                  <Chip label={aluno.ativo ? 'Ativo' : 'Inativo'} color={aluno.ativo ? 'success' : 'default'} size="small" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={modalAberto} onClose={() => setModalAberto(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Cadastrar Aluno</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="Nome" fullWidth value={novo.nome} onChange={(e) => setNovo({ ...novo, nome: e.target.value })} />
            <TextField label="Matrícula" fullWidth value={novo.matricula} onChange={(e) => setNovo({ ...novo, matricula: e.target.value })} />
            <TextField label="E-mail" fullWidth value={novo.email} onChange={(e) => setNovo({ ...novo, email: e.target.value })} />
            <TextField label="Telefone" fullWidth value={novo.telefone} onChange={(e) => setNovo({ ...novo, telefone: e.target.value })} />
            <FormControlLabel control={<Switch checked={novo.ativo} onChange={(e) => setNovo({ ...novo, ativo: e.target.checked })} />} label="Aluno Ativo" />
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