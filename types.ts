export enum ArtifactType {
  HTML = 'HTML',
  PDF = 'PDF',
  MARKDOWN = 'MARKDOWN'
}

export interface Artifact {
  id: string;
  projectId: string;
  type: ArtifactType;
  title: string;
  description: string;
  date: string; // ISO date string
  url: string; // Object URL or external URL
  content?: string; // For markdown content raw text
}

export interface Project {
  id: string;
  name: string;
  theme: string;
  description: string;
  createdAt: string;
  artifacts: Artifact[];
}

export interface ProjectTheme {
  name: string;
  count: number;
}