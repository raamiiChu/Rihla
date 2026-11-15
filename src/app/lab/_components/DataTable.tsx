import type { ReactNode } from "react";

type Row = { id: string } & Record<string, ReactNode>;

type Column<T extends Row> = {
  key: keyof T & string;
  label: string;
  /** Numbers read best aligned to the end, with tabular figures. */
  numeric?: boolean;
};

type DataTableProps<T extends Row> = {
  /** Read by screen readers; not shown on screen. */
  caption: string;
  columns: Column<T>[];
  rows: T[];
};

function DataTable<T extends Row>({
  caption,
  columns,
  rows,
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-neutral-800 text-neutral-500">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`px-3 py-2 font-normal ${column.numeric ? "text-end" : "text-start"}`}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-neutral-900">
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`px-3 py-2 text-neutral-300 ${column.numeric ? "text-end tabular-nums" : "text-start"}`}
                >
                  {row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export type { Column };
export default DataTable;
