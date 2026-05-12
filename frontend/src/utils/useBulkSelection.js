import { useMemo, useState } from 'react';

export default function useBulkSelection() {
  const [selectedIds, setSelectedIds] = useState([]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const clearSelection = () => setSelectedIds([]);

  const toggleSelection = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((itemId) => itemId !== id);
      }
      return [...prev, id];
    });
  };

  const replaceSelection = (ids) => {
    const normalized = [...new Set((ids || []).filter((id) => Number.isInteger(Number(id))))].map((id) => Number(id));
    setSelectedIds(normalized);
  };

  const isSelected = (id) => selectedSet.has(id);

  const getHeaderCheckboxState = (visibleIds) => {
    if (!visibleIds.length) {
      return { checked: false, indeterminate: false };
    }

    const selectedVisibleCount = visibleIds.filter((id) => selectedSet.has(id)).length;
    return {
      checked: selectedVisibleCount > 0 && selectedVisibleCount === visibleIds.length,
      indeterminate: selectedVisibleCount > 0 && selectedVisibleCount < visibleIds.length,
    };
  };

  const toggleSelectAllVisible = (visibleIds, shouldSelect) => {
    const normalizedVisible = [...new Set((visibleIds || []).map((id) => Number(id)).filter((id) => Number.isInteger(id)))];

    setSelectedIds((prev) => {
      if (shouldSelect) {
        return [...new Set([...prev, ...normalizedVisible])];
      }
      const visibleSet = new Set(normalizedVisible);
      return prev.filter((id) => !visibleSet.has(id));
    });
  };

  return {
    selectedIds,
    selectedSet,
    selectedCount: selectedIds.length,
    clearSelection,
    toggleSelection,
    replaceSelection,
    isSelected,
    getHeaderCheckboxState,
    toggleSelectAllVisible,
  };
}
