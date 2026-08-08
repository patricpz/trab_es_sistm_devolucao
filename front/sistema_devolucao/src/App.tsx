import React, { useState } from 'react';
import ListaEquipamentos from './components/ListaEquipamentos';
import ListaDevolucao from './components/ListaDevolucao';
import ListaAlunos from './components/ListaAlunos';
import ListaTecnicos from './components/ListaTecnicos';
import { AppBar, Box, CssBaseline, Drawer, List, ListItem, ListItemButton, ListItemText, Toolbar, Typography } from '@mui/material';
import { Dashboard, PrecisionManufacturing, School, Engineering } from '@mui/icons-material';
import { ListItemIcon } from '@mui/material';

const LARGURA_MENU = 240;

export default function App() {
  const [menuAtivo, setMenuAtivo] = useState(0);

  // Tabelas simuladas baseadas no banco de dados (Mantidas do seu código original)
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
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f4f6f8' }}>
      <CssBaseline />

      {/* MENU LATERAL ESCURO */}
      <Drawer
        variant="permanent"
        sx={{
          width: LARGURA_MENU,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { 
            width: LARGURA_MENU, 
            boxSizing: 'border-box', 
            bgcolor: '#1a202c', 
            color: '#fff'       
          },
        }}
      >
        <Toolbar>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          LabControl
        </Typography>
        </Toolbar>
        <List sx={{ mt: 2 }}>
          {['Empréstimos', 'Equipamentos', 'Alunos', 'Técnicos'].map((texto, index) => {
            // Define um ícone específico para cada tela
            const icones = [<Dashboard />, <PrecisionManufacturing />, <School />, <Engineering />];

            return (
              <ListItem key={texto} disablePadding>
                <ListItemButton 
                  selected={menuAtivo === index} 
                  onClick={() => setMenuAtivo(index)}
                  sx={{
                    mx: 1, // Dá uma margem lateral para o botão não colar na borda
                    borderRadius: 1, // Arredonda os cantos do botão
                    '&.Mui-selected': { bgcolor: 'rgba(255,255,255,0.1)' } 
                  }}
                >
                  {/* Renderiza o ícone correspondente e força a cor branca */}
                  <ListItemIcon sx={{ color: '#fff', minWidth: 40 }}>
                    {icones[index]}
                  </ListItemIcon>
                  <ListItemText primary={texto} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Drawer>
      
      {/* ÁREA PRINCIPAL */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        
        {/* Cabeçalho Branco */}
        <AppBar position="static" elevation={1} sx={{ bgcolor: '#fff', color: '#000', mb: 4, borderRadius: 1 }}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: 'center', fontWeight: 'bold' }}>
              LabControl System
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Renderização das Telas - Cada tela já cuida do seu próprio Modal de cadastro! */}
        {menuAtivo === 0 && <ListaDevolucao alunos={alunos} equipamentos={equipamentos} setEquipamentos={setEquipamentos} tecnicos={tecnicos} emprestimos={emprestimos} setEmprestimos={setEmprestimos} />}
        {menuAtivo === 1 && <ListaEquipamentos equipamentos={equipamentos} setEquipamentos={setEquipamentos} />}
        {menuAtivo === 2 && <ListaAlunos alunos={alunos} setAlunos={setAlunos} />}
        {menuAtivo === 3 && <ListaTecnicos tecnicos={tecnicos} setTecnicos={setTecnicos} />}
      </Box>
    </Box>
  );
}