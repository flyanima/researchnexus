-- 种子数据（可选）
-- 此文件包含示例数据，用于测试和演示

-- 插入默认类目
INSERT INTO themes (name, description, color) VALUES
('AI', 'Artificial Intelligence and Machine Learning', '#3b82f6'),
('Physics', 'Physics and Quantum Computing', '#8b5cf6'),
('Architecture', 'Architecture and Urban Design', '#ec4899'),
('Biology', 'Biology and Life Sciences', '#10b981'),
('Chemistry', 'Chemistry and Materials Science', '#f59e0b'),
('General', 'General Research', '#6b7280')
ON CONFLICT (name) DO NOTHING;

-- 插入示例项目
INSERT INTO projects (id, name, theme, description, created_at) VALUES
(
    '550e8400-e29b-41d4-a716-446655440001',
    'Quantum Computing Algorithms',
    'Physics',
    'Exploration of new algorithms for error correction in quantum circuits.',
    '2023-01-15T09:00:00Z'
),
(
    '550e8400-e29b-41d4-a716-446655440002',
    'Sustainable Urban Planning',
    'Architecture',
    'Designing self-sustaining modular housing units for high-density cities.',
    '2023-05-10T09:00:00Z'
),
(
    '550e8400-e29b-41d4-a716-446655440003',
    'Neural Network Optimization',
    'AI',
    'Research on improving training efficiency of large language models.',
    '2023-08-20T10:00:00Z'
);

-- 插入示例 artifacts
INSERT INTO artifacts (project_id, type, title, description, date, content) VALUES
(
    '550e8400-e29b-41d4-a716-446655440001',
    'MARKDOWN',
    'Initial Hypothesis',
    'Drafting the core mathematical foundations.',
    '2023-02-01T10:00:00Z',
    '# Quantum Error Correction

This research focuses on surface codes and their application in quantum computing.

## Key Findings

- Surface codes provide robust error correction
- Scalability challenges remain
- New topological approaches show promise

## Next Steps

1. Implement simulation framework
2. Test with real quantum hardware
3. Optimize code distance parameters'
),
(
    '550e8400-e29b-41d4-a716-446655440001',
    'MARKDOWN',
    'Simulation Results',
    'Analysis of error rates in different configurations.',
    '2023-03-15T14:30:00Z',
    '# Simulation Results

## Configuration A
- Error rate: 0.001%
- Qubit count: 100
- Code distance: 7

## Configuration B
- Error rate: 0.0005%
- Qubit count: 200
- Code distance: 9

Configuration B shows significant improvement.'
),
(
    '550e8400-e29b-41d4-a716-446655440002',
    'MARKDOWN',
    'Design Principles',
    'Core architectural concepts for sustainable housing.',
    '2023-06-20T11:00:00Z',
    '# Sustainable Housing Design

## Principles

1. **Energy Efficiency**: Solar panels + thermal insulation
2. **Water Management**: Rainwater harvesting + greywater recycling
3. **Modular Design**: Flexible layouts for different family sizes
4. **Local Materials**: Reduce carbon footprint

## Prototype Specifications

- Area: 60 m²
- Capacity: 2-4 people
- Energy: 100% renewable
- Water: 80% self-sufficient'
),
(
    '550e8400-e29b-41d4-a716-446655440003',
    'MARKDOWN',
    'Training Optimization Techniques',
    'Novel approaches to reduce training time.',
    '2023-09-10T15:00:00Z',
    '# Training Optimization

## Techniques Explored

### 1. Gradient Checkpointing
- Memory reduction: 40%
- Speed impact: -10%

### 2. Mixed Precision Training
- Memory reduction: 50%
- Speed improvement: +30%

### 3. Dynamic Batch Sizing
- Throughput increase: +25%
- Convergence: Stable

## Recommendation

Combine mixed precision with dynamic batch sizing for optimal results.'
);

-- 验证数据
SELECT 
    p.name as project_name,
    COUNT(a.id) as artifact_count
FROM projects p
LEFT JOIN artifacts a ON p.id = a.project_id
GROUP BY p.id, p.name
ORDER BY p.created_at;

