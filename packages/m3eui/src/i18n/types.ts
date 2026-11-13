export type M3EBuiltInLocale = "zh-CN" | "en-US" | "ja-JP" | "ar-SA";
export type M3ELocale = M3EBuiltInLocale | (string & {});

export interface M3EMessages {
  readonly "badge.overflow": string;

  readonly "carousel.roleDescription": string;
  readonly "carousel.slideRoleDescription": string;
  readonly "carousel.slideLabel": string;
  readonly "carousel.slideAnnouncement": string;
  readonly "carousel.slideAnnouncementWithTitle": string;
  readonly "carousel.prevSlide": string;
  readonly "carousel.nextSlide": string;
  readonly "carousel.paginationLabel": string;
  readonly "carousel.goToSlide": string;
  readonly "carousel.listLabel": string;

  readonly "chip.remove": string;

  readonly "collapsible.expandAll": string;
  readonly "collapsible.collapseAll": string;

  readonly "combobox.placeholder": string;
  readonly "combobox.empty": string;
  readonly "combobox.clear": string;
  readonly "select.placeholder": string;

  readonly "dataTable.empty": string;
  readonly "dataTable.sortedAscending": string;
  readonly "dataTable.sortedDescending": string;
  readonly "dataTable.selectAllRows": string;
  readonly "dataTable.selectRow": string;

  readonly "datePicker.title": string;
  readonly "datePicker.rangeTitle": string;
  readonly "datePicker.selectEndPrompt": string;
  readonly "datePicker.prevMonth": string;
  readonly "datePicker.nextMonth": string;
  readonly "datePicker.selectYear": string;
  readonly "datePicker.calendarLabel": string;
  readonly "datePicker.rangeCalendarLabel": string;

  readonly "dialog.close": string;
  readonly "sheet.close": string;
  readonly "toast.close": string;

  readonly "fabMenu.triggerOpen": string;
  readonly "fabMenu.triggerClose": string;
  readonly "floatingToolbar.ariaLabel": string;
  readonly "splitButton.moreOptions": string;
  readonly "buttonGroup.moreActions": string;

  readonly "form.errorSummaryHeading": string;

  readonly "loading.label": string;
  readonly "progress.linearLabel": string;
  readonly "progress.circularLabel": string;
  readonly "progress.wavyLinearLabel": string;
  readonly "progress.wavyCircularLabel": string;

  readonly "menubar.ariaLabel": string;
  readonly "navigation.barLabel": string;
  readonly "navigation.railLabel": string;
  readonly "navigation.wideRailLabel": string;
  readonly "navigation.collapseRail": string;
  readonly "navigation.expandRail": string;
  readonly "navigation.drawerLabel": string;
  readonly "navigation.suiteLabel": string;
  readonly "navigation.siteMenuLabel": string;

  readonly "numberField.decrement": string;
  readonly "numberField.increment": string;
  readonly "otpField.digitLabel": string;

  readonly "searchBar.placeholder": string;
  readonly "searchBar.ariaLabel": string;
  readonly "searchBar.empty": string;
  readonly "searchBar.submit": string;
  readonly "searchBar.clear": string;

  readonly "slider.rangeStart": string;
  readonly "slider.rangeEnd": string;

  readonly "textField.errorIcon": string;
  readonly "textField.clear": string;
  readonly "textField.showPassword": string;
  readonly "textField.hidePassword": string;
  readonly "textField.defaultInvalid": string;
  readonly "textField.textareaDefaultInvalid": string;

  readonly "timePicker.title": string;
  readonly "timePicker.switchToKeyboard": string;
  readonly "timePicker.switchToDial": string;
  readonly "timePicker.hour": string;
  readonly "timePicker.minute": string;
  readonly "timePicker.hourShort": string;
  readonly "timePicker.minuteShort": string;
  readonly "timePicker.periodLabel": string;
  readonly "timePicker.selectHour": string;
  readonly "timePicker.selectMinute": string;
  readonly "timePicker.hourDial": string;
  readonly "timePicker.minuteDial": string;
  readonly "timePicker.am": string;
  readonly "timePicker.pm": string;

  readonly "topAppBar.actionsLabel": string;
}

export type M3EMessageKey = keyof M3EMessages;
export type M3EMessageOverrides = Partial<M3EMessages>;
