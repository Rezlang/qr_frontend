// usePDFProcessor.js
import { useState, useEffect } from "react";
import { PDFDocument } from "pdf-lib";

const COLORS = ['#007CF0', '#FF4D4D', '#00C896', '#FF9900', '#A259FF'];

export const usePDFProcessor = () => {
  // track which colors are free to assign
  const [availableColors, setAvailableColors] = useState([...COLORS]);
  const [pdfFiles, setPdfFiles] = useState([]);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [orderedItems, setOrderedItems] = useState([]);
  const [draggingId, setDraggingId] = useState(null);

  const itemWidth = 120;
  const itemHeight = 160;
  const gap = 16;

  const handleFileUpload = async (files) => {
    const slots = 5 - pdfFiles.length;
    const accepted = Array.from(files).slice(0, slots);
    if (!accepted.length) return;

    // grab as many colors as we need from the front of the pool
    const newColors = availableColors.slice(0, accepted.length);
    const remainingColors = availableColors.slice(accepted.length);

    const loaded = await Promise.all(
      accepted.map(async (file, idx) => {
        const fileColor = newColors[idx];
        const previewUrl = URL.createObjectURL(file);
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);

        const pages = await Promise.all(
          pdfDoc.getPages().map(async (page, pidx) => {
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
              color: fileColor,
              name: file.name.replace(/\.pdf$/i, ""),
            };
          })
        );

        return {
          file,
          previewUrl,
          pages,
          color: fileColor,
          name: file.name.replace(/\.pdf$/i, ""),
        };
      })
    );

    // update state: add new files, consume colors
    setPdfFiles(prev => [...prev, ...loaded]);
    setAvailableColors(remainingColors);
  };

  const removeFile = (fileIndex) => {
    setPdfFiles(prev => {
      const entry = prev[fileIndex];
      if (entry) {
        // return its color to the pool
        setAvailableColors(colors => [...colors, entry.color]);
      }
      return prev.filter((_, idx) => idx !== fileIndex);
    });
  };

  const removePage = (fileIndex, originalIndex) => {
    setPdfFiles(prev => {
      let freedColor = null;
      const newFiles = prev.flatMap((entry, idx) => {
        if (idx !== fileIndex) return entry;
        const newPages = entry.pages.filter(p => p.originalIndex !== originalIndex);
        if (newPages.length) {
          return { ...entry, pages: newPages };
        }
        // if no pages remain, drop the file and free its color
        freedColor = entry.color;
        return [];
      });
      if (freedColor) {
        setAvailableColors(colors => [...colors, freedColor]);
      }
      return newFiles;
    });
  };

  const toggleMode = () => setAdvancedMode(m => !m);

  useEffect(() => {
    if (advancedMode) {
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

  const handleDragStart = (_, __, id) => setDraggingId(id);
  const handleDrag = (_, data, id) => {
    if (draggingId !== id) setDraggingId(id);
    setOrderedItems(prev =>
      prev.map(item => item.id === id ? { ...item, x: data.x } : item)
    );
  };
  const handleStop = (_, data, id) => {
    setOrderedItems(prev => {
      const start = prev.findIndex(i => i.id === id);
      const threshold = (itemWidth + gap) / 2;
      const dest = Math.min(
        prev.length - 1,
        Math.max(0, Math.floor((data.x + threshold) / (itemWidth + gap)))
      );
      const items = [...prev];
      if (dest !== start) {
        const [moved] = items.splice(start, 1);
        items.splice(dest, 0, moved);
      }
      return items.map((it, i) => ({ ...it, x: i * (itemWidth + gap) }));
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
        const copied = await newPdf.copyPages(loaded, loaded.getPageIndices());
        copied.forEach(p => newPdf.addPage(p));
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
