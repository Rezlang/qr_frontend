// usePDFProcessor.js
import { useState, useEffect } from "react";
import { PDFDocument } from "pdf-lib";

const COLORS = ['#FF8A80', '#EA80FC', '#8C9EFF', '#80D8FF', '#A7FFEB'];

export const usePDFProcessor = () => {
  const [pdfFiles, setPdfFiles] = useState([]); 
  const [advancedMode, setAdvancedMode] = useState(false);
  const [orderedItems, setOrderedItems] = useState([]);
  const [draggingId, setDraggingId] = useState(null);

  const itemWidth = 120;
  const itemHeight = 160;
  const gap = 16;

  const handleFileUpload = async (files) => {
    const accepted = files.slice(0, 5 - pdfFiles.length);
    const loaded = await Promise.all(
      accepted.map(async (file, idx) => {
        const previewUrl = URL.createObjectURL(file);
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);

        // extract each page as its own PDF + name it
        const pages = await Promise.all(
          pdfDoc.getPages().map(async (_, pidx) => {
            const newDoc = await PDFDocument.create();
            const [copied] = await newDoc.copyPages(pdfDoc, [pidx]);
            newDoc.addPage(copied);
            const bytes = await newDoc.save();
            const pagePreview = URL.createObjectURL(
              new Blob([bytes], { type: "application/pdf" })
            );
            return {
              originalIndex: pidx,
              pageNumber: pidx + 1,
              bytes,
              previewUrl: pagePreview,
              // name shows file + page number
              name: `${file.name} (${pidx + 1})`,
            };
          })
        );

        const color = COLORS[(pdfFiles.length + idx) % COLORS.length];
        return {
          file,
          previewUrl,
          pages,
          color,
          // name for the file‐level thumbnail
          name: file.name,
        };
      })
    );
    setPdfFiles(prev => [...prev, ...loaded]);
  };

  const removeFile = (fileIndex) => {
    setPdfFiles(prev => prev.filter((_, idx) => idx !== fileIndex));
  };

  const removePage = (fileIndex, originalIndex) => {
    setPdfFiles(prev =>
      prev.flatMap((entry, idx) => {
        if (idx !== fileIndex) return entry;
        const newPages = entry.pages.filter(p => p.originalIndex !== originalIndex);
        return newPages.length ? { ...entry, pages: newPages } : [];
      })
    );
  };

  const toggleMode = () => setAdvancedMode(m => !m);

  useEffect(() => {
    if (advancedMode) {
      // flatten pages
      const flat = pdfFiles.flatMap((entry, fidx) =>
        entry.pages.map(page => ({
          id: `page-${fidx}-${page.originalIndex}`,
          type: "page",
          fileIndex: fidx,
          pageOriginalIndex: page.originalIndex,
          pageNumber: page.pageNumber,
          bytes: page.bytes,
          previewUrl: page.previewUrl,
          color: entry.color,
          name: page.name,
        }))
      );
      setOrderedItems(
        flat.map((item, i) => ({ ...item, x: i * (itemWidth + gap) }))
      );
    } else {
      // file‐level thumbnails
      const items = pdfFiles.map((entry, fidx) => ({
        id: `file-${fidx}`,
        type: "file",
        fileIndex: fidx,
        previewUrl: entry.previewUrl,
        color: entry.color,
        name: entry.name,
      }));
      setOrderedItems(
        items.map((item, i) => ({ ...item, x: i * (itemWidth + gap) }))
      );
    }
  }, [pdfFiles, advancedMode, itemWidth, gap]);

  const handleDragStart = (_, __, id) => {
    setDraggingId(id);
  };

  const handleDrag = (_, data, id) => {
    if (draggingId !== id) setDraggingId(id);
    setOrderedItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, x: data.x } : item
      )
    );
  };

  const handleStop = (_, data, id) => {
    setOrderedItems((prev) => {
      const startIndex = prev.findIndex((i) => i.id === id);
      const threshold = (itemWidth + gap) / 2;
      const newIndex = Math.min(
        prev.length - 1,
        Math.max(
          0,
          Math.floor((data.x + threshold) / (itemWidth + gap))
        )
      );
      const items = [...prev];
      if (newIndex !== startIndex) {
        const [moved] = items.splice(startIndex, 1);
        items.splice(newIndex, 0, moved);
      }
      return items.map((item, i) => ({
        ...item,
        x: i * (itemWidth + gap),
      }));
    });
    setDraggingId(null);
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
      for (const entry of pdfFiles) {
        const buffer = await entry.file.arrayBuffer();
        const loaded = await PDFDocument.load(buffer);
        const copied = await newPdf.copyPages(
          loaded,
          loaded.getPageIndices()
        );
        copied.forEach((p) => newPdf.addPage(p));
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
    advancedMode,
    itemWidth,
    itemHeight,
    gap,
    draggingId,
    orderedItems,
    handleFileUpload,
    removeFile,
    removePage,
    toggleMode,
    handleDragStart,
    handleDrag,
    handleStop,
    combinePDFs,
  };
};
