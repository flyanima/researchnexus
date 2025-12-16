import { Project, Artifact, ArtifactType } from '../types';

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Quantum Computing Algorithms',
    theme: 'Physics',
    description: 'Exploration of new algorithms for error correction in quantum circuits.',
    createdAt: '2023-01-15T09:00:00Z',
    artifacts: [
      {
        id: 'a1',
        projectId: 'p1',
        type: ArtifactType.MARKDOWN,
        title: 'Initial Hypothesis',
        description: 'Drafting the core mathematical foundations.',
        date: '2023-02-01T10:00:00Z',
        url: '',
        content: '# Quantum Error Correction\n\nThis research focuses on surface codes...'
      },
      {
        id: 'a2',
        projectId: 'p1',
        type: ArtifactType.HTML,
        title: 'Simulation Results Visualization',
        description: 'Interactive graph of qubit stability.',
        date: '2023-03-15T14:30:00Z',
        url: 'https://www.google.com' // Placeholder for demo logic
      }
    ]
  },
  {
    id: 'p2',
    name: 'Sustainable Urban Planning',
    theme: 'Architecture',
    description: 'Designing self-sustaining modular housing units for high-density cities.',
    createdAt: '2023-05-10T09:00:00Z',
    artifacts: [
      {
        id: 'a3',
        projectId: 'p2',
        type: ArtifactType.PDF,
        title: 'Blueprints V1',
        description: 'Architectural drawings for the prototype.',
        date: '2023-06-20T11:00:00Z',
        url: '' // Will handle file uploads dynamically
      }
    ]
  }
];