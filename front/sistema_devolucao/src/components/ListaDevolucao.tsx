import React, { useState } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem
} from '@mui/material';

export default function ListaDevolucao({ alunos, equipamentos, setEquipamentos, tecnicos, emprestimos, setEmprestimos }) {
  const [modalAberto, setModalAberto] = useState(false);
  const [erro, setErro] = useState('');
  const [novoEmprestimo, setNovoEmprestimo] = useState({ aluno_id: '', equipamento_id: '', tecnico_id: '', data_prevista_devolucao: '' });

  const hojeData = new Date().toISOString().split('T')[0];

  const alunoTemAtraso = (alunoId) => {
    return emprestimos.some(emp => 
      emp.aluno_id === alunoId && 
      !emp.data_devolucao && 
      emp.data_prevista_devolucao < hojeData
    );
  };

  const handleSalvar = () => {
    // Regra 2.1: Bloqueia se o aluno tem pendência
    if (alunoTemAtraso(novoEmprestimo.aluno_id)) {
      setErro('Aluno possui equipamento em atraso e não pode retirar outro item.');
      return;
    }

    const equipamento = equipamentos.find(eq => eq.id === novoEmprestimo.equipamento_id);
    // Regra 2.1: Bloqueia se o equipamento não está disponível
    if (equipamento?.status !== 'disponivel') {
      setErro('Equipamento não está disponível para empréstimo.');
      return;
    }

    if (!novoEmprestimo.aluno_id || !novoEmprestimo.tecnico_id || !novoEmprestimo.data_prevista_devolucao) {
      setErro('Preencha todos os campos obrigatórios.');
      return;
    }

    // Registra Empréstimo
    const novoRegistro = {
      id: Date.now(),
      ...novoEmprestimo,
      tecnico_devolucao_id: null,
      data_emprestimo: hojeData,
      data_devolucao: null
    };

    setEmprestimos([...emprestimos, novoRegistro]);
    
    // Regra 2.2: Sincroniza status do equipamento
    setEquipamentos(equipamentos.map(eq => 
      eq.id === novoEmprestimo.equipamento_id ? { ...eq, status: 'emprestado' } : eq
    ));

    setModalAberto(false);
    setErro('');
  };

  const handleDevolver = (emprestimoId, equipamentoId) => {
    const tecnicoPadraoId = tecnicos[0]?.id; // Simula login do técnico logado

    setEmprestimos(emprestimos.map(emp => 
      emp.id === emprestimoId ? { ...emp, data_devolucao: hojeData, tecnico_devolucao_id: tecnicoPadraoId } : emp
    ));

    // Regra 2.2: Sincroniza status do equipamento na devolução
    setEquipamentos(equipamentos.map(eq => 
      eq.id === equipamentoId ? { ...eq, status: 'disponivel' } : eq
    ));
  };

  // Simula a vw_emprestimos_ativos
  const emprestimosAtivos = emprestimos
    .filter(emp => !emp.data_devolucao)
    .map(emp => {
      const aluno = alunos.find(a => a.id === emp.aluno_id);
      const equipamento = equipamentos.find(eq => eq.id === emp.equipamento_id);
      const atrasado = emp.data_prevista_devolucao < hojeData;
      return { ...emp, alunoNome: aluno?.nome, equipamentoNome: equipamento?.nome, atrasado };
    });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Controle de Empréstimos Ativos</Typography>
        <Button variant="contained" color="success" onClick={() => setModalAberto(true)}>
          + Novo Empréstimo
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: '#f0f0f0' }}>
            <TableRow>
              <TableCell><strong>Aluno</strong></TableCell>
              <TableCell><strong>Equipamento</strong></TableCell>
              <TableCell><strong>Retirada</strong></TableCell>
              <TableCell><strong>Prev. Devolução</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell align="center"><strong>Ação</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {emprestimosAtivos.map((item) => (
              <TableRow key={item.id} sx={{ bgcolor: item.atrasado ? '#fff5f5' : 'inherit' }}>
                <TableCell>{item.alunoNome}</TableCell>
                <TableCell>{item.equipamentoNome}</TableCell>
                <TableCell>{item.data_emprestimo}</TableCell>
                <TableCell>{item.data_prevista_devolucao}</TableCell>
                <TableCell>
                  <Chip
                    label={item.atrasado ? 'Atrasado' : 'Em Dia'}
                    color={item.atrasado ? 'error' : 'primary'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Button size="small" variant="outlined" onClick={() => handleDevolver(item.id, item.equipamento_id)}>
                    Devolver
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={modalAberto} onClose={() => setModalAberto(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Registrar Retirada</DialogTitle>
        <DialogContent>
          {erro && <Alert severity="error" sx={{ my: 1 }}>{erro}</Alert>}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            
            <TextField select label="Técnico Responsável" fullWidth
              value={novoEmprestimo.tecnico_id}
              onChange={(e) => setNovoEmprestimo({ ...novoEmprestimo, tecnico_id: e.target.value })}
            >
              {tecnicos.filter(t => t.ativo).map((t) => (
                <MenuItem key={t.id} value={t.id}>{t.nome}</MenuItem>
              ))}
            </TextField>

            <TextField select label="Aluno" fullWidth
              value={novoEmprestimo.aluno_id}
              onChange={(e) => setNovoEmprestimo({ ...novoEmprestimo, aluno_id: e.target.value })}
            >
              {alunos.filter(a => a.ativo).map((a) => (
                <MenuItem key={a.id} value={a.id}>{a.nome} ({a.matricula})</MenuItem>
              ))}
            </TextField>

            <TextField select label="Equipamento Disponível" fullWidth
              value={novoEmprestimo.equipamento_id}
              onChange={(e) => setNovoEmprestimo({ ...novoEmprestimo, equipamento_id: e.target.value })}
            >
              {equipamentos.filter(eq => eq.status === 'disponivel').map((eq) => (
                <MenuItem key={eq.id} value={eq.id}>{eq.nome} ({eq.patrimonio})</MenuItem>
              ))}
            </TextField>

            {/* <TextField label="Data Prevista de Devolução" type="date" fullWidth InputLabelProps={{ shrink: true }}
              value={novoEmprestimo.data_prevista_devolucao}
              onChange={(e) => setNovoEmprestimo({ ...novoEmprestimo, data_prevista_devolucao: e.target.value })}
            /> */}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalAberto(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSalvar}>Confirmar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}