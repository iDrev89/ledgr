"use client";

import { useState, Fragment } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ExpandableTableProps<TData> {
  data: TData[];
  columns: {
    header: string;
    accessor: (item: TData) => React.ReactNode;
    className?: string;
  }[];
  renderExpandedContent?: (item: TData) => React.ReactNode;
  expandable?: boolean;
}

export function ExpandableTable<TData extends { id: string }>({
  data,
  columns,
  renderExpandedContent,
  expandable = true,
}: ExpandableTableProps<TData>) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay datos disponibles
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {expandable && <TableHead className="w-[50px]"></TableHead>}
            {columns.map((column, index) => (
              <TableHead key={index} className={column.className}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => {
            const isExpanded = expandedRows.has(item.id);
            return (
              <Fragment key={item.id}>
                <TableRow className={cn(isExpanded && "border-b-0")}>
                  {expandable && renderExpandedContent && (
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => toggleRow(item.id)}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  )}
                  {columns.map((column, colIndex) => (
                    <TableCell key={colIndex} className={column.className}>
                      {column.accessor(item)}
                    </TableCell>
                  ))}
                </TableRow>
                {expandable && renderExpandedContent && isExpanded && (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length + 1}
                      className="bg-muted/50 p-4"
                    >
                      {renderExpandedContent(item)}
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
