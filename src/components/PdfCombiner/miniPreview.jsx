import { useState, useEffect } from "react";
import { PDFDocument } from "pdf-lib";

export const usePDFProcessor = () => {
  const [pdfFiles, setPdfFiles] = useState([]);
  const [pdfPages, setPdfPages] = useState([]);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [orderedItems, setOrderedItems] = useState([]);

  const [draggingId, setDraggingId] = useState(null);

  const itemWidth = 120;
  const itemHeight = 160;
  const gap = 16;

  const handleFileUpload = async (files) => {
    // Limit files to the maximum allowed (e.g., 5)
    const acceptedFiles = files.slice(0, 5 - pdfFiles.length);
    const loadedFiles = await Promise.all(
      acceptedFiles.map(async (file) => {
        const filePreviewUrl = URL.createObjectURL(file);
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pages = await Promise.all(
          pdfDoc.getPages().map(async (_, idx) => {
            const newDoc = await PDFDocument.create();
            const [copiedPage] = await newDoc.copyPages(pdfDoc, [idx]);
            newDoc.addPage(copiedPage);
            const singlePageBytes = await newDoc.save();
            const pagePreviewUrl = URL.createObjectURL(
              new Blob([singlePageBytes], { type: "application/pdf" })
            );
            return {
              name: file.name.replace(/\.pdf$/i, ""),
              bytes: singlePageBytes,
              previewUrl: pagePreviewUrl,
            };
          })
        );
        return { file, previewUrl: filePreviewUrl, pages };
      })
    );
  
    setPdfFiles((prev) => [...prev, ...loadedFiles]);
    setPdfPages((prev) => [...prev, ...loadedFiles]);
  };  

  const removeFile = (index) => {
    const fileToRemove = pdfFiles[index]?.file;
    setPdfFiles((prev) => prev.filter((_, i) => i !== index));
    setPdfPages((prev) => prev.filter((entry) => entry.file !== fileToRemove));
  };

  const toggleMode = () => setAdvancedMode((prev) => !prev);

  useEffect(() => {
    if (advancedMode) {
      const flatPages = pdfPages
        .filter((entry) => entry && entry.file && entry.pages)
        .flatMap((entry) =>
          entry.pages.map((page, idx) => ({
            id: `page-${entry.file?.name || "unknown"}-${idx}`,
            type: "page",
            file: entry.file,
            name: page.name,
            bytes: page.bytes,
            previewUrl: page.previewUrl,
          }))
        );
      const itemsWithPos = flatPages.map((item, i) => ({
        ...item,
        x: i * (itemWidth + gap),
      }));
      setOrderedItems(itemsWithPos);
    } else {
      const items = pdfFiles
        .filter((entry) => entry && entry.file)
        .map((entry, i) => ({
          id: `file-${entry.file.name}-${i}`,
          type: "file",
          file: entry.file,
          previewUrl: entry.previewUrl,
        }));
      const itemsWithPos = items.map((item, i) => ({
        ...item,
        x: i * (itemWidth + gap),
      }));
      setOrderedItems(itemsWithPos);
    }
  }, [advancedMode, pdfFiles, pdfPages, itemWidth, gap]);

  const handleDragStart = (e, data, id) => {
    setDraggingId(id);
  };

  const handleDrag = (e, data, id) => {
    // keep this item marked as dragging
    if (draggingId !== id) setDraggingId(id);

    setOrderedItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, x: data.x } : item
      )
    );
  };

  const handleStop = (e, data, id) => {
    // reorder logic (unchanged)
    setOrderedItems(prevItems => {
      const startIndex = prevItems.findIndex(i => i.id === id);
      const threshold = (itemWidth + gap) / 2;
      const newIndex = Math.min(
        prevItems.length - 1,
        Math.max(
          0,
          Math.floor((data.x + threshold) / (itemWidth + gap))
        )
      );

      let items = [...prevItems];
      if (newIndex !== startIndex) {
        const [moved] = items.splice(startIndex, 1);
        items.splice(newIndex, 0, moved);
      }
      // snap all to grid
      const snapped = items.map((item, i) => ({
        ...item,
        x: i * (itemWidth + gap),
      }));
      // clear dragging state
      setDraggingId(null);
      return snapped;
    });
  };
  

  const combinePDFs = async () => {
    const newPdf = await PDFDocument.create();
    if (advancedMode) {
      for (const item of orderedItems) {
        const loaded = await PDFDocument.load(item.bytes);
        const [copied] = await newPdf.copyPages(loaded, [0]);
        newPdf.addPage(copied);
      }
    } else {
      for (const item of orderedItems) {
        const arrayBuffer = await item.file.arrayBuffer();
        const loaded = await PDFDocument.load(arrayBuffer);
        const copiedPages = await newPdf.copyPages(
          loaded,
          loaded.getPageIndices()
        );
        copiedPages.forEach((p) => newPdf.addPage(p));
      }
    }
    const pdfBytes = await newPdf.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "combined.pdf";
    link.click();
  };

  return {
    pdfFiles,
    pdfPages,
    orderedItems,
    advancedMode,
    itemHeight,
    itemWidth,
    gap,
    draggingId,
    handleFileUpload,
    removeFile,
    toggleMode,
    handleDrag,
    handleStop,
    combinePDFs,
  };
};
