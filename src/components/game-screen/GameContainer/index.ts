import { AbstractComponent } from "@/ts/abstract";
import { TetrisBlockTypes } from "@/ts/enums";
import type { IActiveBlockData, PlayfieldState } from "./types";

import { TIMER_NUMBERS_MATRICES } from "@/constants/timerNumbersMatrices";
import { BLOCK_MATRICES } from "@/constants/tetrisBlocksMatrices";

import { showFadeInAnimation } from "@/animations/showFadeInAnimation";
import { showScaleAnimation } from "@/animations/showScaleAnimation";
import { showBlinkAnimation } from "@/animations/showBlinkAnimation";
import { showOpacityAnimation } from "@/animations/showOpacityAnimation";

import { random } from "@/plugins/gsap";
import { isMobileBrowser } from "@/utils/checkMobileBrowser";
import { playAudio } from "@/utils/playAudio";

import gameThemeAudioUrl from "@/assets/sounds/game-theme.mp3";
import timerAudioUrl from "@/assets/sounds/timer.mp3";
import rowFilledAudioUrl from "@/assets/sounds/row-filled.mp3";
import dropBlockAudioUrl from "@/assets/sounds/drop-block.mp3";
import pauseAudioUrl from "@/assets/sounds/pause.mp3";

export class GameContainer extends AbstractComponent {
  private PLAYFIELD_SELECTOR = "#game-screen-playfield";
  private SCORE_SELECTOR = "#game-screen-score";
  private LEVEL_SELECTOR = "#game-screen-level";
  private LINES_SELECTOR = "#game-screen-lines";
  private NEXT_BLOCK_SELECTOR = "#game-screen-next";
  private MOBILE_PAUSE_BUTTON_SELECTOR = "#game-screen-mobile-pause-btn";
  private MOBILE_CONTROLS_SELECTOR = "#game-screen-mobile-controls";

  private playfieldElement: HTMLTableElement;
  private scoreElement: HTMLElement;
  private levelElement: HTMLElement;
  private linesElement: HTMLElement;
  private nextBlockElement: HTMLElement;
  private mobilePauseButtonElement: HTMLButtonElement;
  private mobileControlsElement: HTMLElement;

  private PLAYFIELD_WIDTH = 10;
  private PLAYFIELD_HEIGHT = 20;
  private INITIAL_BLOCK_MOVE_SPEED = 1000;

  private playfieldState: PlayfieldState;
  private activeBlockData: IActiveBlockData;

  private scoreValue = 0;
  private linesValue = 0;
  private levelValue = 1;
  private nextBlockTypeValue: TetrisBlockTypes;

  private moveActiveBlockDownInterval: ReturnType<typeof setInterval>;
  private moveActiveBlockListenerParams: IControlsListenerParams<"keydown" | "click">;
  private pauseListenerParams: IControlsListenerParams<"keydown" | "click">;
  private gameOverCallback: Function;
  private pauseCallback: Function;
  private gameThemeAudio: Howl;

  constructor() {
    super({ templateSelector: "#game-screen-game-container" });
  }

  private setGameElements() {
    this.playfieldElement = this.rootElement.querySelector<HTMLTableElement>(this.PLAYFIELD_SELECTOR)!;
    this.scoreElement = this.rootElement.querySelector<HTMLElement>(this.SCORE_SELECTOR)!;
    this.levelElement = this.rootElement.querySelector<HTMLElement>(this.LEVEL_SELECTOR)!;
    this.linesElement = this.rootElement.querySelector<HTMLElement>(this.LINES_SELECTOR)!;
    this.nextBlockElement = this.rootElement.querySelector<HTMLElement>(this.NEXT_BLOCK_SELECTOR)!;
    this.mobilePauseButtonElement = this.rootElement.querySelector<HTMLButtonElement>(
      this.MOBILE_PAUSE_BUTTON_SELECTOR
    )!;
    this.mobileControlsElement = this.rootElement.querySelector<HTMLElement>(this.MOBILE_CONTROLS_SELECTOR)!;
  }

  private async showInitialAnimations() {
    await showScaleAnimation(this.playfieldElement);
    await showFadeInAnimation(this.scoreElement);
    await showFadeInAnimation(this.levelElement);
    await showFadeInAnimation(this.linesElement);
    await showFadeInAnimation(this.nextBlockElement);

    if (isMobileBrowser) {
      await showFadeInAnimation(this.mobilePauseButtonElement);
      await showOpacityAnimation(this.mobileControlsElement, { reversed: true });
    }
  }

  private get score() {
    return this.scoreValue;
  }

  private set score(value) {
    this.scoreValue = value;
    this.scoreElement.style.cssText += `--value: '${value}'`;
  }

  private get lines() {
    return this.linesValue;
  }

  private set lines(value) {
    this.linesValue = value;
    this.linesElement.style.cssText += `--value: '${value}'`;
  }

  private get level() {
    return this.levelValue;
  }

  private set level(value) {
    this.levelValue = value;
    this.levelElement.style.cssText += `--value: '${value}'`;
  }

  private get nextBlockType() {
    return this.nextBlockTypeValue || this.getRandomBlockType();
  }

  private set nextBlockType(type: TetrisBlockTypes) {
    this.nextBlockTypeValue = type;
    this.renderNextBlockType();
  }

  private renderNextBlockType() {
    const matrix = BLOCK_MATRICES[this.nextBlockType];
    const table = this.nextBlockElement.querySelector("table")!;
    const tbody = table.tBodies[0];

    tbody.innerHTML = "";

    matrix.forEach((row) => {
      const tr = document.createElement("tr");

      row.forEach((cell) => {
        const td = document.createElement("td");

        if (cell) td.className = this.nextBlockType;
        tr.append(td);
      });

      tbody.append(tr);
    });
  }

  private resetPlayfieldState() {
    const playfieldRows = [];

    for (let i = 0; i < this.PLAYFIELD_HEIGHT; i++) {
      const row = new Array(this.PLAYFIELD_WIDTH).fill(null);
      playfieldRows.push(row);
    }

    this.playfieldState = playfieldRows;
  }

  private fillPlayfield() {
    const tbody = document.createElement("tbody");

    this.playfieldState.forEach((row) => {
      const tr = document.createElement("tr");

      row.forEach(() => {
        const td = document.createElement("td");
        tr.append(td);
      });

      tbody.append(tr);
    });

    this.playfieldElement.innerHTML = "";
    this.playfieldElement.append(tbody);
  }

  private renderPlayfieldState() {
    this.playfieldState.forEach((row, rowIndex) => {
      row.forEach((cell, cellIndex) => {
        if (cell) {
          this.playfieldElement.rows[rowIndex].cells[cellIndex].className = cell.type;
        } else {
          this.playfieldElement.rows[rowIndex].cells[cellIndex].className = "";
        }
      });
    });
  }

  private async startTimer() {
    return new Promise<any>((resolve) => {
      const firstSecond = Object.keys(TIMER_NUMBERS_MATRICES).length;
      let second = firstSecond;

      const interval = setInterval(() => {
        this.resetPlayfieldState();

        if (second === firstSecond) {
          playAudio(timerAudioUrl);
        }

        if (second === 0) {
          clearInterval(interval);
          this.renderPlayfieldState();
          return resolve(true);
        }

        const numberMatrix = TIMER_NUMBERS_MATRICES[second];
        const numberMatrixHeight = numberMatrix.length;
        const numberMatrixWidth = numberMatrix[0].length;

        const startRowIndex = Math.floor((this.PLAYFIELD_HEIGHT - numberMatrixHeight) / 2);
        const startColIndex = Math.floor((this.PLAYFIELD_WIDTH - numberMatrixWidth) / 2);

        numberMatrix.forEach((row, rowIndex) => {
          const currentRowIndex = startRowIndex + rowIndex;

          row.forEach((col, colIndex) => {
            const currentColIndex = startColIndex + colIndex;

            if (col) {
              this.playfieldState[currentRowIndex][currentColIndex] = {
                id: 0,
                type: TetrisBlockTypes.O,
              };
            }
          });
        });

        this.renderPlayfieldState();
        second--;
      }, 1000);
    });
  }

  private getRandomBlockType() {
    return random(Object.values(TetrisBlockTypes));
  }

  private createUniqBlockId(): number {
    const id = Math.round(Math.random() * 100000);
    const isExisting = this.playfieldState.some((row) => row.some((cell) => cell?.id === id));

    if (isExisting) return this.createUniqBlockId();
    return id;
  }

  private removeBlockFromPlayfieldState(blockId: number) {
    this.playfieldState.forEach((row, rowIndex) => {
      row.forEach((cell, cellIndex) => {
        if (!cell) return;
        if (cell.id === blockId) {
          this.playfieldState[rowIndex][cellIndex] = null;
        }
      });
    });
  }

  private rerenderActiveBlock() {
    this.removeBlockFromPlayfieldState(this.activeBlockData.id);

    this.activeBlockData.matrix.forEach((row, rowIndex) => {
      let currentRowIndex = this.activeBlockData.y + rowIndex;

      if (currentRowIndex < 0) return;

      row.forEach((cell, cellIndex) => {
        const playfieldRow = this.playfieldState[this.activeBlockData.y + rowIndex];

        if (cell && playfieldRow) {
          playfieldRow[this.activeBlockData.x + cellIndex] = {
            id: this.activeBlockData.id,
            type: this.activeBlockData.type,
          };
        }
      });
    });

    this.renderPlayfieldState();
  }

  private checkIsActiveBlockStuck() {
    const blockHeight = this.activeBlockData.matrix.length;
    const nextRowIndex = this.activeBlockData.y + blockHeight;
    const isAtTheBottom = nextRowIndex === this.PLAYFIELD_HEIGHT;

    if (isAtTheBottom) return true;

    const isOnAnotherBlock = this.activeBlockData.matrix.some((row, matrixRowIndex) =>
      row.some((cell, matrixCellIndex) => {
        if (!cell) return;

        const rowBelowIndex = this.activeBlockData.y + matrixRowIndex + 1;
        const cellBelowIndex = this.activeBlockData.x + matrixCellIndex;
        const cellBelow = this.playfieldState[rowBelowIndex]?.[cellBelowIndex];

        if (cellBelow && cellBelow.id !== this.activeBlockData.id) {
          return true;
        }
      })
    );

    return isOnAnotherBlock;
  }

  private addScoresForFilledRows(rowsCount: number) {
    switch (rowsCount) {
      case 1:
        this.score += 100;
        break;

      case 2:
        this.score += 300;
        break;

      case 3:
        this.score += 500;
        break;

      case 4:
        this.score += 800;
        break;
    }
  }

  private calculateNewLevelSpeed(level: number) {
    const FACTOR = 0.3;
    return 1000 / (1 + FACTOR * level);
  }

  private checkLevelUp() {
    const requiredLevel = Math.floor(this.lines / 10) + 1;
    const levelUp = requiredLevel > this.level;

    if (levelUp && requiredLevel <= 10) {
      const newSpeed = this.calculateNewLevelSpeed(requiredLevel);

      clearInterval(this.moveActiveBlockDownInterval);
      this.level = requiredLevel;
      this.setMoveActiveBlockDownInterval(newSpeed);
    }
  }

  private updateHighScore() {
    const highScore = localStorage.getItem("high-score");

    if (this.score > Number(highScore)) {
      localStorage.setItem("high-score", String(this.score));
    }
  }

  public onGameOver(callback: Function) {
    this.gameOverCallback = callback;
  }

  private async gameOver() {
    this.updateHighScore();
    localStorage.setItem("last-score", String(this.score));

    this.score = 0;
    this.lines = 0;
    this.level = 1;

    this.gameThemeAudio.stop();

    clearInterval(this.moveActiveBlockDownInterval);
    window.removeEventListener(
      this.moveActiveBlockListenerParams.eventName,
      this.moveActiveBlockListenerParams.handler
    );

    if (this.gameOverCallback) this.gameOverCallback();
  }

  private async removeFilledRows() {
    const filledRowsIndexes = this.playfieldState.reduce<number[]>((acc, row, rowIndex) => {
      const isFilled = row.every((cell) => cell);
      if (isFilled) acc.push(rowIndex);
      return acc;
    }, []);

    if (filledRowsIndexes.length === 0) return;

    playAudio(rowFilledAudioUrl);

    const animationsPromises = filledRowsIndexes.map((rowIndex) => {
      const tableRow = this.playfieldElement.rows[rowIndex];
      return [].map.call(tableRow.cells, (cell) => showBlinkAnimation(cell));
    });

    await Promise.all(animationsPromises.flat());

    filledRowsIndexes.forEach((rowIndex) => {
      this.playfieldState.splice(rowIndex, 1);
      const newRow = new Array(this.PLAYFIELD_WIDTH).fill(null);
      this.playfieldState.unshift(newRow);
    });

    this.renderPlayfieldState();
    this.addScoresForFilledRows(filledRowsIndexes.length);
    this.lines += filledRowsIndexes.length;
    this.checkLevelUp();
  }

  private async onBlockStuck() {
    if (this.activeBlockData.y < 0) {
      this.gameOver();
      return true;
    }

    this.updateActiveBlock();
    await this.removeFilledRows();
  }

  private async moveActiveBlockDown() {
    if (this.checkIsActiveBlockStuck()) {
      const isGameOver = await this.onBlockStuck();
      if (isGameOver) return;
    }

    this.removeBlockFromPlayfieldState(this.activeBlockData.id);
    this.activeBlockData.y++;
    this.rerenderActiveBlock();
  }

  private moveActiveBlockLeft() {
    if (this.activeBlockData.x === 0) return;

    const hasObstacle = this.activeBlockData.matrix.some((row, rowIndex) => {
      const firstCellIndex = row.findIndex((cell) => Boolean(cell));
      const nextColIndex = this.activeBlockData.x + firstCellIndex - 1;

      return this.playfieldState[this.activeBlockData.y + rowIndex]?.[nextColIndex];
    });

    if (hasObstacle) return;

    this.removeBlockFromPlayfieldState(this.activeBlockData.id);
    this.activeBlockData.x--;

    this.rerenderActiveBlock();
  }

  private moveActiveBlockRight() {
    const blockWidth = this.activeBlockData.matrix[0].length;
    const maxColIndex = this.PLAYFIELD_WIDTH - blockWidth;

    if (this.activeBlockData.x === maxColIndex) return;

    const hasObstacle = this.activeBlockData.matrix.some((row, rowIndex) => {
      const lastCellIndex = row.findLastIndex((cell) => Boolean(cell));
      const nextCellIndex = this.activeBlockData.x + lastCellIndex + 1;

      return this.playfieldState[this.activeBlockData.y + rowIndex]?.[nextCellIndex];
    });

    if (hasObstacle) return;

    this.activeBlockData.x++;
    this.rerenderActiveBlock();
  }

  private rotateActiveBlock() {
    const turnedMatrix = this.activeBlockData.matrix[0].map((_, cellIndex) => {
      return this.activeBlockData.matrix.map((row) => row[cellIndex]).reverse();
    });

    const turnedMatrixWidth = turnedMatrix[0].length;
    const blockOnBorder = this.activeBlockData.x + turnedMatrixWidth > this.PLAYFIELD_WIDTH;
    let turnedBlockX = this.activeBlockData.x;

    if (blockOnBorder) {
      turnedBlockX = this.PLAYFIELD_WIDTH - turnedMatrixWidth;
    }

    const isRequiredAreaOccupied = turnedMatrix.some((row, rowIndex) => {
      return row.some((_, cellIndex) => {
        const playfieldRowIndex = rowIndex + this.activeBlockData.y;

        if (playfieldRowIndex > this.PLAYFIELD_HEIGHT - 1) {
          return true;
        }

        const playfieldColIndex = cellIndex + turnedBlockX;
        const playfieldCell = this.playfieldState[playfieldRowIndex]?.[playfieldColIndex];

        return playfieldCell ? playfieldCell.id !== this.activeBlockData.id : false;
      });
    });

    if (isRequiredAreaOccupied) return;

    this.activeBlockData.x = turnedBlockX;
    this.activeBlockData.matrix = turnedMatrix;
    this.rerenderActiveBlock();
  }

  private dropActiveBlock() {
    let droppedTrough = 0;

    while (true) {
      if (this.checkIsActiveBlockStuck()) {
        this.onBlockStuck();
        break;
      }

      playAudio(dropBlockAudioUrl, { volume: 0.2 });
      this.moveActiveBlockDown();
      droppedTrough++;
    }

    this.score += droppedTrough;
  }

  private moveOnKeyDown({ code }: KeyboardEvent) {
    switch (code) {
      case "ArrowDown":
        this.moveActiveBlockDown();
        this.score++;
        break;

      case "ArrowLeft":
        this.moveActiveBlockLeft();
        break;

      case "ArrowRight":
        this.moveActiveBlockRight();
        break;

      case "ArrowUp":
        this.rotateActiveBlock();
        break;

      case "Space":
        this.dropActiveBlock();
        break;
    }
  }

  private moveOnControlsClick({ target }: MouseEvent) {
    const button = (target as HTMLElement).closest("button");

    if (!button) return;

    switch (button.id) {
      case "rotate-btn":
        this.rotateActiveBlock();
        break;

      case "left-btn":
        this.moveActiveBlockLeft();
        break;

      case "right-btn":
        this.moveActiveBlockRight();
        break;

      case "down-btn":
        this.dropActiveBlock();
        break;
    }
  }

  private updateActiveBlock() {
    const blockType = this.nextBlockType;
    const blockMatrix = BLOCK_MATRICES[blockType];
    const blockMatrixWidth = blockMatrix[0].length;
    const blockMatrixHeight = blockMatrix.length;

    const blockRowPosition = -blockMatrixHeight;
    const blockColPosition = Math.floor((this.PLAYFIELD_WIDTH - blockMatrixWidth) / 2);

    this.activeBlockData = {
      id: this.createUniqBlockId(),
      type: blockType,
      x: blockColPosition,
      y: blockRowPosition,
      matrix: structuredClone(blockMatrix),
    };

    this.nextBlockType = this.getRandomBlockType();
  }

  private setMoveActiveBlockDownInterval(interval: number = this.INITIAL_BLOCK_MOVE_SPEED) {
    this.moveActiveBlockDownInterval = setInterval(() => {
      this.moveActiveBlockDown();
    }, interval);
  }

  private initActiveBlockMovement() {
    this.setMoveActiveBlockDownInterval();

    if (isMobileBrowser) {
      this.moveActiveBlockListenerParams = {
        eventName: "click",
        handler: this.moveOnControlsClick.bind(this),
      } as IControlsListenerParams<"click">;
    } else {
      this.moveActiveBlockListenerParams = {
        eventName: "keydown",
        handler: this.moveOnKeyDown.bind(this),
      } as IControlsListenerParams<"keydown">;
    }

    window.addEventListener(this.moveActiveBlockListenerParams.eventName, this.moveActiveBlockListenerParams.handler);
  }

  private async hideContainer() {
    await showOpacityAnimation(this.rootElement);
  }

  private async showContainer() {
    await showOpacityAnimation(this.rootElement, { reversed: true });
  }

  public onPause(callback: Function) {
    this.pauseCallback = callback;
  }

  public async resume() {
    this.gameThemeAudio.play();

    await this.showContainer();
    this.initActiveBlockMovement();
    this.initPauseListener();
  }

  private async pause() {
    this.gameThemeAudio.pause();
    playAudio(pauseAudioUrl);

    window.clearInterval(this.moveActiveBlockDownInterval);
    window.removeEventListener(
      this.moveActiveBlockListenerParams.eventName,
      this.moveActiveBlockListenerParams.handler
    );
    window.removeEventListener(this.pauseListenerParams.eventName, this.pauseListenerParams.handler);

    await this.hideContainer();
    this.pauseCallback();
  }

  private async pauseOnEsc({ code }: KeyboardEvent) {
    if (code !== "Escape") return;
    await this.pause();
  }

  private async pauseOnBtnClick({ target }: MouseEvent) {
    const button = (target as HTMLButtonElement).closest(this.MOBILE_PAUSE_BUTTON_SELECTOR);
    if (!button) return;
    await this.pause();
  }

  private initPauseListener() {
    if (isMobileBrowser) {
      this.pauseListenerParams = {
        eventName: "click",
        handler: this.pauseOnBtnClick.bind(this),
      } as IControlsListenerParams<"click">;
    } else {
      this.pauseListenerParams = {
        eventName: "keydown",
        handler: this.pauseOnEsc.bind(this),
      } as IControlsListenerParams<"keydown">;
    }

    window.addEventListener(this.pauseListenerParams.eventName, this.pauseListenerParams.handler);
  }

  private start() {
    this.updateActiveBlock();
    this.initActiveBlockMovement();
  }

  protected async afterRender() {
    this.resetPlayfieldState();
    this.setGameElements();
    this.fillPlayfield();

    this.gameThemeAudio = await playAudio(gameThemeAudioUrl, { loop: true });
    await this.showInitialAnimations();
    await this.startTimer();
    this.start();
    this.initPauseListener();
  }
}
