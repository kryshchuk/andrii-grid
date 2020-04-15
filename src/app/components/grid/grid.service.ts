import { Injectable } from '@angular/core';
import { GridColumn, FilterType } from '@models/grid/gridColumn';
import { get, set, split, dropRight, join, template } from 'lodash';
import { CurrencyPipe } from '@angular/common';
import { FileService } from '@services/file.service';
import { FileSizePipe } from '../../filters/file-size.pipe';
import { MinuteSecondsPipe } from '../../filters/minutes-seconds.pipe';

@Injectable({
  providedIn: 'root',
})
export class GridService {

  constructor(private fileService: FileService,
              private currencyPipe: CurrencyPipe,
              private sizeFilter: FileSizePipe,
              private durationFilter: MinuteSecondsPipe) {
  }

  setFieldValue({ item, col, value }) {
    if (col.field) {
      item[col.field] = value;
    }
    if (col.fieldPath) {
      set(item, col.fieldPath, value);
    }
  }

  getFieldValue(item, col: GridColumn) {
    if (!col.field && !col.fieldPath) {
      return '';
    }
    return col.field ? item[col.field] : get(item, col.fieldPath) !== undefined ? get(item, col.fieldPath) : '';
  }

  getDisplayFieldValue(item, col: GridColumn) {
    if (!col.displayField && !col.displayFieldPath) {
      return '';
    }
    return col.displayField ? item[col.displayField] : get(item, col.displayFieldPath) !== undefined ? get(item, col.displayFieldPath) : '';
  }

  getTooltip(item, col: GridColumn) {
    if (col.tooltip) {
      return col.tooltip;
    }
    if (col.tooltipField) {
      return item[col.tooltipField];
    }
    return col.tooltipPath ? get(item, col.tooltipPath) : '';
  }

  getTooltipTemplate(item, col: GridColumn): string {
    const tooltipFullPath = get(col, 'tooltipPath');
    if (!tooltipFullPath) {
      return '';
    }
    const tooltipTemplatePath = dropRight(split(tooltipFullPath, '.'));
    tooltipTemplatePath.push('tooltipTemplate');
    return get(item, tooltipTemplatePath, '');
  }

  sortItems(items, col, direction) {
    items.sort((a, b) => {
      let bValue = this.getFieldValue(b, col);
      let aValue = this.getFieldValue(a, col);
      bValue = typeof bValue === 'string' ? bValue.toLowerCase() : bValue;
      aValue = typeof aValue === 'string' ? aValue.toLowerCase() : aValue;
      return  bValue >  aValue ? direction : bValue < aValue ? -direction : 0;
    });
  }

  getExportValue(item, col: GridColumn) {
    const displayValue = this.getDisplayFieldValue(item, col);
    if (!displayValue) {
      const fieldValue = this.getFieldValue(item, col);
      switch (col.filterType) {
        case FilterType.Currency:
          return this.currencyPipe.transform(fieldValue);
        case FilterType.Percent:
          return `${fieldValue}%`;
        case FilterType.Size:
          return this.sizeFilter.transform(fieldValue, 2, false);
        case FilterType.Duration:
          return this.durationFilter.transform(fieldValue);
        default:
          return fieldValue;
      }
    }
    return displayValue;
  }

  exportToCSV(items: any[], cols: GridColumn[], name: string) {
    const formattedItems = this.getFormattedItemsToExport(items, cols);
    const csvData = `${name}\r\n${this.fileService.convertToCSV(formattedItems, cols.map(col => this.getFullColName(col)))}`;
    this.fileService.saveFile(csvData, `${name}.csv`);
  }

  private getFullColName(col: GridColumn): string {
    return col.name + (col.subname ? ` (${col.subname})` : '');
  }

  private getFormattedItemsToExport(items: any[], cols: GridColumn[]) {
    return items.map((item) => {
      return cols.reduce(
          (res, col) => {
            if (!col.hideOnExport) {
              res[this.getFullColName(col)] = `"${this.getExportValue(item, col)}"`;
            }
            return res;
          },
          {});
    });
  }
}
