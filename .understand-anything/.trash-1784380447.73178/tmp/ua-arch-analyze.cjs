const fs = require('fs');
const path = require('path');

const inputFile = process.argv[2] || path.join(__dirname, '..', 'intermediate', 'assembled-graph.json');
const outputFile = process.argv[3] || path.join(__dirname, 'ua-arch-results.json');

const graph = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
const nodes = graph.nodes || [];
const edges = graph.edges || [];

// Extract file-level nodes (type: file, config, document, pipeline)
const fileTypes = ['file', 'config', 'document', 'pipeline'];
const fileNodes = nodes.filter(n => fileTypes.includes(n.type));

const functionNodes = nodes.filter(n => n.type === 'function');

// Directory grouping
function getTopDir(filePath) {
  if (!filePath) return 'root';
  const parts = filePath.replace(/\\/g, '/').split('/');
  if (parts.length <= 1) return 'root';
  // Group by first meaningful directory
  if (parts[0] === 'src') {
    return parts.length > 2 ? `src/${parts[1]}` : 'src';
  }
  if (parts[0] === '.github') return '.github';
  if (parts[0] === '.slim') return '.slim';
  if (parts[0] === '.understand-anything') return '.understand-anything';
  return parts[0] || 'root';
}

// Node type grouping
const typeGroups = {};
for (const node of fileNodes) {
  if (!typeGroups[node.type]) typeGroups[node.type] = [];
  typeGroups[node.type].push(node.id);
}

// Directory grouping
const dirGroups = {};
for (const node of fileNodes) {
  const dir = getTopDir(node.filePath);
  if (!dirGroups[dir]) dirGroups[dir] = [];
  dirGroups[dir].push(node.id);
}

// Import adjacency
const importEdges = edges.filter(e => e.type === 'imports');
const fanIn = {};  // how many files import this file
const fanOut = {}; // how many files this file imports

for (const edge of importEdges) {
  if (edge.source.startsWith('file:') || edge.source.startsWith('config:')) {
    fanOut[edge.source] = (fanOut[edge.source] || 0) + 1;
  }
  if (edge.target.startsWith('file:') || edge.target.startsWith('config:')) {
    fanIn[edge.target] = (fanIn[edge.target] || 0) + 1;
  }
}

// Cross-category dependencies
const categories = {};
for (const node of fileNodes) {
  const dir = getTopDir(node.filePath);
  if (!categories[dir]) categories[dir] = new Set();
  categories[dir].add(node.id);
}

const crossCatDeps = {};
for (const edge of importEdges) {
  const srcCat = getTopDirById(edge.source, fileNodes);
  const tgtCat = getTopDirById(edge.target, fileNodes);
  if (srcCat && tgtCat && srcCat !== tgtCat) {
    const key = `${srcCat} -> ${tgtCat}`;
    crossCatDeps[key] = (crossCatDeps[key] || 0) + 1;
  }
}

function getTopDirById(nodeId, allNodes) {
  const node = allNodes.find(n => n.id === nodeId);
  if (!node) return null;
  return getTopDir(node.filePath);
}

// Inter-group import frequency
const interGroupFreq = {};
for (const edge of importEdges) {
  const srcDir = getTopDirById(edge.source, fileNodes);
  const tgtDir = getTopDirById(edge.target, fileNodes);
  if (srcDir && tgtDir) {
    const key = `${srcDir} <-> ${tgtDir}`;
    interGroupFreq[key] = (interGroupFreq[key] || 0) + 1;
  }
}

// Intra-group import density
const intraGroupDensity = {};
for (const edge of importEdges) {
  const srcDir = getTopDirById(edge.source, fileNodes);
  const tgtDir = getTopDirById(edge.target, fileNodes);
  if (srcDir && tgtDir && srcDir === tgtDir) {
    intraGroupDensity[srcDir] = (intraGroupDensity[srcDir] || 0) + 1;
  }
}

// Directory pattern matching
const patterns = {};
for (const node of fileNodes) {
  const fp = (node.filePath || '').replace(/\\/g, '/');
  if (fp.endsWith('.svelte')) {
    patterns['svelte'] = (patterns['svelte'] || 0) + 1;
  }
  if (fp.endsWith('.ts')) {
    patterns['typescript'] = (patterns['typescript'] || 0) + 1;
  }
  if (fp.endsWith('.json')) {
    patterns['json'] = (patterns['json'] || 0) + 1;
  }
  if (fp.endsWith('.css')) {
    patterns['css'] = (patterns['css'] || 0) + 1;
  }
  if (fp.includes('engine/')) {
    patterns['engine'] = (patterns['engine'] || 0) + 1;
  }
  if (fp.includes('constants/')) {
    patterns['constants'] = (patterns['constants'] || 0) + 1;
  }
  if (fp.includes('modal')) {
    patterns['modal'] = (patterns['modal'] || 0) + 1;
  }
}

// Dependency direction analysis
const upwardsDeps = {}; // dependencies going "up" (data -> lib, lib -> engine)
const downwardsDeps = {}; // dependencies going "down" (engine -> lib, lib -> data)

const layerOrder = ['data', 'lib', 'engine'];
for (const edge of importEdges) {
  const srcDir = getTopDirById(edge.source, fileNodes);
  const tgtDir = getTopDirById(edge.target, fileNodes);
  if (srcDir && tgtDir && srcDir !== tgtDir) {
    const srcIdx = findLayerIndex(srcDir);
    const tgtIdx = findLayerIndex(tgtDir);
    if (srcIdx !== null && tgtIdx !== null) {
      if (srcIdx < tgtIdx) {
        upwardsDeps[`${srcDir} -> ${tgtDir}`] = (upwardsDeps[`${srcDir} -> ${tgtDir}`] || 0) + 1;
      } else {
        downwardsDeps[`${srcDir} -> ${tgtDir}`] = (downwardsDeps[`${srcDir} -> ${tgtDir}`] || 0) + 1;
      }
    }
  }
}

function findLayerIndex(dir) {
  if (dir.startsWith('src/data')) return 0;
  if (dir.startsWith('src/lib/constants')) return 1;
  if (dir.startsWith('src/lib') && !dir.includes('engine')) return 2;
  if (dir.startsWith('src/lib/engine')) return 3;
  if (dir === 'src') return 4;
  return null;
}

// Most imported files
const topImported = Object.entries(fanIn)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 15);

// Most importing files
const topImporting = Object.entries(fanOut)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 15);

const results = {
  summary: {
    totalFileNodes: fileNodes.length,
    totalFunctionNodes: functionNodes.length,
    totalEdges: edges.length,
    totalImportEdges: importEdges.length,
    directories: Object.keys(dirGroups).length,
    fileTypes: Object.keys(typeGroups)
  },
  typeGroups,
  dirGroups,
  fanIn: topImported,
  fanOut: topImporting,
  crossCategoryDeps: Object.entries(crossCatDeps).sort((a, b) => b[1] - a[1]),
  interGroupFreq: Object.entries(interGroupFreq).sort((a, b) => b[1] - a[1]),
  intraGroupDensity: Object.entries(intraGroupDensity).sort((a, b) => b[1] - a[1]),
  patterns,
  dependencyDirection: {
    upwards: Object.entries(upwardsDeps).sort((a, b) => b[1] - a[1]),
    downwards: Object.entries(downwardsDeps).sort((a, b) => b[1] - a[1])
  },
  fileNodeIds: fileNodes.map(n => n.id)
};

fs.writeFileSync(outputFile, JSON.stringify(results, null, 2), 'utf-8');
console.log('Analysis complete. Results written to:', outputFile);
console.log('Summary:', JSON.stringify(results.summary, null, 2));
