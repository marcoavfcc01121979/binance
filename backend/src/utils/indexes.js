const technicalindicators = require("technicalindicators");

const indexKeys = {
  INSIDE_CANDLE: "INSIDE-CANDLE",
  ABANDONED_BABY: "ABANDONED-BABY",
  BEARISH_ENGULFING: "BEAR-ENGULF",
  BULLISH_ENGULFING: "BULL-ENGULF",
  DARK_CLOUD_COVER: "DARK-CLOUD-COVER",
  DOWNSIDE_TASUKI_GAP: "DOWNSIDE-TASUKI-GAP",
  DOJI: "DOJI",
  DRAGONFLY_DOJI: "DRAGONFLY-DOJI",
  GRAVESTONE_DOJI: "GRAVESTONE-DOJI",
  BEARISH_HARAMI: "BEAR-HARAMI",
  BULLISH_HARAMI: "BULL-HARAMI",
  BEARISH_HARAMI_CROSS: "BEAR-HARAMIX",
  BULLISH_HARAMI_CROSS: "BULL-HARAMIX",
  BULLISH_MARUBOZU: "BULL-MARUBOZU",
  BEARISH_MARUBOZU: "BEAR-MARUBOZU",
  EVENING_DOJI_STAR: "EVENING-DOJI-STAR",
  EVENING_STAR: "EVENINGSTAR",
  PIERCING_LINE: "PIERCING-LINE",
  BULLISH_SPINNING_TOP: "BULL-SPINTOP",
  BEARISH_SPINNING_TOP: "BEAR-SPINTOP",
  MORNING_DOJI_STAR: "MORNING-DOJI-STAR",
  MORNING_STAR: "MORNING-STAR",
  _3BLACK_CROWS: "3BLACK-CROWS",
  _3WHITE_SOLDIERS: "3WHITE-SOLDIERS",
  BULLISH_HAMMER: "BULLHAMMER",
  BEARISH_HAMMER: "BEARHAMMER",
  BULLISH_INVERTED_HAMMER: "BULL-INVERT-HAMMER",
  BEARISH_INVERTED_HAMMER: "BEAR-INVERT-HAMMER",
  HAMMER: "HAMMER",
  HAMMER_UNCONFIRMED: "HAMMER-UNCONF",
  HANGING_MAN: "HANGMAN",
  HANGING_MAN_UNCONFIRMED: "HANGMAN-UNCONF",
  SHOOTING_STAR: "SHOOTSTAR",
  SHOOTING_STAR_UNCONFIRMED: "SHOOTSTAR-UNCONF",
  TWEEZER_TOP: "TWEEZER-TOP",
  TWEEZER_BOTTOM: "TWEEZER-BOTTOM",
  //TECHNICAL INDICATORS
  RSI: "RSI",
  MACD: "MACD",
  SMA: "SMA",
  EMA: "EMA",
  STOCH_RSI: "S-RSI",
  BOLLINGER_BANDS: "BB",
  ADL: "ADL",
  ADX: "ADX",
  ATR: "ATR",
  AWESOME_OSCILLATOR: "AO",
  CCI: "CCI",
  FORCE_INDEX: "FI",
  KST: "KST",
  MFI: "MFI",
  OBV: "OBV",
  PSAR: "PSAR",
  ROC: "ROC",
  STOCH: "STOCH",
  TRIX: "TRIX",
  TYPICAL_PRICE: "TYPICAL",
  VWAP: "VWAP",
  VOLUME_PROFILE: "VP",
  WMA: "WMA",
  WEMA: "WEMA",
  WILLIAMS_R: "WILLIAMS-R",
  ICHIMOKU: "ICHIMOKU",
  //BEHOLDER INDICATORS
  MINI_TICKER: "MINI_TICKER",
  BOOK: "BOOK",
  WALLET: "WALLET",
  LAST_ORDER: "LAST_ORDER",
  LAST_CANDLE: "LAST_CANDLE",
  PREVIOUS_CANDLE: "PREVIOUS_CANDLE",
  TICKER: "TICKER",
};

function getAnalysisIndexes() {
  return {
    [indexKeys.RSI]: { params: "period", name: "RSI" },
    [indexKeys.MACD]: { params: "fast,slow,signal", name: "MACD" },
    [indexKeys.SMA]: { params: "period", name: "SMA" },
    [indexKeys.EMA]: { params: "period", name: "EMA" },
    [indexKeys.STOCH_RSI]: { params: "d,k,rsi,stoch", name: "Stochastic RSI" },
    [indexKeys.BOLLINGER_BANDS]: {
      params: "period,stdDev",
      name: "Bollinger Bands (BB)",
    },
    [indexKeys.ADL]: { params: "none", name: "ADL" },
    [indexKeys.ADX]: { params: "period", name: "ADX" },
    [indexKeys.ATR]: { params: "period", name: "ATR" },
    [indexKeys.AWESOME_OSCILLATOR]: {
      params: "fast,slow",
      name: "Awesome Oscillator",
    },
    [indexKeys.CCI]: { params: "period", name: "CCI" },
    [indexKeys.FORCE_INDEX]: { params: "period", name: "Force Index" },
    [indexKeys.KST]: {
      params: "roc1,roc2,roc3,roc4,smaroc1,smaroc2,smaroc3,smaroc4,signal",
      name: "KST",
    },
    [indexKeys.MFI]: { params: "period", name: "MFI" },
    [indexKeys.OBV]: { params: "none", name: "OBV" },
    [indexKeys.PSAR]: { params: "step,max", name: "PSAR" },
    [indexKeys.ROC]: { params: "period", name: "ROC" },
    [indexKeys.STOCH]: { params: "period,signal", name: "Stochastic" },
    [indexKeys.TRIX]: { params: "period", name: "TRIX" },
    [indexKeys.TYPICAL_PRICE]: { params: "none", name: "Typical Price" },
    [indexKeys.VWAP]: { params: "none", name: "VWAP" },
    [indexKeys.VOLUME_PROFILE]: { params: "bars", name: "Volume Profile" },
    [indexKeys.WMA]: { params: "period", name: "WMA" },
    [indexKeys.WEMA]: { params: "period", name: "WEMA" },
    [indexKeys.WILLIAMS_R]: { params: "period", name: "Williams R" },
    [indexKeys.ICHIMOKU]: {
      params: "conversion,base,span,displacement",
      name: "Ichimoku",
    },
    [indexKeys.ABANDONED_BABY]: { params: "none", name: "Abandoned Baby" },
    [indexKeys.BEARISH_ENGULFING]: {
      params: "none",
      name: "Bearish Engulfing",
    },
    [indexKeys.BULLISH_ENGULFING]: {
      params: "none",
      name: "Bullish Engulfing",
    },
    [indexKeys.DARK_CLOUD_COVER]: { params: "none", name: "Dark Cloud Cover" },
    [indexKeys.DOWNSIDE_TASUKI_GAP]: {
      params: "none",
      name: "Downside Tasuki Gap",
    },
    [indexKeys.DOJI]: { params: "none", name: "Doji" },
    [indexKeys.DRAGONFLY_DOJI]: { params: "none", name: "DragonFly Doji" },
    [indexKeys.GRAVESTONE_DOJI]: { params: "none", name: "GraveStone Doji" },
    [indexKeys.BEARISH_HARAMI]: { params: "none", name: "Bearish Harami" },
    [indexKeys.BEARISH_HARAMI_CROSS]: {
      params: "none",
      name: "Bearish Harami Cross (X)",
    },
    [indexKeys.BULLISH_HARAMI]: { params: "none", name: "Bullish Harami" },
    [indexKeys.BULLISH_HARAMI_CROSS]: {
      params: "none",
      name: "Bullish Harami Cross (X)",
    },
    [indexKeys.BULLISH_MARUBOZU]: { params: "none", name: "Bullish Marubozu" },
    [indexKeys.BEARISH_MARUBOZU]: { params: "none", name: "Bearish Marubozu" },
    [indexKeys.EVENING_DOJI_STAR]: {
      params: "none",
      name: "Evening Doji Star",
    },
    [indexKeys.EVENING_STAR]: { params: "none", name: "Evening Star" },
    [indexKeys.PIERCING_LINE]: { params: "none", name: "Piercing Line" },
    [indexKeys.BULLISH_SPINNING_TOP]: {
      params: "none",
      name: "Bullish Spinning Top",
    },
    [indexKeys.BEARISH_SPINNING_TOP]: {
      params: "none",
      name: "Bearish Spinning Top",
    },
    [indexKeys.MORNING_DOJI_STAR]: {
      params: "none",
      name: "Morning Doji Star",
    },
    [indexKeys.MORNING_STAR]: { params: "none", name: "Morning Star" },
    [indexKeys._3BLACK_CROWS]: { params: "none", name: "3 Black Crows" },
    [indexKeys._3WHITE_SOLDIERS]: { params: "none", name: "3 White Soldiers" },
    [indexKeys.BULLISH_HAMMER]: { params: "none", name: "Bullish Hammer" },
    [indexKeys.BEARISH_HAMMER]: { params: "none", name: "Bearish Hammer" },
    [indexKeys.BULLISH_INVERTED_HAMMER]: {
      params: "none",
      name: "Bullish Inverted Hammer",
    },
    [indexKeys.BEARISH_INVERTED_HAMMER]: {
      params: "none",
      name: "Bearish Inverted Hammer",
    },
    [indexKeys.HAMMER]: { params: "none", name: "Hammer" },
    [indexKeys.HAMMER_UNCONFIRMED]: {
      params: "none",
      name: "Hammer (Unconf.)",
    },
    [indexKeys.HANGING_MAN]: { params: "none", name: "Hanging Man" },
    [indexKeys.HANGING_MAN_UNCONFIRMED]: {
      params: "none",
      name: "Haning Man (Unconf.)",
    },
    [indexKeys.SHOOTING_STAR]: { params: "none", name: "Shooting Star" },
    [indexKeys.SHOOTING_STAR_UNCONFIRMED]: {
      params: "none",
      name: "Shooting Star (Unconf.)",
    },
    [indexKeys.TWEEZER_TOP]: { params: "none", name: "Tweezer Top" },
    [indexKeys.TWEEZER_BOTTOM]: { params: "none", name: "Tweezer Bottom" },
    [indexKeys.INSIDE_CANDLE]: { params: "bars", name: "Inside Candle" },
  };
}

function RSI(closes, period = 14) {
  period = parseInt(period);
  if (closes.length <= period) return { current: false, previous: false };

  const rsiResult = technicalindicators.rsi({
    period,
    values: closes,
  });
  return {
    current: parseFloat(rsiResult[rsiResult.length - 1]),
    previous: parseFloat(rsiResult[rsiResult.length - 2]),
  };
}

function MACD(closes, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
  fastPeriod = parseInt(fastPeriod);
  slowPeriod = parseInt(slowPeriod);
  signalPeriod = parseInt(signalPeriod);

  if ([fastPeriod, slowPeriod, signalPeriod].some((p) => p >= closes.length))
    return { current: false, previous: false };

  const macdResult = technicalindicators.macd({
    values: closes,
    SimpleMAOscillator: false,
    SimpleMASignal: false,
    fastPeriod,
    slowPeriod,
    signalPeriod,
  });
  return {
    current: macdResult[macdResult.length - 1],
    previous: macdResult[macdResult.length - 2],
  };
}

function StochRSI(
  closes,
  dPeriod = 3,
  kPeriod = 3,
  rsiPeriod = 14,
  stochasticPeriod = 14
) {
  dPeriod = parseInt(dPeriod);
  kPeriod = parseInt(kPeriod);
  rsiPeriod = parseInt(rsiPeriod);
  stochasticPeriod = parseInt(stochasticPeriod);

  if (
    [dPeriod, kPeriod, rsiPeriod, stochasticPeriod].some(
      (p) => p >= closes.length
    )
  )
    return { current: false, previous: false };

  const stochResult = technicalindicators.stochasticrsi({
    dPeriod,
    kPeriod,
    rsiPeriod,
    stochasticPeriod,
    values: closes,
  });
  return {
    current: stochResult[stochResult.length - 1],
    previous: stochResult[stochResult.length - 2],
  };
}

function bollingerBands(closes, period = 20, stdDev = 2) {
  period = parseInt(period);
  if (closes.length <= period) return { current: false, previous: false };

  const bbResult = technicalindicators.bollingerbands({
    period,
    stdDev: parseInt(stdDev),
    values: closes,
  });
  return {
    current: bbResult[bbResult.length - 1],
    previous: bbResult[bbResult.length - 2],
  };
}

function execCalc(indexName, ohlc, ...params) {
  switch (indexName) {
    case indexKeys.INSIDE_CANDLE:
      return insideCandle(ohlc, ...params);
    case indexKeys.ABANDONED_BABY:
      return abandonedBaby(ohlc);
    case indexKeys.ADL:
      return ADL(ohlc);
    case indexKeys.ADX:
      return ADX(ohlc, ...params);
    case indexKeys.ATR:
      return ATR(ohlc, ...params);
    case indexKeys.AWESOME_OSCILLATOR:
      return AO(ohlc, ...params);
    case indexKeys.BEARISH_ENGULFING:
      return bearishEngulfing(ohlc);
    case indexKeys.BEARISH_HARAMI:
      return bearishHarami(ohlc);
    case indexKeys.BULLISH_HARAMI:
      return bullishHarami(ohlc);
    case indexKeys.BEARISH_HARAMI_CROSS:
      return bearishHaramiCross(ohlc);
    case indexKeys.BULLISH_HARAMI_CROSS:
      return bullishHaramiCross(ohlc);
    case indexKeys.BULLISH_MARUBOZU:
      return bullishMarubozu(ohlc);
    case indexKeys.BEARISH_MARUBOZU:
      return bearishMarubozu(ohlc);
    case indexKeys.EVENING_DOJI_STAR:
      return eveningDojiStar(ohlc);
    case indexKeys.EVENING_STAR:
      return eveningStar(ohlc);
    case indexKeys.PIERCING_LINE:
      return piercingLine(ohlc);
    case indexKeys.BULLISH_SPINNING_TOP:
      return bullishSpinningTop(ohlc);
    case indexKeys.BEARISH_SPINNING_TOP:
      return bearishSpinningTop(ohlc);
    case indexKeys.MORNING_DOJI_STAR:
      return morningDojiStar(ohlc);
    case indexKeys.MORNING_STAR:
      return morningStar(ohlc);
    case indexKeys._3BLACK_CROWS:
      return threeBlackCrows(ohlc);
    case indexKeys._3WHITE_SOLDIERS:
      return threeWhiteSoldiers(ohlc);
    case indexKeys.BULLISH_HAMMER:
      return bullishHammer(ohlc);
    case indexKeys.BEARISH_HAMMER:
      return bearishHammer(ohlc);
    case indexKeys.BULLISH_INVERTED_HAMMER:
      return bullishInvertedHammer(ohlc);
    case indexKeys.BEARISH_INVERTED_HAMMER:
      return bearishInvertedHammer(ohlc);
    case indexKeys.HAMMER:
      return hammer(ohlc);
    case indexKeys.HAMMER_UNCONFIRMED:
      return hammerUnconfirmed(ohlc);
    case indexKeys.HANGING_MAN:
      return hangingMan(ohlc);
    case indexKeys.HANGING_MAN_UNCONFIRMED:
      return hangingManUnconfirmed(ohlc);
    case indexKeys.SHOOTING_STAR:
      return shootingStar(ohlc);
    case indexKeys.SHOOTING_STAR_UNCONFIRMED:
      return shootingStarUnconfirmed(ohlc);
    case indexKeys.TWEEZER_TOP:
      return tweezerTop(ohlc);
    case indexKeys.TWEEZER_BOTTOM:
      return tweezerBottom(ohlc);
    case indexKeys.BOLLINGER_BANDS:
      return bollingerBands(ohlc.close, ...params);
    case indexKeys.BULLISH_ENGULFING:
      return bullishEngulfing(ohlc);
    case indexKeys.CCI:
      return CCI(ohlc, ...params);
    case indexKeys.DARK_CLOUD_COVER:
      return darkCloudCover(ohlc);
    case indexKeys.DOJI:
      return doji(ohlc);
    case indexKeys.DOWNSIDE_TASUKI_GAP:
      return downsideTasukiGap(ohlc);
    case indexKeys.DRAGONFLY_DOJI:
      return dragonflyDoji(ohlc);
    case indexKeys.EMA:
      return EMA(ohlc.close, ...params);
    case indexKeys.FORCE_INDEX:
      return FI(ohlc, ...params);
    case indexKeys.GRAVESTONE_DOJI:
      return graveStoneDoji(ohlc);
    case indexKeys.ICHIMOKU:
      return ichimoku(ohlc, ...params);
    case indexKeys.KST:
      return KST(ohlc.close, ...params);
    case indexKeys.MACD:
      return MACD(ohlc.close, ...params);
    case indexKeys.MFI:
      return MFI(ohlc, ...params);
    case indexKeys.OBV:
      return OBV(ohlc);
    case indexKeys.PSAR:
      return PSAR(ohlc, ...params);
    case indexKeys.ROC:
      return ROC(ohlc.close, ...params);
    case indexKeys.RSI:
      return RSI(ohlc.close, ...params);
    case indexKeys.SMA:
      return SMA(ohlc.close, ...params);
    case indexKeys.STOCH:
      return Stochastic(ohlc, ...params);
    case indexKeys.STOCH_RSI:
      return StochRSI(ohlc.close, ...params);
    case indexKeys.TRIX:
      return TRIX(ohlc.close, ...params);
    case indexKeys.VOLUME_PROFILE:
      return VP(ohlc, ...params);
    case indexKeys.VWAP:
      return VWAP(ohlc);
    case indexKeys.WILLIAMS_R:
      return williamsR(ohlc, ...params);
    case indexKeys.WEMA:
      return WEMA(ohlc.close, ...params);
    case indexKeys.WMA:
      return WMA(ohlc.close, ...params);
    default:
      throw new Error(`Unknown index name: ${indexName}`);
  }
}

function SMA(closes, period = 10) {
  period = parseInt(period);
  if (closes.length <= period) return { current: false, previous: false };

  const smaResult = technicalindicators.sma({
    values: closes,
    period,
  });
  return {
    current: smaResult[smaResult.length - 1],
    previous: smaResult[smaResult.length - 2],
  };
}

function EMA(closes, period = 10) {
  period = parseInt(period);
  if (closes.length <= period) return { current: false, previous: false };

  const emaResult = technicalindicators.ema({
    values: closes,
    period,
  });
  return {
    current: emaResult[emaResult.length - 1],
    previous: emaResult[emaResult.length - 2],
  };
}

module.exports = {
  RSI,
  MACD,
  StochRSI,
  bollingerBands,
  SMA,
  EMA,
  indexKeys,
  getAnalysisIndexes,
  execCalc,
};
