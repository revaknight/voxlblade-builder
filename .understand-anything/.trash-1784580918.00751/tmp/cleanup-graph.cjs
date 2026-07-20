const fs = require('fs');
const graphPath = process.argv[2];
const outputPath = process.argv[3];
const graph = JSON.parse(fs.readFileSync(graphPath, 'utf8'));
const nodeIds = new Set(graph.nodes.map(n => n.id));

// Remove invalid node types
graph.nodes = graph.nodes.filter(n => {
  if (n.type === 'Readonly<Record<string, string>>') return false;
  return true;
});

// Fix layers: remove missing nodeIds
graph.layers = graph.layers.map(layer => ({
  ...layer,
  nodeIds: (layer.nodeIds || []).filter(id => nodeIds.has(id))
}));

// Fix tour: remove missing nodeIds
graph.tour = graph.tour.map(step => ({
  ...step,
  nodeIds: (step.nodeIds || []).filter(id => nodeIds.has(id))
}));

// Remove empty layers
graph.layers = graph.layers.filter(l => l.nodeIds.length > 0);

fs.writeFileSync(outputPath, JSON.stringify(graph, null, 2));
console.log('Fixed: ' + graph.nodes.length + ' nodes, ' + graph.edges.length + ' edges, ' + graph.layers.length + ' layers, ' + graph.tour.length + ' tour steps');