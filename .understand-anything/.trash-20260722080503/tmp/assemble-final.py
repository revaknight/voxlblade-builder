#!/usr/bin/env python3
"""Assemble final knowledge graph from assembled-graph.json + existing layers/tour."""
import json
import sys
import os
import re

project_root = sys.argv[1]
assembled_path = os.path.join(project_root, '.understand-anything', 'intermediate', 'assembled-graph.json')
existing_path = os.path.join(project_root, '.understand-anything', 'knowledge-graph.json')
output_path = os.path.join(project_root, '.understand-anything', 'intermediate', 'assembled-graph.json')

# Read assembled graph
with open(assembled_path, 'r', encoding='utf-8') as f:
    assembled = json.load(f)

# Read existing graph for layers and tour
with open(existing_path, 'r', encoding='utf-8') as f:
    existing = json.load(f)

# Build a map of existing nodes
existing_nodes = {n['id']: n for n in existing.get('nodes', [])}
existing_node_ids = set(existing_nodes.keys())

# Normalize node ID: convert various formats to standard format
def normalize_node_id(node_id):
    """Normalize node ID to standard format."""
    if not node_id:
        return node_id
    
    # Remove double colon prefix: file::src/... -> file:src/...
    if node_id.startswith('file::'):
        node_id = 'file:' + node_id[6:]
    
    # Remove 'node::' prefix: node::src/... -> src/...
    if node_id.startswith('node::'):
        node_id = node_id[6:]
    
    # Handle function nodes with __nofilepath__
    if node_id.startswith('function:__nofilepath__:'):
        # Extract file path and function name
        parts = node_id[23:].split('::')
        if len(parts) >= 2:
            file_path = parts[0]
            func_name = parts[-1]
            node_id = f'function:{file_path}:{func_name}'
    
    # Handle file::function format
    if node_id.startswith('file:function:'):
        # Convert to function: prefix
        node_id = 'function:' + node_id[14:]
    
    # Handle file:type::, file:interface::, file:const::, file:component::
    for prefix in ['type::', 'interface::', 'const::', 'component::']:
        if node_id.startswith('file:' + prefix):
            # Convert to appropriate type prefix
            type_prefix = prefix[:-2]  # Remove ::
            node_id = type_prefix + ':' + node_id[len('file:' + prefix):]
            break
    
    # Handle function:: prefix
    if node_id.startswith('function::'):
        node_id = 'function:' + node_id[10:]
    
    # Handle file:node:: prefix
    if node_id.startswith('file:node::'):
        node_id = 'file:' + node_id[11:]
    
    return node_id

# Normalize assembled nodes to match existing graph format
normalized_nodes = []
for node in assembled['nodes']:
    normalized_id = normalize_node_id(node['id'])
    
    # Skip duplicates (prefer existing graph nodes)
    if normalized_id in existing_node_ids:
        continue
    
    n = {
        'id': normalized_id,
        'type': node['type'],
        'name': node.get('label', node.get('name', '')),
        'summary': node.get('metadata', {}).get('description', node.get('summary', '')),
        'tags': node.get('tags', []),
        'complexity': node.get('complexity', 'moderate')
    }
    
    # Add filePath if available
    if 'metadata' in node and 'filePath' in node.get('metadata', {}):
        n['filePath'] = node['metadata']['filePath']
    elif '::' not in node['id'] and node['id'].startswith('file:'):
        n['filePath'] = node['id'][5:]  # Remove 'file:' prefix
    
    # Ensure all nodes have summary and tags
    if not n['summary']:
        if n['type'] == 'function':
            n['summary'] = f"Function: {n['name']}"
        elif n['type'] in ['type', 'interface']:
            n['summary'] = f"Type definition: {n['name']}"
        elif n['type'] == 'constant':
            n['summary'] = f"Constant: {n['name']}"
        elif n['type'] == 'component':
            n['summary'] = f"Component: {n['name']}"
        elif n['type'] == 'concept':
            n['summary'] = f"Concept: {n['name']}"
        else:
            n['summary'] = f"Source file: {n['name']}"
    if not n['tags']:
        # Generate tags based on file path
        file_path = n.get('filePath', n['name'])
        if file_path.endswith('.svelte'):
            n['tags'] = ['svelte', 'component', 'ui']
        elif file_path.endswith('.ts'):
            n['tags'] = ['typescript', 'module']
        elif file_path.endswith('.css'):
            n['tags'] = ['css', 'styles']
        elif file_path.endswith('.json'):
            n['tags'] = ['json', 'data']
        elif file_path.endswith('.md'):
            n['tags'] = ['markdown', 'documentation']
        else:
            n['tags'] = ['code']
    
    normalized_nodes.append(n)

# Add existing nodes that aren't in the new nodes
for node_id, node in existing_nodes.items():
    if node_id not in {n['id'] for n in normalized_nodes}:
        normalized_nodes.append(node)

# Normalize assembled edges
normalized_edges = []
for edge in assembled['edges']:
    source = normalize_node_id(edge.get('source', ''))
    target = normalize_node_id(edge.get('target', ''))
    
    # Only add edges with valid source and target that exist in node set
    if source and target:
        e = {
            'source': source,
            'target': target,
            'type': edge.get('type', 'related'),
            'direction': edge.get('direction', 'forward'),
            'weight': edge.get('weight', 0.5)
        }
        normalized_edges.append(e)

# Build node ID set for validation
node_ids = {n['id'] for n in normalized_nodes}
# Also include existing node IDs
node_ids.update(existing_node_ids)

# Update layers: keep existing layers, add new nodes to appropriate layers
layers = existing.get('layers', [])

# Collect all node IDs currently in layers
assigned_nodes = set()
for layer in layers:
    assigned_nodes.update(layer.get('nodeIds', []))

# Add unassigned file nodes to appropriate layers
for node in normalized_nodes:
    if node['id'] in assigned_nodes:
        continue
    if not node['id'].startswith('file:'):
        continue
    
    file_path = node.get('filePath', node['id'][5:])
    
    # Determine which layer this file belongs to
    target_layer = None
    if file_path.startswith('src/data/'):
        target_layer = 'layer:game-data'
    elif file_path.startswith('src/lib/constants/'):
        target_layer = 'layer:constants-and-config'
    elif file_path.startswith('src/lib/engine/'):
        target_layer = 'layer:calculation-engine'
    elif file_path.endswith('.svelte'):
        target_layer = 'layer:ui-components'
    elif file_path.startswith('src/lib/'):
        target_layer = 'layer:utilities-and-stores'
    elif file_path.startswith('docs/'):
        target_layer = 'layer:documentation'
    elif file_path.startswith('src/'):
        target_layer = 'layer:entry-and-build-config'
    
    if target_layer:
        for layer in layers:
            if layer['id'] == target_layer:
                if 'nodeIds' not in layer:
                    layer['nodeIds'] = []
                layer['nodeIds'].append(node['id'])
                assigned_nodes.add(node['id'])
                break

# Keep existing tour
tour = existing.get('tour', [])

# Assemble final graph
final_graph = {
    'version': '1.0.0',
    'project': {
        'name': 'voxlblade-builder',
        'languages': ['typescript', 'svelte', 'json', 'css', 'yaml', 'html', 'markdown', 'javascript'],
        'frameworks': ['Svelte', 'Vite', 'Tailwind CSS'],
        'description': 'Svelte 5 + Vite + TypeScript damage calculator for Voxel Blade RPG with weapon calculations, enchantments, perks, and draconic rune system',
        'analyzedAt': '2026-07-22T00:00:00.000Z',
        'gitCommitHash': '6c0f78446fec38550e1c0dea3643b153d64a6157'
    },
    'nodes': normalized_nodes,
    'edges': normalized_edges,
    'layers': layers,
    'tour': tour
}

# Write output
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(final_graph, f, indent=2)

print(f"Final graph: {len(normalized_nodes)} nodes, {len(normalized_edges)} edges, {len(layers)} layers, {len(tour)} tour steps")
print(f"Written to {output_path}")
