import _ from "lodash";
import { BingoCheck } from "../utils/Types";

type BingoCellValues = Array<Array<any>>;
type RenderRowFunction = (rowNum: any, columns: Array<any>) => any;
type RenderColumnFunction = (rowNum: any, columnNum: any, isModal: boolean) => any;

const usaRules = (): number[][] => [
        [1, 15],
        [16, 30],
        [31, 45],
        [46, 60],
        [61, 75]
    ];

const bingoCellStatusInit = (): number[][] =>
    [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0]
    ];

const createBingoCard = (bingoCellValues: BingoCellValues, renderRow: RenderRowFunction, renderColumn: RenderColumnFunction, isModal: boolean): any[] => {
    const rowsCount: number = bingoCellValues.length;
    const columnsCount: number = bingoCellValues[0].length;
    const rows: any[] = [];
    for (let rowNum = 0; rowNum < rowsCount; rowNum ++) {
        const columns: any[] = [];

        for (let columnNum = 0; columnNum < columnsCount; columnNum ++) {
            columns.push(renderColumn(rowNum, columnNum, isModal));
        }
        rows.push(renderRow(rowNum, columns));
    }

    
    return rows;
};

const bingoCellValues = (): BingoCellValues => bingoCellValuesUS();

const bingoCellValuesUS = (): BingoCellValues => {
    const cellValues: BingoCellValues = [];
    const rules: number[][] = usaRules();
    const columns: number[][] = [[], [], [], [], []];
    let temp = [];

    const numberArray = Array.from({ length: 25 }, (_, index) => index + 1);

    // Function to generate random number for sorting
    const randomSort = () => Math.random() - 0.5;

    // Randomly sort the number array
    const randomlySortedArray = numberArray.sort(randomSort);
    console.log(randomlySortedArray)
  
    for (let rowNum = 1; rowNum < 6; rowNum++) {
        const row: any[] = [];
        let aRandomNumber: number = 0;
    
        for (let columnNum = 0; columnNum < 5; columnNum++) {
            while (columns[columnNum].length < rowNum) {
                aRandomNumber = randomlySortedArray[(rowNum-1)*5 + columnNum];
                    if (columns[columnNum].indexOf(aRandomNumber) === -1) {
                    row.push(aRandomNumber);
                    columns[columnNum].push(aRandomNumber);
                }
            }
        }
        cellValues.push(row);
    }
    // cellValues[2][2] = "💎";
  
    return cellValues;
};

const bingoCheck = (cellValues: BingoCellValues, cellStatus: number[][], rowNum: number, columnNum: number): BingoCheck => {
    const rowCount: number = cellValues.length;
    let completed = false;
    let newCellStatus: number[][] = cellStatus.map(row => [...row]);
    if(cellStatus[rowNum]) {
        if (cellStatus[rowNum].indexOf(0) === -1) {
            completed = true;
            newCellStatus[rowNum] = [2, 2, 2, 2, 2];
        }
    }
    
    let verticalCount: number = 0;
    for (let row = 0; row < rowCount; row++) {
      if (cellStatus[row][columnNum] === 1) verticalCount++;
    }

    if (verticalCount === rowCount) {
        completed = true;
        for (let row1 = 0; row1 < rowCount; row1++) {
            newCellStatus[row1][columnNum] = 2;
        }
    }

    let diagonalUpDownCounter: number = 0;
    let diagonalDownUpCounter: number = 0;
    let columnUpDown: number = 0;

    for (let row = 0; row < rowCount; row++) {
        if (cellStatus[row][columnUpDown] === 1) diagonalUpDownCounter++;
        if (cellStatus[rowCount - (row+1)][columnUpDown] === 1) diagonalDownUpCounter++;
        columnUpDown++;
    }

    if(diagonalUpDownCounter === rowCount) {
        completed = true;
        for (let index = 0; index < rowCount; index++) {
            newCellStatus[index][index] = 2;
        }
    }

    if(diagonalDownUpCounter === rowCount) {
        completed = true;
        for (let index = 0; index < rowCount; index++) {
            newCellStatus[rowCount-(index+1)][index] = 2;
        }
    }

    return {isCompleted: completed, newCellStatus: newCellStatus};
};

export { createBingoCard, bingoCellValues, bingoCellStatusInit, bingoCheck };