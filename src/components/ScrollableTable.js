import React from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";

const ScrollableTable = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className="text-center text-gray-500">There's nothing here.</p>;
  }
  const columns = data[0]
  const content = data.slice(1,data.length + 1)
  return (
    <TableContainer component={Paper} style={{ maxHeight: 400 }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell key={col} style={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                {col}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {content.map((row, rowIndex) => (
            <TableRow key={rowIndex} hover>
              {columns.map((col, colIdx) => (
                <TableCell key={col}>
                  {row[colIdx]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ScrollableTable;
