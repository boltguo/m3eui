import * as React from "react";
import { act } from "react";
import { describe, expect, it } from "vitest";
import { PausedWrapper, setupDomTest } from "../../__tests__/domHarness.js";
import { M3EProvider } from "../../context/M3EProvider.js";
import {
  arSAMessages,
  enUSMessages,
  zhCNMessages,
} from "../../i18n/index.js";
import { SearchBar, SearchView } from "./SearchBar.js";

describe("SearchBar & SearchView", () => {
  const dom = setupDomTest();

  it("renders clear button in SearchBar and primary language subtag placeholder fallbacks", () => {
    act(() => {
      dom.root.render(
        <div>
          <div data-testid="en">
            <PausedWrapper locale="en-US">
              <SearchBar defaultValue="spring" />
            </PausedWrapper>
          </div>
          <div data-testid="tw">
            <PausedWrapper locale="zh-TW">
              <SearchBar />
            </PausedWrapper>
          </div>
          <div data-testid="eg">
            <PausedWrapper locale="ar-EG" direction="auto">
              <SearchBar />
            </PausedWrapper>
          </div>
          <div data-testid="fr">
            <PausedWrapper locale="fr-CA">
              <SearchBar />
            </PausedWrapper>
          </div>
        </div>,
      );
    });

    expect(
      dom.container.querySelector('[data-testid="en"] button[aria-label="Clear search query"]'),
    ).not.toBeNull();
    expect(
      dom.container.querySelector<HTMLInputElement>('[data-testid="tw"] input')
        ?.placeholder,
    ).toBe(zhCNMessages["searchBar.placeholder"]);
    expect(
      dom.container.querySelector<HTMLInputElement>('[data-testid="eg"] input')
        ?.placeholder,
    ).toBe(arSAMessages["searchBar.placeholder"]);
    expect(
      dom.container.querySelector<HTMLInputElement>('[data-testid="fr"] input')
        ?.placeholder,
    ).toBe(enUSMessages["searchBar.placeholder"]);
  });

  it("handles SearchView recentSearches, clear action, submission, and anchorRef focus restoration", async () => {
    let clearedRecent = false;
    let submittedSearch = "";

    act(() => {
      dom.root.render(
        <PausedWrapper locale="zh-CN">
          <SearchView
            open
            recentSearches={["MaterialShapes", "HCT 色彩"]}
            onClearRecent={() => {
              clearedRecent = true;
            }}
            suggestions={[{ value: "btn", label: "Button 按钮", category: "动作" }]}
            onSearchSubmit={(q) => {
              submittedSearch = q;
            }}
          />
        </PausedWrapper>,
      );
    });

    const searchView = document.body.querySelector<HTMLElement>(
      ".m3e-search-view__modal-popup .m3e-search-view",
    );
    expect(searchView?.querySelector('form[role="search"]')).not.toBeNull();
    const recentList = searchView?.querySelector('ul[role="listbox"]');
    expect(recentList).not.toBeNull();
    const clearRecentBtn = searchView?.querySelector<HTMLButtonElement>(
      ".m3e-search-view__clear-recent",
    );
    act(() => {
      clearRecentBtn?.click();
    });
    expect(clearedRecent).toBe(true);

    const recentBtn = searchView?.querySelector<HTMLButtonElement>(
      ".m3e-search-view__item",
    );
    act(() => {
      recentBtn?.click();
    });
    expect(submittedSearch).toBe("MaterialShapes");

    function AnchorHarness() {
      const searchBarRef = React.useRef<HTMLFormElement | null>(null);
      const [searchOpen, setSearchOpen] = React.useState(false);

      return (
        <M3EProvider syncDocumentRoot={false}>
          <div onClick={() => setSearchOpen(true)}>
            <SearchBar ref={searchBarRef} placeholder="Search workspace" />
          </div>
          <SearchView
            open={searchOpen}
            onOpenChange={setSearchOpen}
            anchorRef={searchBarRef}
          >
            <div>Suggestions</div>
          </SearchView>
        </M3EProvider>
      );
    }

    act(() => {
      dom.root.render(<AnchorHarness />);
    });

    const searchInput = dom.container.querySelector<HTMLInputElement>(
      ".m3e-search-bar__input",
    )!;
    expect(searchInput).not.toBeNull();
    act(() => {
      searchInput.click();
    });
    const searchPopup = document.body.querySelector<HTMLElement>(".m3e-search-view")!;
    expect(searchPopup).not.toBeNull();
    const backBtn = searchPopup.querySelector<HTMLButtonElement>(
      ".m3e-search-view__back",
    )!;
    await act(async () => {
      backBtn.click();
    });
    expect(document.activeElement).toBe(searchInput);
  });
});
