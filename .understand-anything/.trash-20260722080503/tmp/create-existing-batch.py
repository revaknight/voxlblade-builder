#!/usr/bin/env python3
"""Create batch-existing.json by filtering out changed files from the existing graph."""
import json
import sys
import os

project_root = sys.argv[1]
graph_path = os.path.join(project_root, '.understand-anything', 'knowledge-graph.json')
output_path = os.path.join(project_root, '.understand-anything', 'intermediate', 'batch-existing.json')

# Changed files (relative to project root)
changed_files = {
    'src/BaseDamageCalc.svelte',
    'src/BuffList.svelte',
    'src/DamageAnalyzer.svelte',
    'src/data/Boost.ts',
    'src/data/BuffData.ts',
    'src/data/Perkbasedmg.ts',
    'src/data/debuffCombatEffects.ts',
    'src/data/perkAutoDebuffs.ts',
    'src/lib/constants/boosts.ts',
    'src/lib/constants/perks.ts',
    'src/lib/damageTypeResolve.ts',
    'src/lib/engine/build.ts',
    'src/lib/engine/dmgTypeBonuses.ts',
}

with open(graph_path, 'r', encoding='utf-8') as f:
    graph = json.load(f)

# Filter out nodes whose filePath matches changed files
# Also filter out function/class nodes that belong to changed files
nodes_to_remove = set()
for node in graph['nodes']:
    file_path = node.get('filePath', '')
    node_id = node.get('id', '')
    
    # Check if this node is for a changed file
    if file_path in changed_files:
        nodes_to_remove.add(node_id)
    # Also remove function/class nodes that belong to changed files
    elif node_id.startswith('function:') or node_id.startswith('class:'):
        # Extract file path from node ID (format: function:<path>:<name>)
        parts = node_id.split(':')
        if len(parts) >= 2:
            node_file = parts[1]
            if node_file in changed_files:
                nodes_to_remove.add(node_id)

# Filter nodes
filtered_nodes = [n for n in graph['nodes'] if n['id'] not in nodes_to_remove]

# Filter edges (remove edges that reference removed nodes)
filtered_edges = [e for e in graph['edges'] 
                  if e.get('source') not in nodes_to_remove and 
                     e.get('target') not in nodes_to_remove]

# Write output
output = {
    'nodes': filtered_nodes,
    'edges': filtered_edges
}

with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(output, f, indent=2)

print(f"Removed {len(nodes_to_remove)} nodes, kept {len(filtered_nodes)} nodes")
print(f"Kept {len(filtered_edges)} edges (removed {len(graph['edges']) - len(filtered_edges)} edges)")
print(f"Written to {output_path}")
