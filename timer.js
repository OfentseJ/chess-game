const ChessTimer = {
  STARTING_TIME: 600,
  whiteTime: 600,
  blackTime: 600,
  timerInterval: null,

  reset() {
    this.stop();
    this.whiteTime = this.STARTING_TIME;
    this.blackTime = this.STARTING_TIME;
    this.updateUI("white");
  },

  formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  },

  updateUI(activeTurn) {
    const wTimer = document.getElementById("white-timer");
    const bTimer = document.getElementById("black-timer");

    if (wTimer) wTimer.textContent = this.formatTime(this.whiteTime);
    if (bTimer) bTimer.textContent = this.formatTime(this.blackTime);

    if (activeTurn === "white") {
      if (wTimer) wTimer.classList.add("active-timer");
      if (bTimer) bTimer.classList.remove("active-timer");
    } else {
      if (bTimer) bTimer.classList.add("active-timer");
      if (wTimer) wTimer.classList.remove("active-timer");
    }
  },

  start(activeTurn, onTimeoutCallback) {
    this.stop();

    this.timerInterval = setInterval(() => {
      if (activeTurn === "white") {
        this.whiteTime--;
        if (this.whiteTime <= 0) {
          this.stop();
          onTimeoutCallback("white");
        }
      } else {
        this.blackTime--;
        if (this.blackTime <= 0) {
          this.stop();
          onTimeoutCallback("black");
        }
      }
      this.updateUI(activeTurn);
    }, 1000);
  },

  stop() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  },

  setState(wTimer, bTimer, activeTurn) {
    this.whiteTime = wTimer;
    this.blackTime = bTimer;
    this.updateUI(activeTurn);
  },
};
