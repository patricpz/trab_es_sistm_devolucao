import React, { useState } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Switch, FormControlLabel
} from '@mui/material';
import { PersonAdd } from '@mui/icons-material';

export default function ListaAlunos({ alunos, setAlunos }) { 
  const [modalAberto, setModalAberto] = useState(false);
  const [novo, setNovo] = useState({ nome: '', matricula: '', email: '', ativo: true });

  const handleCadastrar = async () => {
    if (!novo.nome || !novo.matricula) return;

    try {
      const resposta = await fetch(`${import.meta.env.VITE_API_URL}/alunos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...novo, telefone: "" }), // Para o backend não reclamar do telefone
      });

      if (resposta.ok) {
        // Se a API der sucesso, pega o aluno devolvido pelo banco
        const alunoSalvo = await resposta.json();
        
        setAlunos([...alunos, alunoSalvo]);
        
        // Limpa o modal
        setNovo({ nome: '', matricula: '', email: '', ativo: true });
        setModalAberto(false);
      } else {
        console.error("Erro na API ao salvar aluno.");
      }
    } catch (erro) {
      console.error("Erro de comunicação com o servidor:", erro);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Controle de Alunos</Typography>
        <Button variant="contained" color="success" startIcon={<PersonAdd />} onClick={() => setModalAberto(true)}>
          Novo Aluno
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Aluno</strong></TableCell>
              <TableCell><strong>E-mail</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {alunos.map((aluno) => (
              <TableRow key={aluno.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {aluno.nome}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Matrícula: {aluno.matricula}
                  </Typography>
                </TableCell>
                <TableCell>{aluno.email}</TableCell>
                <TableCell>
                  <Chip 
                    label={aluno.ativo ? 'Ativo' : 'Inativo'} 
                    color={aluno.ativo ? 'success' : 'default'} 
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
        <DialogTitle sx={{ fontWeight: 'bold' }}>Cadastrar Aluno</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Nome Completo" fullWidth value={novo.nome} onChange={(e) => setNovo({ ...novo, nome: e.target.value })} />
              <TextField label="Matrícula" fullWidth value={novo.matricula} onChange={(e) => setNovo({ ...novo, matricula: e.target.value })} />
            </Box>
            <TextField label="E-mail" fullWidth value={novo.email} onChange={(e) => setNovo({ ...novo, email: e.target.value })} />
            <FormControlLabel 
              control={<Switch checked={novo.ativo} onChange={(e) => setNovo({ ...novo, ativo: e.target.checked })} color="success" />} 
              label="Aluno Ativo no Sistema" 
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