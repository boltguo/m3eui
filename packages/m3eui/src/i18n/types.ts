export type M3EBuiltInLocale = "zh-CN" | "en-US" | "ja-JP" | "ar-SA";
export type M3ELocale = M3EBuiltInLocale | (string & {});

export interface M3EMessages {
  readonly "alert.close": string;

  readonly "badge.overflow": string;
  readonly "badge.unreadCount": string;

  readonly "breadcrumb.ariaLabel": string;
  readonly "breadcrumb.more": string;

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
  readonly "chip.removeItem": string;

  readonly "collapsible.expandAll": string;
  readonly "collapsible.collapseAll": string;

  readonly "combobox.placeholder": string;
  readonly "combobox.empty": string;
  readonly "combobox.clear": string;
  readonly "combobox.toggle": string;
  readonly "command.ariaLabel": string;
  readonly "command.placeholder": string;
  readonly "command.empty": string;
  readonly "command.navigateHint": string;
  readonly "select.placeholder": string;
  readonly "select.clear": string;

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
  readonly "datePicker.prevYears": string;
  readonly "datePicker.nextYears": string;
  readonly "datePicker.selectYear": string;
  readonly "datePicker.calendarLabel": string;
  readonly "datePicker.rangeCalendarLabel": string;

  readonly "dialog.close": string;
  readonly "sheet.ariaLabel": string;
  readonly "sheet.close": string;
  readonly "toast.close": string;
  readonly "toast.viewportLabel": string;

  readonly "empty.title": string;
  readonly "empty.description": string;

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

  readonly "pagination.ariaLabel": string;
  readonly "pagination.previous": string;
  readonly "pagination.next": string;
  readonly "pagination.page": string;
  readonly "pagination.summary": string;

  readonly "searchBar.placeholder": string;
  readonly "searchBar.ariaLabel": string;
  readonly "searchBar.empty": string;
  readonly "searchBar.submit": string;
  readonly "searchBar.clear": string;

  readonly "slider.ariaLabel": string;
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
  readonly "timePicker.confirm": string;
  readonly "timePicker.cancel": string;

  readonly "topAppBar.actionsLabel": string;
  readonly "topAppBar.moreActions": string;
  readonly "bottomAppBar.ariaLabel": string;
  readonly "dragHandle.ariaLabel": string;
  readonly "pullToRefresh.pulling": string;
  readonly "pullToRefresh.release": string;
  readonly "pullToRefresh.refreshing": string;

  readonly "dockedToolbar.ariaLabel": string;
  readonly "searchView.back": string;
  readonly "searchView.recentHeading": string;
  readonly "searchView.clearRecent": string;
  readonly "searchView.suggestionsHeading": string;

  readonly "select.selectedCount": string;

  readonly "datePicker.switchToInput": string;
  readonly "datePicker.switchToCalendar": string;
  readonly "datePicker.confirm": string;
  readonly "datePicker.cancel": string;
  readonly "datePicker.dateInputLabel": string;
  readonly "datePicker.dateInputPlaceholder": string;

  readonly "dataTable.expandColumn": string;
  readonly "dataTable.expandRow": string;
  readonly "dataTable.collapseRow": string;

  readonly "avatarGroup.overflowLabel": string;

  readonly "fileUpload.dropPrompt": string;
  readonly "fileUpload.browseButton": string;
  readonly "fileUpload.dropHint": string;
  readonly "fileUpload.removeFile": string;
  readonly "fileUpload.errorMaxSize": string;
  readonly "fileUpload.errorMaxFiles": string;
  readonly "fileUpload.errorFileType": string;
  readonly "fileUpload.uploading": string;
  readonly "fileUpload.completed": string;

  readonly "copyButton.copy": string;
  readonly "copyButton.copied": string;
  readonly "copyButton.error": string;

  readonly "colorPicker.ariaLabel": string;
  readonly "colorPicker.hexLabel": string;
  readonly "colorPicker.hue": string;
  readonly "colorPicker.chroma": string;
  readonly "colorPicker.tone": string;
  readonly "colorPicker.swatchesLabel": string;
  readonly "colorPicker.derivedTones": string;
  readonly "colorPicker.toneStop": string;
}

export type M3EMessageKey = keyof M3EMessages;
export type M3EMessageOverrides = Partial<M3EMessages>;
export type M3ETranslateFn = (
  key: M3EMessageKey,
  params?: Readonly<Record<string, string | number>>,
) => string;
