import React, { useState } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  InputLabel
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

  // Transformado em Async (POST para salvar o empréstimo)
  const handleSalvar = async () => {
    if (!novoEmprestimo.aluno_id || !novoEmprestimo.tecnico_id || !novoEmprestimo.equipamento_id) {
      setErro('Preencha todos os campos obrigatórios.');
      return;
    }

    if (!novoEmprestimo.data_prevista_devolucao){
      setErro('A data de devolução é inválida ou está em branco. Verifique os dias do mês.');
      return;
    }

    if (alunoTemAtraso(novoEmprestimo.aluno_id)) {
      setErro('Aluno possui equipamento em atraso e não pode retirar outro item.');
      return;
    }

    const equipamento = equipamentos.find(eq => eq.id === novoEmprestimo.equipamento_id);
    if (equipamento?.status !== 'disponivel') {
      setErro('Equipamento não está disponível para empréstimo.');
      return;
    }

    try {
      const registroParaEnviar = {
        ...novoEmprestimo,
        data_emprestimo: hojeData
      };

      const resposta = await fetch(`${import.meta.env.VITE_API_URL}/emprestimos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registroParaEnviar)
      });

      if (resposta.ok) {
        const emprestimoSalvo = await resposta.json();
        
        setEmprestimos([...emprestimos, emprestimoSalvo]);
        setEquipamentos(equipamentos.map(eq => 
          eq.id === novoEmprestimo.equipamento_id ? { ...eq, status: 'emprestado' } : eq
        ));

        setModalAberto(false);
        setErro('');
        setNovoEmprestimo({ aluno_id: '', equipamento_id: '', tecnico_id: '', data_prevista_devolucao: '' });
      } else {
        setErro('Erro ao registrar no banco de dados.');
      }
    } catch (erro) {
      setErro('Erro de conexão com a API.');
    }
  };

  // Transformado em Async (PUT/PATCH para registrar a devolução)
  const handleDevolver = async (emprestimoId, equipamentoId) => {
    const tecnicoPadraoId = tecnicos[0]?.id; // Simula login do técnico logado

    try {
      const resposta = await fetch(`${import.meta.env.VITE_API_URL}/emprestimos/${emprestimoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data_devolucao: hojeData,
          tecnico_devolucao_id: tecnicoPadraoId
        })
      });

      if (resposta.ok) {
        setEmprestimos(emprestimos.map(emp => 
          emp.id === emprestimoId ? { ...emp, data_devolucao: hojeData, tecnico_devolucao_id: tecnicoPadraoId } : emp
        ));

        setEquipamentos(equipamentos.map(eq => 
          eq.id === equipamentoId ? { ...eq, status: 'disponivel' } : eq
        ));
      } else {
        console.error("Falha ao registrar devolução na API");
      }
    } catch (erro) {
      console.error("Erro de conexão ao devolver:", erro);
    }
  };

  const emprestimosAtivos = emprestimos
    .filter(emp => !emp.data_devolucao)
    .map(emp => {
      const aluno = alunos.find(a => a.id === emp.aluno_id);
      const equipamento = equipamentos.find(eq => eq.id === emp.equipamento_id);
      const atrasado = emp.data_prevista_devolucao < hojeData;
      return { 
        ...emp, 
        alunoNome: aluno?.nome, 
        alunoMatricula: aluno?.matricula,
        equipamentoNome: equipamento?.nome, 
        equipamentoPatrimonio: equipamento?.patrimonio,
        atrasado 
      };
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
              <TableCell><strong>Equipamento</strong></TableCell>
              <TableCell><strong>Aluno</strong></TableCell>
              <TableCell><strong>Retirada</strong></TableCell>
              <TableCell><strong>Prev. Devolução</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell align="center"><strong>Ação</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {emprestimosAtivos.map((item) => (
              <TableRow key={item.id} sx={{ bgcolor: item.atrasado ? '#fff5f5' : 'inherit' }}>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }} color={item.atrasado ? 'error' : 'textPrimary'}>
                    {item.equipamentoNome}
                  </Typography>
                  <Typography variant="caption" color={item.atrasado ? 'error' : 'textSecondary'}>
                    Pat: {item.equipamentoPatrimonio}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }} color={item.atrasado ? 'error' : 'textPrimary'}>
                    {item.alunoNome}
                  </Typography>
                  <Typography variant="caption" color={item.atrasado ? 'error' : 'textSecondary'}>
                    {item.alunoMatricula}
                  </Typography>
                </TableCell>
                <TableCell sx={{ color: item.atrasado ? 'red' : 'inherit' }}>{item.data_emprestimo}</TableCell>
                <TableCell sx={{ color: item.atrasado ? 'red' : 'inherit', fontWeight: item.atrasado ? 'bold' : 'normal' }}>
                  {item.data_prevista_devolucao}
                </TableCell>
                <TableCell>
                  <Chip
                    label={item.atrasado ? 'Atrasado' : 'Em dia'}
                    color={item.atrasado ? 'error' : 'success'}
                    variant={item.atrasado ? 'filled' : 'outlined'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Button size="small" variant="outlined" color="inherit" onClick={() => handleDevolver(item.id, item.equipamento_id)}>
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
            <TextField label="Data Prevista de Devolução" type="date" fullWidth slotProps={{inputLabel: { shrink: true, } }} 
              value={novoEmprestimo.data_prevista_devolucao}
              onChange={(e) => setNovoEmprestimo({ ...novoEmprestimo, data_prevista_devolucao: e.target.value })}
            />
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