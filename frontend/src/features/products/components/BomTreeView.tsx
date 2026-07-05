import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  BackgroundVariant,
  type Node,
  type Edge,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import dagre from "dagre";
import { Package, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { productService, type BomTree } from "@/features/products/services/product-service";
import { BomItemDialog } from "./BomItemDialog";

const NODE_WIDTH = 200;
const NODE_HEIGHT = 80;

interface BomTreeViewProps {
  productId: string;
  productName: string;
}

function ProductNode({ data }: NodeProps) {
  const d = data as {
    productName: string;
    productCode: string;
    quantity: number;
    productUnit: string;
    isRoot: boolean;
  };

  return (
    <div
      className={`px-3 py-2 rounded-lg shadow-md border-2 transition-colors ${
        d.isRoot
          ? "bg-primary/10 border-primary"
          : "bg-card border-border"
      }`}
      style={{ width: NODE_WIDTH }}
    >
      <div className="flex items-center gap-1.5">
        <Package className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <span className="font-mono text-[10px] text-muted-foreground truncate">
          {d.productCode}
        </span>
      </div>
      <div className="font-medium text-sm truncate mt-0.5">{d.productName}</div>
      <div className="text-xs text-muted-foreground mt-0.5">
        {d.quantity} {d.productUnit}
      </div>
    </div>
  );
}

const nodeTypes = { productNode: ProductNode };

function buildLayout(tree: BomTree): { nodes: Node[]; edges: Edge[] } {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: "LR", nodesep: 60, ranksep: 120 });

  const flowNodes: Node[] = tree.nodes.map((n) => ({
    id: n.id,
    type: "productNode",
    position: { x: 0, y: 0 },
    data: {
      productName: n.productName,
      productCode: n.productCode,
      quantity: n.quantity,
      productUnit: n.productUnit,
      isRoot: n.isRoot,
    },
  }));

  const flowEdges: Edge[] = tree.edges.map((e) => ({
    id: e.id,
    source: e.sourceId,
    target: e.targetId,
    type: "smoothstep",
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
    label: `${e.quantity}`,
    style: { strokeWidth: 2 },
  }));

  flowNodes.forEach((n) => {
    dagreGraph.setNode(n.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  flowEdges.forEach((e) => {
    dagreGraph.setEdge(e.source, e.target);
  });

  dagre.layout(dagreGraph);

  const positionedNodes = flowNodes.map((n) => {
    const pos = dagreGraph.node(n.id);
    return {
      ...n,
      position: {
        x: pos.x - NODE_WIDTH / 2,
        y: pos.y - NODE_HEIGHT / 2,
      },
    };
  });

  return { nodes: positionedNodes, edges: flowEdges };
}

export function BomTreeView({ productId, productName }: BomTreeViewProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadTree = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productService.getBomTree(productId);
      const tree = res.data.data;
      if (tree.nodes.length === 0) {
        setNodes([]);
        setEdges([]);
        return;
      }
      const { nodes: positionedNodes, edges: positionedEdges } = buildLayout(tree);
      setNodes(positionedNodes);
      setEdges(positionedEdges);
    } catch {
      toast.error(t("common.error"));
    } finally {
      setLoading(false);
    }
  }, [productId, setNodes, setEdges, t]);

  useEffect(() => {
    loadTree();
  }, [loadTree]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      navigate(`/products/${node.id}`);
    },
    [navigate]
  );

  const onEdgeClick = useCallback(
    async (_: React.MouseEvent, edge: Edge) => {
      const confirmed = window.confirm(t("products.bomDeleteConfirm"));
      if (!confirmed) return;
      try {
        await productService.deleteBomItem(edge.id);
        toast.success(t("common.success"), {
          description: t("products.bomDeleteSuccess"),
        });
        loadTree();
      } catch (error: any) {
        toast.error(t("common.error"), {
          description: error.response?.data?.message || t("common.error"),
        });
      }
    },
    [loadTree, t]
  );

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <p className="text-muted-foreground">{t("common.loading")}</p>
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] gap-4">
        <Package className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">{t("products.bomEmpty")}</p>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("products.bomAdd")}
        </Button>
        <BomItemDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          productId={productId}
          onSuccess={loadTree}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {t("products.bomDescription", { name: productName })}
        </p>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("products.bomAdd")}
        </Button>
      </div>

      <div className="h-[500px] rounded-lg border">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
        >
          <Controls />
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        </ReactFlow>
      </div>

      <p className="text-xs text-muted-foreground">
        {t("products.bomHint")}
      </p>

      <BomItemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        productId={productId}
        onSuccess={loadTree}
      />
    </div>
  );
}
