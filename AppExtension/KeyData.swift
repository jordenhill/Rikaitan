//
//  Constants.swift
//  Rikaitan
//
//  Created by Jorden Hill on 3/14/17.
//  Copyright © 2017 Jorden Hill. All rights reserved.
//

import Foundation

final class KeyData {
  static let instance = KeyData()
  var view: Int?
  var buttonClicked: Bool?
  var config: [String]?
  let halfWidthKatakana: Array<Any>?
  let voicedKatakana: Array<Any>?
  let semivoicedKatakana: Array<Any>?
  let defaultDictionary: Int?
  let numDictionaries: Int?
  //var extensionEnabled: 0,
  let forceKanji: Int?
  let haveNames: Bool?
  let kanjiMode: Int?
  let namesMode: Int?
  let nextDictionary: Int?
  let dictionaryList: [String]?
  let miniHelpHTMLText: String?
  let sameDictionary: Int?
  let sanseidoState: Int?
  let showMode: Int?
  
  private init() {
    view = 0
    buttonClicked = false
    config = [String]()
    halfWidthKatakana = [0x3092,0x3041,0x3043,0x3045,0x3047,0x3049,0x3083,0x3085,0x3087,0x3063,
                      0x30FC,0x3042,0x3044,0x3046,0x3048,0x304A,0x304B,0x304D,0x304F,0x3051,
                      0x3053,0x3055,0x3057,0x3059,0x305B,0x305D,0x305F,0x3061,0x3064,0x3066,
                      0x3068,0x306A,0x306B,0x306C,0x306D,0x306E,0x306F,0x3072,0x3075,0x3078,
                      0x307B,0x307E,0x307F,0x3080,0x3081,0x3082,0x3084,0x3086,0x3088,0x3089,
                      0x308A,0x308B,0x308C,0x308D,0x308F,0x3093]
    voicedKatakana = [0x30F4,0xFF74,0xFF75,0x304C,0x304E,0x3050,0x3052,0x3054,0x3056,0x3058,
                      0x305A,0x305C,0x305E,0x3060,0x3062,0x3065,0x3067,0x3069,0xFF85,0xFF86,
                      0xFF87,0xFF88,0xFF89,0x3070,0x3073,0x3076,0x3079,0x307C]
    semivoicedKatakana = [0x3071,0x3074,0x3077,0x307A,0x307D]
    defaultDictionary = 2
    numDictionaries = 3
    //extensionEnabled = 0
    forceKanji = 1
    haveNames = true
    
    kanjiMode = 1
    namesMode = 2
    nextDictionary = 3
    dictionaryList = ["H",	"Halpern", "L",	"Heisig", "E",	"Henshall", "DK",
                      "Kanji Learners Dictionary", "N",	"Nelson", "V",	"New Nelson", "Y",
                      "PinYin", "P",	"Skip Pattern", "IN",	"Tuttle Kanji &amp; Kana", "I",
                      "Tuttle Kanji Dictionary", "U",	"Unicode"]
    miniHelpHTMLText = "<span style=\"font-weight:bold\">Rikaitan enabled!</span><br><br>" +
                       "<table cellspacing=5>" +
                       "<tr><td>A</td><td>Alternate popup location</td></tr>" +
                       "<tr><td>Y</td><td>Move popup location down</td></tr>" +
                       "<tr><td>D</td><td>Hide/show definitions</td></tr>" +
                       "<tr><td>Shift/Enter&nbsp;&nbsp;</td><td>Switch dictionaries</td></tr>" +
                       "<tr><td>B</td><td>Previous character</td></tr>" +
                       "<tr><td>H</td><td>Hide/show popups</td></tr>" +
                       "<tr><td>M</td><td>Next character</td></tr>" +
                       "<tr><td>N</td><td>Next word</td></tr>" +
                       "<tr><td>O</td><td>Super-sticky mode</td></tr>" +
                       "<tr><td>S</td><td>Change definition source</td></tr>" +
                       "</table>"
    sameDictionary = 0
    sanseidoState = 0
    showMode = 0
  }
}
