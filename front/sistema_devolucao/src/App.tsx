import React, { useState } from 'react';
import ListaEquipamentos from './components/ListaEquipamentos';
import ListaDevolucao from './components/ListaDevolucao';
import ListaAlunos from './components/ListaAlunos';
import ListaTecnicos from './components/ListaTecnicos';
import { AppBar, Box, Container, Tab, Tabs, Toolbar, Typography } from '@mui/material';



export default function App() {
  const [aba, setAba] = useState(0);

  // Tabelas simuladas baseadas no banco de dados
  const [alunos, setAlunos] = useState([
    { id: 1, nome: 'João Silva', matricula: '202301', email: 'joao@email.com', telefone: '11999999999', ativo: true },
    { id: 2, nome: 'Maria Souza', matricula: '202302', email: 'maria@email.com', telefone: '11888888888', ativo: true }
  ]);

  const [equipamentos, setEquipamentos] = useState([
    { id: 1, nome: 'Osciloscópio Digital', patrimonio: 'LAB-0101', categoria: 'Medição', status: 'emprestado' },
    { id: 2, nome: 'Multímetro Fluke', patrimonio: 'LAB-0102', categoria: 'Medição', status: 'disponivel' }
  ]);

  const [tecnicos, setTecnicos] = useState([
    { id: 1, nome: 'Carlos Eduardo', login: 'carlos.tec', ativo: true },
    { id: 2, nome: 'Ana Costa', login: 'ana.tec', ativo: true }
  ]);

  const [emprestimos, setEmprestimos] = useState([
    { 
      id: 1, 
      aluno_id: 2, 
      equipamento_id: 1, 
      tecnico_id: 1, 
      tecnico_devolucao_id: null, 
      data_emprestimo: '2026-07-20', 
      data_prevista_devolucao: '2026-07-27', 
      data_devolucao: null 
    }
  ]);

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#f4f6f8', minHeight: '100vh' }}>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Controle de Laboratório
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, bgcolor: '#fff', borderRadius: 1 }}>
          <Tabs value={aba} onChange={(e, val) => setAba(val)} centered>
            <Tab label="Empréstimos" />
            <Tab label="Equipamentos" />
            <Tab label="Alunos" />
            <Tab label="Técnicos" />
          </Tabs>
        </Box>

        {aba === 0 && <ListaDevolucao alunos={alunos} equipamentos={equipamentos} setEquipamentos={setEquipamentos} tecnicos={tecnicos} emprestimos={emprestimos} setEmprestimos={setEmprestimos} />}
        {aba === 1 && <ListaEquipamentos equipamentos={equipamentos} setEquipamentos={setEquipamentos} />}
        {aba === 2 && <ListaAlunos alunos={alunos} setAlunos={setAlunos} />}
        {aba === 3 && <ListaTecnicos tecnicos={tecnicos} setTecnicos={setTecnicos} />}
      </Container>
    </Box>
  );
}