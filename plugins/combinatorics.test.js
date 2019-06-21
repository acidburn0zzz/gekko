const Combinatorics = require('./combinatorics');

let spec = {
  "watch": {
    "exchange": {"_values": ["binance", "poloneix"]},
    "currency": {"_values": ["USDT"]},
    "asset": "BTC"
  },
  "MACD": {
    "short": {"_values": [8, 9, 10]},
    "long": 21,
    "signal": 9,
    "thresholds": {
      "down": -0.025,
      "up": 0.025,
      "persistence": 1
    }
  },
  "paperTrader": {
    "feeMaker": 0.25,
    "feeTaker": 0.25,
    "feeUsing": "maker",
    "slippage": 0.05,
    "simulationBalance": {
      "asset": 1,
      "currency": 100
    },
    "reportRoundtrips": true,
    "enabled": true
  },
  "tradingAdvisor": {
    "enabled": true,
    "method": "MACD",
    "candleSize": 60,
    "historySize": 10
  },
  "backtest": {
    "daterange": {
      "from": "2019-06-12T21:33:00Z",
      "to": "2019-06-13T21:30:00Z"
    }
  },
  "backtestResultExporter": {
    "enabled": true,
    "writeToDisk": false,
    "data": {
      "stratUpdates": false,
      "roundtrips": true,
      "stratCandles": true,
      "stratCandleProps": [
        "open"
      ],
      "trades": true
    }
  },
  "performanceAnalyzer": {
    "riskFreeReturn": 2,
    "enabled": true
  },
  "valid": true
};

let results = Combinatorics.map(spec);
console.info(results.length);


let results2 = Combinatorics.map({
  test: "test"
});
console.info(results2.length);
