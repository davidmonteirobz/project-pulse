export type ProjectStatus = 'a_iniciar' | 'em_andamento' | 'finalizado';
export type DemandPriority = 'baixa' | 'media' | 'alta' | 'urgente';
export type DemandStatus = 'aberta' | 'em_analise' | 'em_execucao' | 'em_pausa' | 'concluida' | 'cancelada';

export interface Stage {
  id: string;
  name: string;
  estimatedHours: number;
  registeredHours: number;
}

export interface Project {
  id: string;
  name: string;
  responsible: string;
  deliveryDate: string;
  status: ProjectStatus;
  stages: Stage[];
}

export interface DemandResponsible {
  userId: string;
  userName: string;
  responsibilities: string[];
}

export interface Demand {
  id: string;
  title: string;
  description: string;
  responsibles: DemandResponsible[];
  priority: DemandPriority;
  status: DemandStatus;
  createdAt: string;
  startDate: string;
  dueDate: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export const users: User[] = [
  { id: '1', name: 'Ana Silva', email: 'ana@empresa.com', role: 'Designer' },
  { id: '2', name: 'Carlos Santos', email: 'carlos@empresa.com', role: 'Desenvolvedor' },
  { id: '3', name: 'Maria Oliveira', email: 'maria@empresa.com', role: 'Gerente de Projetos' },
  { id: '4', name: 'Pedro Costa', email: 'pedro@empresa.com', role: 'Desenvolvedor Backend' },
  { id: '5', name: 'Juliana Mendes', email: 'juliana@empresa.com', role: 'UX Designer' },
  { id: '6', name: 'Lucas Ferreira', email: 'lucas@empresa.com', role: 'Analista de Dados' },
];

export const demands: Demand[] = [
  {
    id: '1',
    title: 'Correção de bug no login',
    description: 'Usuários reportaram problemas ao fazer login com email corporativo.',
    responsibles: [
      { userId: '2', userName: 'Carlos Santos', responsibilities: ['Desenvolvimento e correção', 'Testes unitários'] },
      { userId: '4', userName: 'Pedro Costa', responsibilities: ['Revisão de código'] },
    ],
    priority: 'alta',
    status: 'em_execucao',
    createdAt: '2024-12-20',
    startDate: '2024-12-21',
    dueDate: '2024-12-27',
  },
  {
    id: '2',
    title: 'Novo layout da página inicial',
    description: 'Redesenhar a página inicial seguindo o novo guia de estilo.',
    responsibles: [
      { userId: '1', userName: 'Ana Silva', responsibilities: ['Design visual', 'Criação de assets'] },
      { userId: '5', userName: 'Juliana Mendes', responsibilities: ['UX e prototipagem'] },
    ],
    priority: 'media',
    status: 'em_analise',
    createdAt: '2024-12-22',
    startDate: '2024-12-23',
    dueDate: '2025-01-10',
  },
  {
    id: '3',
    title: 'Integração com API de pagamentos',
    description: 'Implementar integração com gateway de pagamentos.',
    responsibles: [
      { userId: '4', userName: 'Pedro Costa', responsibilities: ['Implementação backend', 'Documentação da API'] },
    ],
    priority: 'urgente',
    status: 'em_execucao',
    createdAt: '2024-12-18',
    startDate: '2024-12-19',
    dueDate: '2024-12-26',
  },
  {
    id: '4',
    title: 'Documentação técnica do módulo de relatórios',
    description: 'Criar documentação completa do módulo de relatórios.',
    responsibles: [
      { userId: '6', userName: 'Lucas Ferreira', responsibilities: ['Documentação e exemplos'] },
    ],
    priority: 'baixa',
    status: 'aberta',
    createdAt: '2024-12-24',
    startDate: '2024-12-26',
    dueDate: '2025-01-15',
  },
  {
    id: '5',
    title: 'Otimização de performance do dashboard',
    description: 'Melhorar tempo de carregamento do dashboard principal.',
    responsibles: [
      { userId: '2', userName: 'Carlos Santos', responsibilities: ['Análise e otimização'] },
      { userId: '6', userName: 'Lucas Ferreira', responsibilities: ['Métricas e monitoramento'] },
    ],
    priority: 'media',
    status: 'concluida',
    createdAt: '2024-12-15',
    startDate: '2024-12-16',
    dueDate: '2024-12-23',
  },
];

export const projects: Project[] = [
  {
    id: '1',
    name: 'Redesign do Site Corporativo',
    responsible: 'Ana Silva',
    deliveryDate: '2025-01-15',
    status: 'em_andamento',
    stages: [
      { id: '1-1', name: 'Pesquisa e Descoberta', estimatedHours: 20, registeredHours: 18 },
      { id: '1-2', name: 'Wireframes', estimatedHours: 15, registeredHours: 12 },
      { id: '1-3', name: 'Design Visual', estimatedHours: 30, registeredHours: 8 },
      { id: '1-4', name: 'Desenvolvimento Front-end', estimatedHours: 40, registeredHours: 0 },
    ],
  },
  {
    id: '2',
    name: 'App Mobile de Vendas',
    responsible: 'Carlos Santos',
    deliveryDate: '2025-01-10',
    status: 'em_andamento',
    stages: [
      { id: '2-1', name: 'Arquitetura', estimatedHours: 10, registeredHours: 10 },
      { id: '2-2', name: 'UI/UX Design', estimatedHours: 25, registeredHours: 20 },
      { id: '2-3', name: 'Desenvolvimento', estimatedHours: 60, registeredHours: 45 },
      { id: '2-4', name: 'Testes', estimatedHours: 15, registeredHours: 0 },
    ],
  },
  {
    id: '3',
    name: 'Sistema de Gestão Interna',
    responsible: 'Maria Oliveira',
    deliveryDate: '2025-02-01',
    status: 'a_iniciar',
    stages: [
      { id: '3-1', name: 'Levantamento de Requisitos', estimatedHours: 15, registeredHours: 0 },
      { id: '3-2', name: 'Modelagem de Dados', estimatedHours: 10, registeredHours: 0 },
      { id: '3-3', name: 'Desenvolvimento Backend', estimatedHours: 50, registeredHours: 0 },
      { id: '3-4', name: 'Desenvolvimento Frontend', estimatedHours: 40, registeredHours: 0 },
    ],
  },
  {
    id: '4',
    name: 'Integração API Pagamentos',
    responsible: 'Pedro Costa',
    deliveryDate: '2024-12-20',
    status: 'em_andamento',
    stages: [
      { id: '4-1', name: 'Análise Técnica', estimatedHours: 8, registeredHours: 8 },
      { id: '4-2', name: 'Implementação', estimatedHours: 20, registeredHours: 18 },
      { id: '4-3', name: 'Testes de Integração', estimatedHours: 10, registeredHours: 5 },
    ],
  },
  {
    id: '5',
    name: 'Portal do Cliente',
    responsible: 'Juliana Mendes',
    deliveryDate: '2024-12-30',
    status: 'finalizado',
    stages: [
      { id: '5-1', name: 'Design', estimatedHours: 20, registeredHours: 22 },
      { id: '5-2', name: 'Desenvolvimento', estimatedHours: 35, registeredHours: 38 },
      { id: '5-3', name: 'Deploy', estimatedHours: 5, registeredHours: 4 },
    ],
  },
  {
    id: '6',
    name: 'Dashboard Analytics',
    responsible: 'Lucas Ferreira',
    deliveryDate: '2025-01-20',
    status: 'a_iniciar',
    stages: [
      { id: '6-1', name: 'Definição de Métricas', estimatedHours: 10, registeredHours: 0 },
      { id: '6-2', name: 'Design de Interface', estimatedHours: 15, registeredHours: 0 },
      { id: '6-3', name: 'Implementação', estimatedHours: 30, registeredHours: 0 },
    ],
  },
];

export const getStatusLabel = (status: ProjectStatus): string => {
  const labels: Record<ProjectStatus, string> = {
    a_iniciar: 'A iniciar',
    em_andamento: 'Em andamento',
    finalizado: 'Finalizado',
  };
  return labels[status];
};

export const getDemandStatusLabel = (status: DemandStatus): string => {
  const labels: Record<DemandStatus, string> = {
    aberta: 'Aberta',
    em_analise: 'Em análise',
    em_execucao: 'Em execução',
    em_pausa: 'Em pausa',
    concluida: 'Concluída',
    cancelada: 'Cancelada',
  };
  return labels[status];
};

export const getPriorityLabel = (priority: DemandPriority): string => {
  const labels: Record<DemandPriority, string> = {
    baixa: 'Baixa',
    media: 'Média',
    alta: 'Alta',
    urgente: 'Urgente',
  };
  return labels[priority];
};

export const getProjectsInProgress = () => 
  projects.filter(p => p.status === 'em_andamento').length;

export const getDelayedProjects = () => {
  const today = new Date();
  return projects.filter(p => 
    p.status !== 'finalizado' && new Date(p.deliveryDate) < today
  ).length;
};

export const getDeliveriesThisWeek = () => {
  const today = new Date();
  const weekFromNow = new Date(today);
  weekFromNow.setDate(today.getDate() + 7);
  
  return projects.filter(p => {
    const deliveryDate = new Date(p.deliveryDate);
    return deliveryDate >= today && deliveryDate <= weekFromNow && p.status !== 'finalizado';
  }).length;
};

export const getTotalRegisteredHours = () => {
  return projects.reduce((total, project) => {
    return total + project.stages.reduce((stageTotal, stage) => stageTotal + stage.registeredHours, 0);
  }, 0);
};

export const getOpenDemands = () => 
  demands.filter(d => d.status !== 'concluida' && d.status !== 'cancelada').length;
