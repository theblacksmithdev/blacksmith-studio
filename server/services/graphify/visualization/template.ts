export interface VisTemplateInput {
  nodeCount: number;
  edgeCount: number;
  communityCount: number;
  visNodesJson: string;
  visEdgesJson: string;
}

/**
 * Renders the standalone HTML page that wraps vis-network with the graph
 * data inlined.
 *
 * Single Responsibility: HTML + CSS + client JS template. Kept as a pure
 * string builder so markup edits don't touch any orchestration code.
 */
export function renderVisualizationHtml(input: VisTemplateInput): string {
  const { nodeCount, edgeCount, communityCount, visNodesJson, visEdgesJson } =
    input;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Knowledge Graph</title>
  <script src="https://unpkg.com/vis-network@9.1.9/standalone/umd/vis-network.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #0d0d0d; color: #e0e0e0; font-family: -apple-system, system-ui, sans-serif; overflow: hidden; }
    #graph { width: 100vw; height: 100vh; }
    #info {
      position: fixed; top: 16px; left: 16px;
      padding: 10px 14px; border-radius: 10px;
      background: rgba(20,20,20,0.85); border: 1px solid rgba(255,255,255,0.08);
      backdrop-filter: blur(12px); font-size: 12px; color: rgba(255,255,255,0.5);
      pointer-events: none; z-index: 10;
    }
    #info strong { color: rgba(255,255,255,0.8); }
    #selected {
      position: fixed; bottom: 16px; left: 16px; max-width: 360px;
      padding: 12px 16px; border-radius: 10px;
      background: rgba(20,20,20,0.9); border: 1px solid rgba(255,255,255,0.1);
      backdrop-filter: blur(12px); font-size: 12px; color: rgba(255,255,255,0.6);
      z-index: 10; display: none;
    }
    #selected .label { font-size: 14px; font-weight: 600; color: #fff; margin-bottom: 4px; }
    #selected .meta { font-size: 11px; color: rgba(255,255,255,0.4); }
  </style>
</head>
<body>
  <div id="info"><strong>${nodeCount}</strong> nodes · <strong>${edgeCount}</strong> edges · <strong>${communityCount}</strong> communities</div>
  <div id="selected"></div>
  <div id="graph"></div>
  <script>
    const nodes = new vis.DataSet(${visNodesJson});
    const edges = new vis.DataSet(${visEdgesJson});
    const container = document.getElementById("graph");
    const network = new vis.Network(container, { nodes, edges }, {
      physics: {
        solver: "forceAtlas2Based",
        forceAtlas2Based: { gravitationalConstant: -40, centralGravity: 0.005, springLength: 120 },
        stabilization: { iterations: 200 },
      },
      interaction: { hover: true, tooltipDelay: 100, zoomView: true },
      edges: { width: 0.8, selectionWidth: 2 },
      nodes: { shape: "dot", size: 12, borderWidth: 1.5 },
    });
    const sel = document.getElementById("selected");
    network.on("selectNode", (e) => {
      const node = nodes.get(e.nodes[0]);
      if (!node) return;
      sel.style.display = "block";
      sel.innerHTML = '<div class="label">' + node.label + '</div><div class="meta">Community ' + (node.group ?? "—") + '</div>';
    });
    network.on("deselectNode", () => { sel.style.display = "none"; });
  </script>
</body>
</html>`;
}
