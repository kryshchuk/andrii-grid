import { Component, OnInit, Input, OnChanges, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { map as _map, reduce, fill, isNaN } from 'lodash';
import { startWith, map, distinctUntilChanged } from 'rxjs/operators';
import { Subscription } from 'rxjs';

const mockData = [
  [1, 2, 3, 4, 5, 6],
  [7, 8, 9, 10, 11, 12],
  [13, 14, 15, 16, 17, 18, 99, 1],
];


@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss'],
})
export class GridComponent implements OnInit, OnDestroy {
  @Input() items = mockData;
  maxDataLength = 0;
  columns = [];

  gridForm: FormGroup;
  footerData: number[] = [];
  changeSub: Subscription;
  calculationSub: Subscription;
  calculation: string;


  constructor(
    ) { }

  ngOnInit() {
    this.initForm(this.items); //
  }

  valueChangesSub() {
    this.unsubscribe();
    this.changeSub = this.gridForm.valueChanges.pipe(
      startWith({
        gridRows: this.gridForm.value.gridRows
      }),
      distinctUntilChanged(),
      map(data => {
      if (!this.calculationSub) {
        this.typeOfCalculation();
      }
      this.calculateData(data.gridRows);
      this.getMaxDataItems(data.gridRows);
      return data;
    }))
    .subscribe(
      items => {
        // console.log('Form items: ', items);
      }
    );
  }

  unsubscribe() {
    if (this.changeSub) {
      this.changeSub.unsubscribe();
    }
    if (this.calculationSub ) {
      this.calculationSub .unsubscribe();
    }
  }

  addColumn(position = 0) {
    for (const control of (this.gridForm.get('gridRows') as FormArray).controls) {
      (control as FormArray).insert(position + 1, new FormControl(0, Validators.required));
    }
    this.initColumns();
  }

  removeColumn(position = 0) {
    for (const control of (this.gridForm.get('gridRows') as FormArray).controls) {
      (control as FormArray).removeAt(position);
    }
    this.initColumns();
  }

  addRow(position = 0) {
    const newRow = fill(new Array(this.maxDataLength), 0, 0, this.maxDataLength);
    const row = new FormArray([]);
    for (const col of newRow) {
        row.push(new FormControl(col, Validators.required));
      }
    (this.gridForm.get('gridRows') as FormArray).insert(position + 1, row);
  }

  removeRow(position = 0) {
    (this.gridForm.get('gridRows') as FormArray).removeAt(position);
  }

  ngOnDestroy() {
    this.unsubscribe();
  }

  typeOfCalculation() {
    this.calculationSub = this.gridForm.get('calculation').valueChanges.pipe(
      startWith('sum'),
      distinctUntilChanged()
    ).subscribe(
      value => {
        this.calculation = value;
        this.calculateData(this.gridForm.value.gridRows);
      }
    );
  }

  private getMaxDataItems(items) {
    this.maxDataLength = reduce(items, (result, value, key) => {
      return result > value.length ? result : value.length;
    });
  }

  private initColumns() {
    this.columns = [];
    for (let index = 0; index < this.maxDataLength; index++) {
      this.columns.push({ name: 'Number'});
    }
  }

  private initForm(items) {
    this.getMaxDataItems(items);
    this.initColumns();

    const normalizeInputData = _map(items, (arrData) => {
      if (arrData.length < this.maxDataLength) {
        const addElements = this.maxDataLength - arrData.length;
        for (let index = 0; index < addElements; index++) {
          arrData.push(0);
        }
      }
      return arrData;
    });

    const gridRows = new FormArray([]);

    for (const rows of normalizeInputData) {
      const row = new FormArray([]);
      for (const col of rows) {
        row.push(new FormControl(col, Validators.required));
      }
      gridRows.push(row);
    }

    this.gridForm = new FormGroup({gridRows, calculation: new FormControl('sum')});
    this.valueChangesSub();
  }

  calculateData(formData: number[][]) {
    this.footerData = [];
    for (let index = 0; index < this.maxDataLength; index++) {
      let calculationResult = this.calculation === 'sum' ? 0 : 1;
      for (const row of formData) {
        switch (this.calculation) {
          case 'sum':
            calculationResult = calculationResult + row[index];
            break;
          case 'mult':
            calculationResult = calculationResult * row[index];
            break;

          default:
            break;
        }
      }
      if (!isNaN(calculationResult)) {
        this.footerData.push(calculationResult);
      }
    }
  }
}
