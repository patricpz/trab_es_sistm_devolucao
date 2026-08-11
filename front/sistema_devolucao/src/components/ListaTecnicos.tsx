import React, { useState } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Switch, FormControlLabel
} from '@mui/material';
import { Engineering } from '@mui/icons-material';

export default function ListaTecnicos({ tecnicos, setTecnicos }) {
  const [modalAberto, setModalAberto] = useState(false);
  const [novo, setNovo] = useState({ nome: '', login: '', ativo: true });

  // Transformado em Async para comunicar com a API
  const handleCadastrar = async () => {
    if (!novo.nome || !novo.login) return;

    try {
      const resposta = await fetch(`${import.meta.env.VITE_API_URL}/tecnicos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novo),
      });

      if (resposta.ok) {
        const tecnicoSalvo = await resposta.json();
        setTecnicos([...tecnicos, tecnicoSalvo]);
        setNovo({ nome: '', login: '', ativo: true });
        setModalAberto(false);
      } else {
        console.error("Erro na API ao salvar técnico.");
      }
    } catch (erro) {
      console.error("Erro de comunicação com o servidor:", erro);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Controle de Técnicos</Typography>
        <Button variant="contained" color="success" startIcon={<Engineering />} onClick={() => setModalAberto(true)}>
          Novo Técnico
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Técnico Responsável</strong></TableCell>
              <TableCell><strong>Login de Acesso</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tecnicos.map((tec) => (
              <TableRow key={tec.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {tec.nome}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="textSecondary">
                    {tec.login}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={tec.ativo ? 'Ativo' : 'Inativo'} 
                    color={tec.ativo ? 'success' : 'default'} 
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
        <DialogTitle sx={{ fontWeight: 'bold' }}>Cadastrar Técnico</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            <TextField 
              label="Nome Completo" 
              fullWidth 
              value={novo.nome} 
              onChange={(e) => setNovo({ ...novo, nome: e.target.value })} 
            />
            <TextField 
              label="Login de Acesso (Usuário)" 
              fullWidth 
              value={novo.login} 
              onChange={(e) => setNovo({ ...novo, login: e.target.value })} 
            />
            <FormControlLabel 
              control={<Switch checked={novo.ativo} onChange={(e) => setNovo({ ...novo, ativo: e.target.checked })} color="success" />} 
              label="Técnico Ativo no Sistema" 
            />
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