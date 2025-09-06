import { FixedSizeGrid as Grid } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import MemoryCard from './MemoryCard';
import { Memory } from '@/hooks/useMemories';
import { usePrefetchOnIntersect } from '@/hooks/useResponsiveMemoryImage';
import { memo, useCallback } from 'react';

interface Props {
  items: Memory[];
  columnWidth?: number; // px
  rowHeight?: number; // px
  gap?: number; // px
  viewMode: 'grid' | 'list';
}

// Simple responsive grid virtualization (fixed card height). For masonry, we keep visual spacing while
// still massively reducing DOM nodes; true dynamic masonry would need VariableSizeList/Grid.
const VirtualizedMemoryList = memo(function VirtualizedMemoryList({ items, columnWidth = 180, rowHeight = 220, gap = 8, viewMode }: Props) {
  // Prefetch cover images for all visible memories (only grid mode)
  usePrefetchOnIntersect(
    items.map(m => m.cover_photo).filter(Boolean) as string[],
    '600px'
  );
  if (viewMode === 'list') {
    // For list view, a simple virtualized vertical list would be ideal; here we keep simple since list renders are lighter
    return (
      <div className="space-y-6">
        {items.map(m => (
          <MemoryCard key={m.id} memory={m} viewMode="list" />
        ))}
      </div>
    );
  }

  return (
    <div data-memory-grid style={{ width: '100%', height: Math.min(800, Math.max(360, Math.ceil(items.length / 4) * (rowHeight + gap))) }}>
      <AutoSizer>
        {({ width, height }) => {
          const columns = Math.max(1, Math.floor((width + gap) / (columnWidth + gap)));
          const itemWidth = Math.floor((width - gap * (columns - 1)) / columns);
          const rows = Math.ceil(items.length / columns);
          const Cell = useCallback(({ columnIndex, rowIndex, style }) => {
            const index = rowIndex * columns + columnIndex;
            if (index >= items.length) return null;
            const memory = items[index];
            const adjusted = { ...style, left: (style as any).left + columnIndex * gap, top: (style as any).top + rowIndex * gap, width: itemWidth, height: rowHeight };
            return (
              <div style={adjusted} className="will-change-transform">
                <MemoryCard memory={memory} viewMode="grid" />
              </div>
            );
          }, [items, columns, gap, itemWidth, rowHeight]);
          return (
            <Grid
              columnCount={columns}
              columnWidth={itemWidth + gap}
              height={height}
              rowCount={rows}
              rowHeight={rowHeight + gap}
              width={width}
              overscanRowCount={2}
            >
              {Cell as any}
            </Grid>
          );
        }}
      </AutoSizer>
    </div>
  );
});

export default VirtualizedMemoryList;
