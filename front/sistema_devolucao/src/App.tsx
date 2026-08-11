import React, { useState, useEffect } from 'react';
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

  // 1. Estados limpos (iniciam como listas vazias para receber o banco de dados)
  const [alunos, setAlunos] = useState([]);
  const [equipamentos, setEquipamentos] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [emprestimos, setEmprestimos] = useState([]);

  // 2. Busca todos os dados do banco com proteção contra falhas
  useEffect(() => {
    const fetchSeguro = (url: string) => fetch(url).then(res => res.ok ? res.json() : []);

    Promise.all([
      fetchSeguro(`${import.meta.env.VITE_API_URL}/alunos`),
      fetchSeguro(`${import.meta.env.VITE_API_URL}/equipamentos`),
      fetchSeguro(`${import.meta.env.VITE_API_URL}/tecnicos`),
      fetchSeguro(`${import.meta.env.VITE_API_URL}/emprestimos`)
    ])
    .then(([dadosAlunos, dadosEquipamentos, dadosTecnicos, dadosEmprestimos]) => {
      setAlunos(dadosAlunos);
      setEquipamentos(dadosEquipamentos);
      setTecnicos(dadosTecnicos);
      setEmprestimos(dadosEmprestimos);
    })
    .catch(erro => console.error("Erro ao carregar dados da API:", erro));
  }, []);

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
            const icones = [<Dashboard />, <PrecisionManufacturing />, <School />, <Engineering />];

            return (
              <ListItem key={texto} disablePadding>
                <ListItemButton 
                  selected={menuAtivo === index} 
                  onClick={() => setMenuAtivo(index)}
                  sx={{
                    mx: 1, 
                    borderRadius: 1, 
                    '&.Mui-selected': { bgcolor: 'rgba(255,255,255,0.1)' } 
                  }}
                >
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

        {/* Renderização das Telas - O App.tsx distribui os dados reais para cada tela */}
        {menuAtivo === 0 && <ListaDevolucao alunos={alunos} equipamentos={equipamentos} setEquipamentos={setEquipamentos} tecnicos={tecnicos} emprestimos={emprestimos} setEmprestimos={setEmprestimos} />}
        {menuAtivo === 1 && <ListaEquipamentos equipamentos={equipamentos} setEquipamentos={setEquipamentos} />}
        {menuAtivo === 2 && <ListaAlunos alunos={alunos} setAlunos={setAlunos} />}
        {menuAtivo === 3 && <ListaTecnicos tecnicos={tecnicos} setTecnicos={setTecnicos} />}
      </Box>
    </Box>
  );
}