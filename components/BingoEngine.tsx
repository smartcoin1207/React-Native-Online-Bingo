import _ from "lodash";

type BingoCellValues = Array<Array<any>>;
type RenderRowFunction = (rowNum: any, columns: Array<any>) => any;
type RenderColumnFunction = (rowNum: any, columnNum: any) => any;

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
        [0, 0, 1, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0]
    ];

const createBingoCard = (bingoCellValues: BingoCellValues, renderRow: RenderRowFunction, renderColumn: RenderColumnFunction): any[] => {
    const rowsCount: number = bingoCellValues.length;
    const columnsCount: number = bingoCellValues[0].length;
    const rows: any[] = [];
    for (let rowNum = 0; rowNum < rowsCount; rowNum ++) {
        const columns: any[] = [];

        for (let columnNum = 0; columnNum < columnsCount; columnNum ++) {
            columns.push(renderColumn(rowNum, columnNum));
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
  
    for (let rowNum = 1; rowNum < 6; rowNum++) {
        const row: any[] = [];
        let aRandomNumber: number = 0;
    
        for (let columnNum = 0; columnNum < 5; columnNum++) {
            while (columns[columnNum].length < rowNum) {
                aRandomNumber = _.random(rules[columnNum][0], rules[columnNum][1]);
                if (columns[columnNum].indexOf(aRandomNumber) === -1) {
                    row.push(aRandomNumber);
                    columns[columnNum].push(aRandomNumber);
                }
            }
        }
        cellValues.push(row);
    }
    cellValues[2][2] = "💎";
  
    return cellValues;
};


const bingoCheck = (cellValues: BingoCellValues, cellStatus: number[][], rowNum: number, columnNum: number): boolean => {
    const rowCount: number = cellValues.length;
    let completed = false;
    if(cellStatus[rowNum]) {
        if (cellStatus[rowNum].indexOf(0) === -1) {
            completed = true;
        }
    }
    

    let verticalCount: number = 0;
    for (let row = 0; row < rowCount; row++) {
      if (cellStatus[row][columnNum] === 1) verticalCount++;
    }

    if (verticalCount === cellValues[rowNum].length) {
        completed = true;
    } 

    let diagonalUpDownCounter: number = 0;
    let diagonalDownUpCounter: number = 0;
    let columnUpDown: number = 0;

    for (let row = 0; row < rowCount; row++) {
        if (cellStatus[row][columnUpDown] === 1) diagonalUpDownCounter++;
        if (cellStatus[rowCount - (row+1)][columnUpDown] === 1) diagonalDownUpCounter++;
        columnUpDown++;
    }

    if ((diagonalUpDownCounter === rowCount) || (diagonalDownUpCounter === rowCount)) {
        completed = true;
    } 
    return completed;
};

export { createBingoCard, bingoCellValues, bingoCellStatusInit, bingoCheck };