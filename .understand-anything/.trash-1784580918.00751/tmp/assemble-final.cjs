const fs = require('fs');
const path = require('path');

const uaDir = process.argv[2];
const assembledPath = path.join(uaDir, 'intermediate', 'assembled-graph.json');
const layersPath = path.join(uaDir, 'intermediate', 'layers.json');
const tourPath = path.join(uaDir, 'intermediate', 'tour.json');
const outputPath = path.join(uaDir, 'intermediate', 'final-graph.json');

// Read inputs
const assembled = JSON.parse(fs.readFileSync(assembledPath, 'utf8'));
let layers = JSON.parse(fs.readFileSync(layersPath, 'utf8'));
let tour = JSON.parse(fs.readFileSync(tourPath, 'utf8'));

// Unwrap envelope if needed
if (layers.layers) layers = layers.layers;
if (tour.steps) tour = tour.steps;

// Normalize node IDs: file:: → file: (double colon to single)
function normalizeId(id) {
  if (!id) return id;
  return id.replace(/^file::/, 'file:').replace(/^function::/, 'function:').replace(/^class::/, 'class:');
}

// Transform nodes to knowledge graph schema
const nodes = assembled.nodes.map(n => {
  const id = normalizeId(n.id);
  const filePath = n.path || n.filePath || '';
  const name = n.label || n.name || path.basename(filePath);
  
  // Generate summary from meta if not present
  let summary = n.summary || '';
  if (!summary && n.meta) {
    const m = n.meta;
    if (m.category === 'code') {
      summary = `Source file with ${m.functionCount || 0} functions, ${m.exportCount || 0} exports.`;
    } else if (m.category === 'config') {
      summary = `Configuration file.`;
    } else if (m.category === 'docs') {
      summary = `Documentation file.`;
    } else if (m.category === 'data') {
      summary = `Game data definitions.`;
    } else {
      summary = `${m.category || 'code'} file.`;
    }
  }
  if (!summary) summary = `${n.type || 'file'} node.`;
  
  // Generate tags from meta
  let tags = n.tags || [];
  if (tags.length === 0 && n.meta) {
    const m = n.meta;
    if (m.category === 'code') tags = ['source-code'];
    else if (m.category === 'config') tags = ['configuration'];
    else if (m.category === 'docs') tags = ['documentation'];
    else if (m.category === 'data') tags = ['game-data'];
    else if (m.category === 'infra') tags = ['infrastructure'];
    else if (m.category === 'markup') tags = ['markup'];
    else tags = ['file'];
  }
  if (tags.length === 0) tags = ['file'];
  
  // Map node type
  let type = n.type || 'file';
  if (type === 'svelte-component') type = 'file';
  if (type === 'type') type = 'class';
  if (type === 'export') type = 'function';
  if (type === 'constant') type = 'function';
  if (type === 'object') type = 'class';
  if (type === 'store') type = 'class';
  
  const node = {
    id,
    type,
    name,
    summary,
    tags,
    complexity: n.complexity || 'moderate'
  };
  
  // Add filePath for file-level nodes
  if (['file', 'config', 'document', 'service', 'pipeline', 'schema', 'resource'].includes(type)) {
    node.filePath = filePath;
  }
  
  // Add lineRange for function/class nodes
  if (n.lineRange) node.lineRange = n.lineRange;
  else if (n.startLine && n.endLine) node.lineRange = [n.startLine, n.endLine];
  
  return node;
});

// Normalize edges
const edges = (assembled.edges || []).map(e => ({
  source: normalizeId(e.source),
  target: normalizeId(e.target),
  type: e.type || 'related',
  direction: e.direction || 'forward',
  weight: e.weight || 0.5
})).filter(e => e.source && e.target && e.source !== e.target);

// Fix layers: normalize nodeIds
layers = layers.map(layer => ({
  id: layer.id,
  name: layer.name,
  description: layer.description,
  nodeIds: (layer.nodeIds || []).map(normalizeId)
}));

// Fix tour: normalize nodeIds
tour = tour.map(step => ({
  order: step.order,
  title: step.title,
  description: step.description,
  nodeIds: (step.nodeIds || []).map(normalizeId)
}));

// Build final graph
const finalGraph = {
  version: '1.0.0',
  project: {
    name: 'voxlblade-builder',
    languages: ['typescript', 'svelte', 'json', 'css', 'yaml', 'html', 'markdown', 'javascript'],
    frameworks: ['Svelte', 'Vite', 'Tailwind CSS'],
    description: 'Svelte 5 + Vite + TypeScript damage calculator for Voxel Blade RPG with weapon calculations, enchantments, perks, and draconic rune system',
    analyzedAt: new Date().toISOString(),
    gitCommitHash: 'd15bbd87a859f14a77ffe8a9995d78587d698603'
  },
  nodes,
  edges,
  layers,
  tour
};

fs.writeFileSync(outputPath, JSON.stringify(finalGraph, null, 2));
console.log(`Final graph: ${nodes.length} nodes, ${edges.length} edges, ${layers.length} layers, ${tour.length} tour steps`);
console.log(`Written to: ${outputPath}`);
