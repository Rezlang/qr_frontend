import { Box, Typography } from "@mui/material";
import { useDropzone } from "react-dropzone";

const FileDropZone = ({ onFilesAdded, disabled }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onFilesAdded,
    accept: { "application/pdf": [".pdf"] },
    disabled,
    multiple: true,
  });

  return (
    <Box
      {...getRootProps()}
      sx={{
        border: "2px dashed",
        borderColor: "grey.400",
        borderRadius: 1,
        p: 2,
        textAlign: "center",
        cursor: "pointer",
        mb: 2,
      }}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <Typography>Drop the files here…</Typography>
      ) : (
        <Typography>
          Drag &amp; drop PDF files here, or click to select files
        </Typography>
      )}
    </Box>
  );
};

export default FileDropZone;
