import React from 'react';
import { Table as BootstrapTable } from 'react-bootstrap';
import '../../styles/components/ui.css';

/**
 * Reusable Table Component using Bootstrap
 * 
 * @param {Array} columns - Array of column definitions with properties:
 *   - key/field: Unique identifier for the column
 *   - header/label/title: Header text
 *   - render: Optional function to render custom cell content (value, row, index) => ReactNode
 *   - headerStyle/headerClassName: Optional styling for header
 *   - cellStyle/cellClassName: Optional styling for cells
 * @param {Array} data - Array of row data objects
 * @param {Boolean} striped - Enable striped rows
 * @param {Boolean} bordered - Add borders to table
 * @param {Boolean} hover - Enable hover effect on rows
 * @param {Boolean} responsive - Wrap table in responsive container
 * @param {String} size - Table size: 'sm' for small
 * @param {String} variant - Table variant: 'primary', 'secondary', etc.
 * @param {String} className - Additional CSS classes
 * @param {String} emptyMessage - Message to show when no data
 * @param {Function} onRowClick - Callback function when row is clicked (row, index) => void
 * 
 * @example
 * <Table
 *   columns={[
 *     { key: 'id', header: 'ID' },
 *     { key: 'name', header: 'Name' },
 *     { key: 'email', header: 'Email', render: (value) => <a href={`mailto:${value}`}>{value}</a> }
 *   ]}
 *   data={[
 *     { id: 1, name: 'John', email: 'john@example.com' },
 *     { id: 2, name: 'Jane', email: 'jane@example.com' }
 *   ]}
 *   hover
 *   striped
 *   onRowClick={(row) => console.log('Clicked:', row)}
 * />
 */
const Table = ({
  columns = [],
  data = [],
  striped = false,
  bordered = false,
  hover = false,
  responsive = true,
  size = '',
  variant = '',
  className = '',
  emptyMessage = 'No data available',
  onRowClick,
  ...props
}) => {
  const tableClasses = [
    className,
    size && `table-${size}`,
    variant && `table-${variant}`,
  ]
    .filter(Boolean)
    .join(' ');

  const TableComponent = responsive ? BootstrapTable : 'table';

  return (
    <div className={responsive ? 'table-responsive' : ''}>
      <BootstrapTable
        striped={striped}
        bordered={bordered}
        hover={hover}
        className={tableClasses}
        {...props}
      >
        {columns.length > 0 && (
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th
                  key={column.key || column.field || index}
                  style={column.headerStyle || {}}
                  className={column.headerClassName || ''}
                >
                  {column.header || column.label || column.title}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center text-muted py-4">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={row.id || rowIndex}
                onClick={onRowClick ? () => onRowClick(row, rowIndex) : undefined}
                style={{
                  cursor: onRowClick ? 'pointer' : 'default',
                  ...(row.rowStyle || {}),
                }}
                className={row.rowClassName || ''}
              >
                {columns.map((column, colIndex) => {
                  const cellValue = column.render
                    ? column.render(row[column.field || column.key], row, rowIndex)
                    : row[column.field || column.key];

                  return (
                    <td
                      key={column.key || column.field || colIndex}
                      style={column.cellStyle || {}}
                      className={column.cellClassName || ''}
                    >
                      {cellValue !== null && cellValue !== undefined ? cellValue : '-'}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </BootstrapTable>
    </div>
  );
};

export default Table;

