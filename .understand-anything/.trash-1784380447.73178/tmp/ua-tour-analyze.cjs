const fs = require('fs');
const inputFile = process.argv[2];
const outputFile = process.argv[3];

const data = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
const { nodes, edges, layers } = data;

// Fan-in: count incoming edges (imported by many)
const fanIn = {};
const fanOut = {};
for (const n of nodes) { fanIn[n.id] = 0; fanOut[n.id] = 0; }
for (const e of edges) {
  if (e.type === 'imports' || e.type === 'calls') {
    fanOut[e.source] = (fanOut[e.source] || 0) + 1;
    fanIn[e.target] = (fanIn[e.target] || 0) + 1;
  }
}

const fanInRanking = Object.entries(fanIn)
  .filter(([id]) => nodes.find(n => n.id === id && (n.type === 'file' || n.type === 'config')))
  .sort((a, b) => b[1] - a[1])
  .slice(0, 20)
  .map(([id, count]) => ({ id, count }));

const fanOutRanking = Object.entries(fanOut)
  .filter(([id]) => nodes.find(n => n.id === id && n.type === 'file'))
  .sort((a, b) => b[1] - a[1])
  .slice(0, 20)
  .map(([id, count]) => ({ id, count }));

// Entry point candidates: files with high fan-out and low fan-in
const entryCandidates = Object.keys(fanOut)
  .filter(id => {
    const n = nodes.find(nd => nd.id === id);
    return n && n.type === 'file' && fanOut[id] > 0 && (fanIn[id] || 0) <= 2;
  })
  .sort((a, b) => fanOut[b] - fanOut[a])
  .slice(0, 10)
  .map(id => ({ id, fanOut: fanOut[id], fanIn: fanIn[id] || 0 }));

// BFS from src/main.ts
function bfs(startId) {
  const visited = new Set();
  const queue = [startId];
  visited.add(startId);
  const traversal = [];
  while (queue.length > 0) {
    const current = queue.shift();
    const n = nodes.find(nd => nd.id === current);
    if (n) traversal.push({ id: current, name: n.name, type: n.type, summary: n.summary });
    for (const e of edges) {
      if (e.source === current && !visited.has(e.target)) {
        visited.add(e.target);
        queue.push(e.target);
      }
    }
  }
  return traversal;
}
const bfsFromMain = bfs('file:src/main.ts');

// Non-code files
const nonCode = nodes.filter(n =>
  n.type === 'config' || n.type === 'document' || n.type === 'pipeline' ||
  (n.type === 'file' && (n.name.endsWith('.json') || n.name.endsWith('.yml') || n.name.endsWith('.md') || n.name.endsWith('.css') || n.name.endsWith('.html')))
).map(n => ({ id: n.id, type: n.type, name: n.name, summary: n.summary }));

// Tightly coupled clusters (files that share many imports)
const importEdges = edges.filter(e => e.type === 'imports');
const adjacency = {};
for (const e of importEdges) {
  if (!adjacency[e.source]) adjacency[e.source] = new Set();
  if (!adjacency[e.target]) adjacency[e.target] = new Set();
  adjacency[e.source].add(e.target);
  adjacency[e.target].add(e.source);
}

const clusters = [];
const clustered = new Set();
// Find files in the engine directory that are tightly coupled
const engineFiles = nodes.filter(n => n.id.startsWith('file:src/lib/engine/') && n.type === 'file');
for (const f of engineFiles) {
  if (clustered.has(f.id)) continue;
  const neighbors = adjacency[f.id] || new Set();
  const clusterMembers = [f.id, ...[...neighbors].filter(n => n.startsWith('file:src/lib/engine/'))];
  if (clusterMembers.length > 1) {
    clusters.push({
      name: f.filePath.replace('src/lib/', ''),
      members: clusterMembers.slice(0, 8)
    });
    clusterMembers.forEach(m => clustered.add(m));
  }
}

// Data layer cluster
const dataFiles = nodes.filter(n => n.id.startsWith('file:src/data/') && n.type === 'file');
const dataCluster = dataFiles.slice(0, 10).map(f => f.id);
clusters.push({ name: 'Game Data Layer', members: dataCluster });

// Node summary index
const nodeIndex = {};
for (const n of nodes) {
  nodeIndex[n.id] = { name: n.name, type: n.type, complexity: n.complexity, tags: n.tags };
}

const results = {
  fanInRanking,
  fanOutRanking,
  entryCandidates,
  bfsFromMain: bfsFromMain.slice(0, 50),
  nonCode,
  clusters,
  layers: layers.map(l => ({ id: l.id, name: l.name, nodeCount: l.nodeIds.length })),
  nodeIndex
};

fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
console.log('Tour analysis complete.');
console.log(`Fan-in top 5: ${fanInRanking.slice(0, 5).map(f => `${f.id.split('/').pop()}(${f.count})`).join(', ')}`);
console.log(`Fan-out top 5: ${fanOutRanking.slice(0, 5).map(f => `${f.id.split('/').pop()}(${f.fanOut})`).join(', ')}`);
console.log(`BFS from main: ${bfsFromMain.length} reachable nodes`);
console.log(`Clusters: ${clusters.length}`);
console.log(`Non-code files: ${nonCode.length}`);
