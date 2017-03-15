//
//  SafariExtensionHandler.swift
//  AppExtension
//
//  Created by Jorden Hill on 3/14/17.
//  Copyright © 2017 Jorden Hill. All rights reserved.
//

import SafariServices

class SafariExtensionHandler: SFSafariExtensionHandler {
  
  var dictionary: RikaitanCore?
  
  override func messageReceived(withName messageName: String, from page: SFSafariPage, userInfo: [String : Any]?) {
    // This method will be called when a content script provided by your extension calls safari.extension.dispatchMessage("message").
    page.getPropertiesWithCompletionHandler { properties in
      NSLog("The extension received a message (\(messageName)) from a script injected into (\(properties?.url)) with userInfo (\(userInfo))")
    }
    
    switch(messageName) {
      case "Search":
        let entry = dictionary?.search(text: userInfo!["text"] as! String, dictionaryOption: userInfo!["dictOption"] as! Int);
        page.dispatchMessageToScript(withName: "Process Entry", userInfo: ["entry": entry])      
      case "Reset Dictionary":
        dictionary?.resetDictionary()
      default:
        break
    }
  }
    
  override func toolbarItemClicked(in window: SFSafariWindow) {
    // This method will be called when your toolbar item is clicked.
    NSLog("The extension's toolbar item was clicked")
    if (KeyData.instance.buttonClicked)! {
      initialize()
    } else {
      deinitialize()
    }
  }
  
  override func validateToolbarItem(in window: SFSafariWindow, validationHandler: @escaping ((Bool, String) -> Void)) {
    // This is called when Safari's state changed in some way that would require the extension's toolbar item to be validated again.
    validationHandler(true, "")
  }
    
  /*override func popoverViewController() -> RikaitanCore {
    return RikaitanCore.shared
  }*/

  func initialize() {
    dictionary = RikaitanCore()
  }
  
  func deinitialize() {
    
  }
}
