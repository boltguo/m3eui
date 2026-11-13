export type M3EBuiltInLocale = "zh-CN" | "en-US" | "ja-JP" | "ar-SA";
export type M3ELocale = M3EBuiltInLocale | (string & {});

/**
 * Complete dictionary of user-facing UI labels, accessible names, live-region
 * announcements, and placeholders used across all `m3eui` components.
 * Zero UI copy is hardcoded inside component implementations.
 */
export interface M3EMessages {
  // Carousel
  readonly "carousel.slideAnnouncement": string;
  readonly "carousel.prevSlide": string;
  readonly "carousel.nextSlide": string;
  readonly "carousel.paginationLabel": string;
  readonly "carousel.goToSlide": string;
  readonly "carousel.listLabel": string;

  // Chip
  readonly "chip.remove": string;

  // Collapsible & Accordion
  readonly "collapsible.expandAll": string;
  readonly "collapsible.collapseAll": string;

  // Combobox & Select
  readonly "combobox.placeholder": string;
  readonly "combobox.empty": string;
  readonly "combobox.clear": string;
  readonly "select.placeholder": string;

  // DataTable
  readonly "dataTable.empty": string;
  readonly "dataTable.sortedAscending": string;
  readonly "dataTable.sortedDescending": string;
  readonly "dataTable.selectAllRows": string;
  readonly "dataTable.selectRow": string;

  // DatePicker & DateRangePicker
  readonly "datePicker.title": string;
  readonly "datePicker.rangeTitle": string;
  readonly "datePicker.selectEndPrompt": string;
  readonly "datePicker.prevMonth": string;
  readonly "datePicker.nextMonth": string;
  readonly "datePicker.selectYear": string;
  readonly "datePicker.calendarLabel": string;
  readonly "datePicker.rangeCalendarLabel": string;

  // Dialog, Sheet & Toast
  readonly "dialog.close": string;
  readonly "sheet.close": string;
  readonly "toast.close": string;

  // FABMenu & SplitButton
  readonly "fabMenu.triggerOpen": string;
  readonly "fabMenu.triggerClose": string;
  readonly "splitButton.moreOptions": string;

  // Form
  readonly "form.errorSummaryHeading": string;

  // Loading & Progress
  readonly "loading.label": string;
  readonly "progress.linearLabel": string;
  readonly "progress.circularLabel": string;
  readonly "progress.wavyLinearLabel": string;
  readonly "progress.wavyCircularLabel": string;

  // Menubar & Navigation
  readonly "menubar.ariaLabel": string;
  readonly "navigation.barLabel": string;
  readonly "navigation.railLabel": string;
  readonly "navigation.wideRailLabel": string;
  readonly "navigation.collapseRail": string;
  readonly "navigation.expandRail": string;
  readonly "navigation.drawerLabel": string;
  readonly "navigation.suiteLabel": string;
  readonly "navigation.siteMenuLabel": string;

  // NumberField & OTPField
  readonly "numberField.decrement": string;
  readonly "numberField.increment": string;
  readonly "otpField.digitLabel": string;

  // SearchBar
  readonly "searchBar.placeholder": string;
  readonly "searchBar.ariaLabel": string;
  readonly "searchBar.empty": string;
  readonly "searchBar.submit": string;
  readonly "searchBar.clear": string;

  // Slider
  readonly "slider.rangeStart": string;
  readonly "slider.rangeEnd": string;

  // TextField
  readonly "textField.errorIcon": string;
  readonly "textField.clear": string;
  readonly "textField.showPassword": string;
  readonly "textField.hidePassword": string;
  readonly "textField.defaultInvalid": string;
  readonly "textField.textareaDefaultInvalid": string;

  // TimePicker
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

  // TopAppBar
  readonly "topAppBar.actionsLabel": string;
}

export type M3EMessageKey = keyof M3EMessages;
export type M3EMessageOverrides = Partial<M3EMessages>;
