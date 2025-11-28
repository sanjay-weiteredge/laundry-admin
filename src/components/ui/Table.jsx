import React from 'react';
import { Table as BootstrapTable } from 'react-bootstrap';
import '../../styles/components/ui.css';

/**
 * 
 * @param {Array} columns 
 * @param {Array} data 
 * @param {Boolean} striped 
 * @param {Boolean} bordered 
 * @param {Boolean} hover 
 * @param {Boolean} responsive 
 * @param {String} size 
 * @param {String} variant 
 * @param {String} className 
 * @param {String} emptyMessage 
 * @param {Function} onRowClick 
 * 
 * @example
 
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
    'table-compact',
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

